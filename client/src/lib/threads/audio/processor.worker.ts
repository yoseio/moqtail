// Audio Worklet processor for the audio thread
class AudioPlaybackProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array[] = [];

  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    if (event.data.type === 'audioData') {
      const ab = event.data.buffer as ArrayBufferLike;
      this.buffer.push(new Float32Array(ab));
    }
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const output = outputs[0]; // Assuming stereo output
    if (this.buffer.length > 0) {
      const samples = this.buffer.shift();
      for (let channel = 0; channel < output.length; channel++) {
        const channelOut = output[channel];
        for (let i = 0; i < channelOut.length; i++) {
          channelOut[i] = samples ? samples[i] || 0 : 0;
        }
      }
    } else {
      // Fill with silence if no data
      for (let channel = 0; channel < output.length; channel++) {
        output[channel].fill(0);
      }
    }
    return true;
  }
}

registerProcessor('audio-playback-processor', AudioPlaybackProcessor);
