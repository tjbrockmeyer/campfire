import { Elm } from "../../elm-ui/src/Main.elm";

(() => {
    const id = 'elm-app';
    const node = document.getElementById(id);
    if (node === null) {
        console.error(`cannot find node with id of '${id}'`);
        return;
    }
    const app = Elm.Main.init({ flags: '', node });
    app.ports.sendMessage.subscribe(msg => {
        switch (msg.type) {
            case 'SetMuteState':
                console.log('mute state:', msg.state);
                break;
            case 'SetPlayingState':
                console.log('playing state:', msg.state);
                break;
            case 'SetRecordingState':
                console.log('recording state:', msg.state);
                break;
            default:
                console.error('message type is not supported:', msg);
                break;
        }
    });
})()