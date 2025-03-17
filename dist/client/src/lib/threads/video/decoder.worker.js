import { VIDEO_DECODER_DEFAULT_CONFIG } from "$lib/config";
import { Mogger } from "$lib/utils/mogger";
class MoQTVideoDecoder {
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
        this.decoder = new VideoDecoder({
            output: (frame) => postMessage({ type: 'videoFrame', data: { subscribeId: this.subscribe.subscribeId, frame } }),
            error: (error) => Mogger.error('VideoDecoder error', error.message)
        });
        this.decoder.configure(VIDEO_DECODER_DEFAULT_CONFIG);
    }
    decode({ encodedVideoChunk, config }) {
        if (config)
            this.decoder.configure(config);
        this.decoder.decode(encodedVideoChunk);
    }
}
const decoderInstance = new MoQTVideoDecoder();
self.addEventListener('message', decoderInstance.onMessage.bind(decoderInstance));
