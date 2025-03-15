import { VIDEO_DECODER_DEFAULT_CONFIG } from "$lib/config";
import { Mogger } from "$lib/utils/mogger";
import type { SubgroupObject, Subscribe } from "../../../temp";

class MoQTVideoDecoder {
  private subscribe: Subscribe;
  private decoder: VideoDecoder;

  onMessage(message: MessageEvent) {
    const data = message.data as ThreadMessage;
    const handlers: { [key: string]: (data: any) => void } = {
      init: this.init.bind(this),
      setDecoderConfig: this.setDecoderConfig.bind(this),
      decode: this.decode.bind(this),
    };
    const handler = handlers[data.type];
    if (!handler) {
      postMessage({ type: 'error', data: `Unknown message type: ${data.type}` });
      return;
    }
    handler(data.data);
  }

  init(subscribe: Subscribe) {
    this.subscribe = subscribe;
    this.decoder = new VideoDecoder({
      output: (frame: VideoFrame) => postMessage({ type: 'videoFrame', data: { subscribeId: this.subscribe.subscribeId, frame }}),
      error: (error: DOMException) => Mogger.error('VideoDecoder error', error.message)
    });
    this.decoder.configure(VIDEO_DECODER_DEFAULT_CONFIG);
  }

  setDecoderConfig(config: VideoDecoderConfig) {
    this.decoder.configure(config);
  }

  decode({ header, encodedVideoChunkInit }: { header: SubgroupObject, encodedVideoChunkInit: EncodedVideoChunkInit }) {
    // TODO: some header validation
    Mogger.debug('Decoding video chunk');
    const chunk = new EncodedVideoChunk(encodedVideoChunkInit);
    this.decoder.decode(chunk);
  }
}

const decoderInstance = new MoQTVideoDecoder();
self.addEventListener('message', decoderInstance.onMessage.bind(decoderInstance));

export {};
