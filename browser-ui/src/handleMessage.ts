import { MsgHandler } from './elmApp';

export const messageHandler: MsgHandler = async (msg, state, send) => {
    try {
        switch (msg.type) {
            case 'SetMuteState':
                state.microphone.setMuteState(msg.state);
                break;
            case 'SetPlayingState':
                if(state.recordedAudio === undefined) {
                    break;
                }
                if(msg.state) {
                    state.recordedAudio.play();
                } else {
                    state.recordedAudio.pause();
                }
                break;
            case 'SetRecordingState':
                if(msg.state) {
                    state.microphone.startRecording();
                } else {
                    const blob = await state.microphone.stopRecording();
                    const url = URL.createObjectURL(blob);
                    state.recordedAudio = new Audio(url);
                }
                break;
            case 'SetUsername':
                break;
            default:
                send({type: 'Message', message: 'JS message handler encountered an unsupported message type'});
                console.error('message type is not supported:', msg);
                break;
        }
    } catch (error) {
        send({type: 'Message', message: `JS message handler threw an error: ${error}`});
        console.error('message handler threw an error\n\tmessage:', msg, '\n\terror:', error);
    }
};