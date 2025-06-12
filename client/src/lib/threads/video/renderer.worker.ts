class MoQTVideoRenderer {
  private canvas?: OffscreenCanvas;
  private ctx?: OffscreenCanvasRenderingContext2D;
  onMessage(event: MessageEvent) {
    const data = event.data as { type: string; data?: any };
    const handlers: { [key: string]: (data: any) => void } = {
      init: this.init.bind(this),
      frame: this.frame.bind(this),
      resize: this.resize.bind(this),
    };
    const handler = handlers[data.type];
    if (!handler) {
      postMessage({ type: 'error', data: `Unknown message type: ${data.type}` });
      return;
    }
    handler(data.data);
  }
  init({ canvas }: { canvas: OffscreenCanvas }) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      postMessage({ type: 'error', data: 'Failed to get 2D context from OffscreenCanvas.' });
    }
  }
  resize({ width, height }: { width: number; height: number }) {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }
  frame(videoFrame: VideoFrame) {
    if (this.ctx && videoFrame) {
      try {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(videoFrame, 0, 0, this.canvas.width, this.canvas.height);
        videoFrame.close();
      } catch (e) {
        postMessage({ type: 'error', data: `Failed to draw frame: ${(e as Error).message}` });
      } finally {
        videoFrame.close();
      }
    }
  }
}

const rendererInstance = new MoQTVideoRenderer();
self.addEventListener('message', rendererInstance.onMessage.bind(rendererInstance));

export {};
