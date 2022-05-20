/*
    Wildcard module declaration to allow import of Elm files
*/
declare module "*.elm" {

    type ElmFlags = {

    };
    
    type MsgToElm = {
        type: 'Message';
        message: string;
    };
    
    type MsgFromElm = {
        type: 'SetMuteState';
        state: boolean;
    } | {
        type: 'SetRecordingState';
        state: boolean;
    } | {
        type: 'SetPlayingState';
        state: boolean;
    };
    
    type ElmApp = {
        ports: {
            sendMessage: {
                subscribe: (callback: (message: MsgFromElm) => void) => void;
            },
            receiveMessage: {
                send: (params: MsgToElm) => void;
            }
        };
    };

    export const Elm: {
        Main: {
            init: (options: {
                flags: ElmFlags;
                node?: HTMLElement;
            }) => ElmApp;
        }
    };
}
