/*
    Wildcard module declaration to allow import of Elm files
*/
declare module "*.elm" {

    export type ElmFlags = {

    };
    
    export type MsgToElm = {
        type: 'Message';
        message: string;
    };
    
    export type MsgFromElm = {
        type: 'SetMuteState';
        state: boolean;
    } | {
        type: 'SetRecordingState';
        state: boolean;
    } | {
        type: 'SetPlayingState';
        state: boolean;
    };
    
    export type ElmApp = {
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
                node: HTMLElement;
            }) => ElmApp;
        }
    };
}
