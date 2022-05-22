import { getMicrophone, Microphone } from "./userMedia";

export type AppState = {
    microphone: Microphone;
    recordedAudio: HTMLAudioElement | undefined;
}

export const initState = async (): Promise<AppState> => {
    const microphone = await getMicrophone();
    return {
        microphone,
        recordedAudio: undefined,
    };
}
