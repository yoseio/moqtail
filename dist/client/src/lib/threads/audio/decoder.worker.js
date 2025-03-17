import { AUDIO_DECODER_DEFAULT_CONFIG } from "$lib/config";
import { Mogger } from "$lib/utils/mogger";
class MoQTAudioDecoder {
    onMessage(message) {
        const data = message.data;
        const handlers = {
            init: this.init.bind(this),
            decode: this.decode.bind(this),
        };
        const handler = handlers[data.type];
        if (!handler) {
            postMessage({ type: 'error', data: `Unknown message type: ${data.type}` });
            return;
        }
        handler(data.data);
    }
    init(subscribe) {
        this.subscribe = subscribe;
        this.decoder = new AudioDecoder({
            output: this.handleAudioData.bind(this),
            error: (error) => Mogger.error('AudioDecoder error', error.message)
        });
        this.decoder.configure(AUDIO_DECODER_DEFAULT_CONFIG);
    }
    handleAudioData(audioData) {
        postMessage({ type: 'audioData', data: { audioData } });
    }
    decode({ encodedAudioChunk, config }) {
        if (config)
            this.decoder.configure(config);
        this.decoder.decode(encodedAudioChunk);
    }
}
const ad = new MoQTAudioDecoder();
self.addEventListener('message', ad.onMessage.bind(ad));
