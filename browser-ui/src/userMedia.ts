
export type MediaError = {
    mediaError: 'constraint';
    error: OverconstrainedError;
} | {
    mediaError: 'unsupported',
} | {
    mediaError: 'other';
    error: Error;
}

export type Microphone = {
    setMuteState: (state: boolean) => void;
    startRecording: () => void;
    stopRecording: () => Promise<Blob>;
    disconnect: () => void;
}

export const isMediaError = (value: unknown): value is MediaError => {
    return typeof value === 'object' && value !== null && 'mediaError' in value;
}

export const getMicrophone = async (): Promise<Microphone> => {
    const stream = await getMedia({ audio: true });
    const tracks = stream.getAudioTracks();
    if (tracks.length === 0) {
        throw { mediaError: 'other', error: new Error('failed to find any tracks') };
    }
    const track = tracks[0];

    let audioChunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorder.addEventListener('start', () => audioChunks = []);
    recorder.addEventListener('dataavailable', event => audioChunks.push(event.data));

    return {
        setMuteState: (state) => track.enabled = !state,
        startRecording: () => recorder.start(),
        stopRecording: async () => {
            return new Promise((resolve, reject) => {
                const onStop = () => {
                    recorder.removeEventListener('stop', onStop);
                    resolve(new Blob(audioChunks));
                };
                recorder.addEventListener('stop', onStop);
                recorder.stop();
            });
        },
        disconnect: () => {
            track.stop();
            stream.removeTrack(track);
        }
    }
}

const getMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    try {
        if (navigator.mediaDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
            throw { errorType: 'unsupported' };
        }
        return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
        if (error instanceof OverconstrainedError) {
            throw { errorType: 'constraint', error };
        }
        if (error instanceof Error) {
            throw { errorType: 'other', error };
        }
        throw { errorType: 'other', error: new Error(JSON.stringify(error)) };
    }
}