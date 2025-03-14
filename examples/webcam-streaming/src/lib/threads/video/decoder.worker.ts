import { Mogger } from "$lib/utils/mogger";
import { deserializeEncodedChunk, deserializeSubgroupObjectHeader, type Subscribe } from "../../../temp";

// video decoder thread
class MoQTVideoDecoder {
  private reader: ReadableStream;
  private subscribe: Subscribe;
  private state: 'init' | 'decoding' | 'stopped' = 'stopped';

  onMessage(event: MessageEvent) {
    const data = event.data as ThreadMessage;
    switch(data.type) {
      case 'init':
        this.subscribe = data.data;
        this.state = 'init';
        break;
      case 'registerStream':
        this.reader = data.data as ReadableStream;
      case 'decode':
        this.decode();
        break;
      case 'stopDecoding':
        this.state = 'stopped';
        break;
    }
  }

  async decode() {
    this.state = 'decoding';
    const decoder = new VideoDecoder({
      output: (frame: VideoFrame) => postMessage({ type: 'videoFrame', data: { subscribeId: this.subscribe.subscribeId, frame }}),
      error: (error: DOMException) => Mogger.error('VideoDecoder error', error.message)
    });
    while(this.state === 'decoding') {
      const object = await deserializeSubgroupObjectHeader(this.reader);
      // TODO: some object validations
      const encodedVideoChunkInit = await deserializeEncodedChunk(this.reader);
      const chunk = new EncodedVideoChunk(encodedVideoChunkInit);
      decoder.decode(chunk);
    }
  }
}

const decoder = new MoQTVideoDecoder();
self.addEventListener('message', decoder.onMessage.bind(decoder));

export {};
