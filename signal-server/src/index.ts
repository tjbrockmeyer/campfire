//#!/usr/bin/env node
//
// WebSocket chat server
// Implemented using Node.js
//
// Requires the websocket module.
//
// WebSocket and WebRTC based multi-user chat sample with two-way video
// calling, including use of TURN if applicable or necessary.
//
// This file contains the JavaScript code that implements the server-side
// functionality of the chat system, including user ID management, message
// reflection, and routing of private messages, including support for
// sending through unknown JSON objects to support custom apps and signaling
// for WebRTC.
//
// Requires Node.js and the websocket module (WebSocket-Node):
//
//  - http://nodejs.org/
//  - https://github.com/theturtle32/WebSocket-Node
//
// To read about how this sample works:  http://bit.ly/webrtc-from-chat
//
// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

import https from 'https';
import fs from 'fs';
import { connection, server as WebSocketServer } from 'websocket';

const keyFilePath = "/etc/pki/tls/private/mdn-samples.mozilla.org.key";
const certFilePath = "/etc/pki/tls/certs/mdn-samples.mozilla.org.crt";

type Connection = {
    base: connection;
    username: string;
    clientID: number;
}

type ServerMessage = {
    type: 'userlist';
    users: string[];
} | {
    type: 'id';
    id: number;
} | {
    type: 'message';
    username: string;
    text: string;
} | {
    type: 'rejectusername';
    username: string;
};

type ClientMessage = {
    id: number;
} & (
        {
            type: 'message';
            message: string;
            target?: string;
        } | {
            type: 'username';
            username: string;
        }
    )

const sendMsg = (conn: Connection, msg: ServerMessage): void => {
    conn.base.sendUTF(JSON.stringify(msg));
}

let connectionArray: Connection[] = [];
let nextID = Date.now();
let appendToMakeUnique = 1;

// Output logging information to console

const log = (text: string): void => {
    const time = new Date();
    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

// If you want to implement support for blocking specific origins, this is
// where you do it. Just return false to refuse WebSocket connections given
// the specified origin.
const originIsAllowed = (origin: string): boolean => {
    return true;    // We will accept all connections
}

// Scans the list of users and see if the specified name is unique. If it is,
// return true. Otherwise, returns false. We want all users to have unique
// names.
const isUsernameUnique = (name: string): boolean => {
    return connectionArray.some(x => x.username === name);
}


const broadcast = (msg: ServerMessage): void => {
    connectionArray.forEach(x => sendMsg(x, msg));
}

// Sends a message to a single
// user, given their username. We use this for the WebRTC signaling,
// and we could use it for private text messaging.
const sendToOneUser = (target: string, msg: ServerMessage): void => {
    const conn = connectionArray.find(x => x.username === target);
    if (conn) {
        sendMsg(conn, msg)
    }
}

// Scan the list of connections and return the one for the specified
// clientID. Each login gets an ID that doesn't change during the session,
// so it can be tracked across username changes.
const getConnectionForID = (id: number): Connection | undefined => {
    return connectionArray.find(x => x.clientID === id);
}

const getUsernameForID = (id: number): string | undefined => {
    return connectionArray.find(x => x.clientID === id)?.username;
}

// Builds a message object of type "userlist" which contains the names of
// all connected users. Used to ramp up newly logged-in users and,
// inefficiently, to handle name change notifications.
const makeUserListMessage = (): ServerMessage => {
    return {
        type: 'userlist',
        users: connectionArray.map(c => c.username),
    };
}

// Sends a "userlist" message to all chat members. This is a cheesy way
// to ensure that every join/drop is reflected everywhere. It would be more
// efficient to send simple join/drop messages to each user, but this is
// good enough for this simple example.
const sendUserListToAll = () => {
    const userListMsg = makeUserListMessage();
    connectionArray.forEach(x => sendMsg(x, userListMsg));
}


// Try to load the key and certificate files for SSL so we can
// do HTTPS (required for non-local WebRTC).

const httpsOptions = {
    key: fs.readFileSync(keyFilePath, 'utf-8'),
    cert: fs.readFileSync(certFilePath, 'utf-8')
};
const server = https.createServer(httpsOptions);
server.listen(6503, function () {
    log("Server is listening on port 6503");
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        log("Connection from " + request.origin + " rejected.");
        return;
    }
    const conn: Connection = {
        base: request.accept("json", request.origin),
        clientID: nextID,
        username: '<unknown>'
    };
    nextID++;
    connectionArray.push(conn);
    log("Connection accepted from " + conn.base.remoteAddress + ".");

    sendMsg(conn, { type: "id", id: conn.clientID })
    conn.base.on('message', function (message) {
        if (message.type !== 'utf8') {
            log(`invalid message from client - must be type of utf-8 - found: ${message.type}`);
            return;
        }
        const sendToClients = true;
        const msg = JSON.parse(message.utf8Data) as ClientMessage;
        const connect = getConnectionForID(msg.id);
        if(connect === undefined) {
            log(`message is missing required field 'id': ${JSON.stringify(msg)}`);
            return;
        }
        const messageUsername = getUsernameForID(msg.id) as string;
        log(`received message from ${messageUsername}`);

        switch (msg.type) {
            // Public, textual message
            case "message":
                const outMessage: ServerMessage = {
                    type: 'message',
                    username: messageUsername,
                    text: msg.message.replace(/(<([^>]+)>)/ig, ""),
                };
                if(msg.target) {
                    sendToOneUser(msg.target, outMessage)
                } else {
                    broadcast(outMessage);
                }
                break;

            // Username change
            case "username":
                const origName = msg.username;
                if(!isUsernameUnique(msg.username)) {
                    let i = 0;
                    do {
                        i++;
                        msg.username = origName + i;
                    } while(!isUsernameUnique(msg.username));
                    sendMsg(connect, {
                        type: "rejectusername",
                        username: msg.username
                    });
                }

                // Set this connection's final username and send out the
                // updated user list to all users. Yeah, we're sending a full
                // list instead of just updating. It's horribly inefficient
                // but this is a demo. Don't do this in a real app.
                connect.username = msg.username;
                sendUserListToAll();
                break;
            default:
                log(`invalid message type: ${JSON.stringify(msg)}`);
        }
    });

    // Handle the WebSocket "close" event; this means a user has logged off
    // or has been disconnected.
    conn.base.on('close', function (reason, description) {
        // First, remove the connection from the list of connections.
        connectionArray = connectionArray.filter((c) => c.base.connected);
        sendUserListToAll();

        let logMessage = `connection closed: ${conn.base.remoteAddress} (${reason})`;
        if (description !== null && description.length !== 0) {
            logMessage += ": " + description;
        }
        logMessage += ")";
        log(logMessage);
    });
});