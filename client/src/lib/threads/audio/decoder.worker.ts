import { AUDIO_DECODER_DEFAULT_CONFIG } from '$lib/config';
import { Mogger } from '$lib/utils/mogger';
import type { Subscribe } from 'moqtail';

class MoQTAudioDecoder {
  private subscribe: Subscribe;
  private decoder: AudioDecoder;
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
    this.decoder = new AudioDecoder({
      output: this.handleAudioData.bind(this),
      error: (error: DOMException) => Mogger.error('AudioDecoder error', error.message)
    });
    this.decoder.configure(AUDIO_DECODER_DEFAULT_CONFIG);
  }
  handleAudioData(audioData: AudioData) {
    // @ts-ignore audioData is not included in the Transferable type yet, but it should be
    postMessage({ type: 'audioData', data: { audioData } }, [audioData]);
  }
  decode({ encodedAudioChunk, config }: { encodedAudioChunk: EncodedAudioChunk, config?: AudioDecoderConfig }) {
    if (config) this.decoder.configure(config);
    this.decoder.decode(encodedAudioChunk);
  }
}

const ad = new MoQTAudioDecoder();
self.addEventListener('message', ad.onMessage.bind(ad));

export {};
