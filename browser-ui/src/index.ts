import { initState } from "./appState";
import { messageHandler } from "./handleMessage";
import { init } from "./elmApp";

(async () => {
    const id = 'elm-app';
    const node = document.getElementById(id);
    if (node === null) {
        console.error(`cannot find node with id of '${id}'`);
        return;
    }
    const state = await initState();
    init({flags: '', node}, state, messageHandler);
})().catch(error => {
    console.error(error);
    document.write(`failed to initialize the page because of the following error: ${error}`);
});
