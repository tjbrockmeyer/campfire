import type { AppState } from './appState';
import { MsgFromElm, MsgToElm, Elm } from '../../elm-ui/src/Main.elm';

export type MsgSender = (msg: MsgToElm) => void;

export type MsgHandler = (msg: MsgFromElm, state: AppState, send: MsgSender) => Promise<void>;

type Options = Parameters<typeof Elm['Main']['init']>[0];

export const init = (options: Options, state: AppState, handler: MsgHandler): void => {
    const app = Elm.Main.init(options);
    const send: MsgSender = (msg) => app.ports.receiveMessage.send(msg);
    app.ports.sendMessage.subscribe((msg) => handler(msg, state, send));
}
