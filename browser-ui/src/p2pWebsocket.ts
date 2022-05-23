import 'webrtc-adapter';

export const p2pWebsocket = async () => {
    // We will create our peer connection informing the ICE servers.
    const servers: RTCConfiguration = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ], // free STUN servers provided by Google
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const peerConnection = new RTCPeerConnection(servers);

    // Send ICE candidates to Signaling Server
    peerConnection.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
            // send the `event.candidate` to your Signaling Server
        }
    });

    // Create local stream requesting access to video and audio
    const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });

    // Create remote stream using the MediaStream interface
    const remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    peerConnection.addEventListener("track", (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    });
}
