import { Mogger } from "$lib/utils/mogger";
// should rename this to capturer and encoder
class MoQTAudioEncoder {
    constructor() {
        this.state = 'stopped';
        this.chunkCount = 0;
    }
    onMessage(event) {
        const data = event.data;
        switch (data.type) {
            case 'init':
                this.track = data.data;
                this.state = 'init';
                break;
            case 'capture':
                this.capture(data.data);
                break;
            case 'encode':
                this.encode();
                break;
            case 'stop':
                this.state = 'stopped';
        }
    }
    capture(readable) {
        this.state = 'capturing';
        Mogger.info(`Capturing audio track: ${this.track.name}`);
        this.reader = readable.getReader();
    }
    async encode() {
        this.state = 'encoding';
        const encoder = new AudioEncoder({
            output: (chunk, metadata) => this.handleChunk(chunk, metadata),
            error: (error) => Mogger.error('VideoEncoder error', error.message)
        });
        const encoderConfig = this.track.encoderConfig;
        encoder.configure(encoderConfig.encoderConfig);
        while (this.state === 'encoding') {
            const { done, value } = await this.reader.read();
            if (done)
                break;
            encoder.encode(value);
            this.chunkCount++;
            value.close();
        }
    }
    handleChunk(chunk, metadata) {
        postMessage({ type: 'audioChunk', data: { trackName: this.track.name, chunk, metadata } });
    }
}
const encoder = new MoQTAudioEncoder();
self.addEventListener('message', encoder.onMessage.bind(encoder));
