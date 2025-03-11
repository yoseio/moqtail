import { Mogger } from "$lib/utils/mogger";

interface StreamMessageData {
  mediaStreamTrack: MediaStreamTrack
}

// should rename this to capturer and encoder
class MoQTAudioEncoder {
  private reader: ReadableStreamDefaultReader<AudioData>;
  private track: Track
  private state: 'init' | 'capturing' | 'encoding' | 'stopped' = 'stopped';
  private chunkCount = 0;

  onMessage(event: MessageEvent) {
    const data = event.data as ThreadMessage;
    switch (data.type) {
      case 'init':
        this.track = data.data;
        this.state = 'init';
        break;
      case 'capture':
        this.capture(data.data);
        break;
      case 'encode':
        this.encode(data.data);
        break;
    }
  }

  capture(readable: ReadableStream<AudioData>) {
    this.state = 'capturing';
    Mogger.info(`Capturing audio track: ${this.track.name}`);
    this.reader = readable.getReader();
  }
  
  async encode(data: StreamMessageData) {
    const encoder = new AudioEncoder({
      output: (chunk: EncodedAudioChunk, metadata: EncodedAudioChunkMetadata) => this.handleChunk(chunk, metadata),
      error: (error: DOMException) => Mogger.error('VideoEncoder error', error.message)
    });
    const encoderConfig: MyEncoderConfig = this.track.encoderConfig as MyEncoderConfig;
    encoder.configure(encoderConfig.encoderConfig as AudioEncoderConfig);
    while (this.state === 'encoding') {
      const { done, value } = await this.reader.read();
      if (done) break;
      encoder.encode(value);
      this.chunkCount++;
      value.close();
    }
  }

  async handleChunk(chunk: EncodedAudioChunk, metadata: EncodedAudioChunkMetadata) {
    const chunkData = new Uint8Array(chunk.byteLength);
    chunk.copyTo(chunkData);
    postMessage({ type: 'chunk', data: { chunk: chunkData, metadata } });
  }
}

const encoder = new MoQTAudioEncoder();
self.addEventListener('message', encoder.onMessage.bind(encoder));

export {};
