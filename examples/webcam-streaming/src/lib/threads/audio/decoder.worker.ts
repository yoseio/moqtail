import { Mogger } from "$lib/utils/mogger";
import { deserializeEncodedChunk, deserializeSubgroupObjectHeader, type Subscribe } from "../../../temp";

// video decoder thread
class MoQTAudioDecoder {
  private reader: ReadableStreamDefaultReader;
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
        const stream = data.data as ReadableStream;
        this.reader = stream.getReader();
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
      output: (frame: VideoFrame) => postMessage({ type: 'frame', data: frame }),
      error: (error: DOMException) => Mogger.error('VideoDecoder error', error.message)
    });
    while(this.state === 'decoding') {
      const { done, value: readableSteram }: { done: boolean, value?: ReadableStream } = await this.reader.read();
      const object = await deserializeSubgroupObjectHeader(readableSteram as ReadableStream);
      // TODO: some object validations
      const encodedVideoChunkInit = await deserializeEncodedChunk(readableSteram);
      const chunk = new EncodedVideoChunk(encodedVideoChunkInit);
      decoder.decode(chunk);
      this.reader.releaseLock();
    }
  }
}

const decoder = new MoQTAudioDecoder();
self.addEventListener('message', decoder.onMessage.bind(decoder));

export {};
