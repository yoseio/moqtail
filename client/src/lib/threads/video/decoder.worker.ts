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

  decode({ encodedVideoChunk, config }: { encodedVideoChunk: EncodedVideoChunk, config?: VideoDecoderConfig }) {
    try {
      // if (config) {
      //   console.log('configured', config);
      //   this.decoder.configure(config);
      // }
      console.log(this.decoder.state, encodedVideoChunk.type);
      this.decoder.decode(encodedVideoChunk);
    } catch (error) {
      Mogger.error('VideoDecoder error', error.message);
    }
  }
}

const decoderInstance = new MoQTVideoDecoder();
self.addEventListener('message', decoderInstance.onMessage.bind(decoderInstance));

export {};
