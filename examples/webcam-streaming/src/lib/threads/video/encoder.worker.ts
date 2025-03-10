import { Mogger } from "$lib/utils/mogger";

interface StreamMessageData {
  mediaStreamTrack: MediaStreamTrack
}

// only for a single track at this point (assuming separating qualities/framerates will be done in codec level)
class MoQTVideoEncoder {
  private reader: ReadableStreamDefaultReader<VideoFrame>;
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

  capture(readable: ReadableStream<VideoFrame>) {
    this.state = 'capturing';
    Mogger.info(`Capturing video track: ${this.track.name}`);
    this.reader = readable.getReader();
  }
  
  async encode(data: StreamMessageData) {
    const encoder = new VideoEncoder({
      output: (chunk: EncodedVideoChunk, metadata: EncodedVideoChunkMetadata) => this.handleChunk(chunk, metadata),
      error: (error: DOMException) => Mogger.error('VideoEncoder error', error.message)
    });
    const encoderConfig: MyEncoderConfig = this.track.encoderConfig as MyEncoderConfig;
    encoder.configure(encoderConfig.encoderConfig as VideoEncoderConfig);
    while (this.state === 'encoding') {
      const { done, value } = await this.reader.read();
      if (done) break;
      encoder.encode(value, { keyFrame: this.chunkCount % encoderConfig.keyFrameDuration === 0 });
      this.chunkCount++;
      value.close();
    }
  }

  async handleChunk(chunk: EncodedVideoChunk, metadata: EncodedVideoChunkMetadata) {
    const chunkData = new Uint8Array(chunk.byteLength);
    chunk.copyTo(chunkData);
    postMessage({ type: 'chunk', data: { chunk: chunkData, metadata } });
  }
}

const encoder = new MoQTVideoEncoder();
self.addEventListener('message', encoder.onMessage.bind(encoder));

export {};
