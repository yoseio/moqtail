class VideoCapturer {
  onMessage(event: MessageEvent) {
    const data = event.data as ThreadMessage;
    switch (data.type) {
      case 'startCapture':
        this.startCapture();
        break;
      case 'stopCapture':
        this.stopCapture();
        break;
    }
  }

  async startCapture() {
    // Start capturing video
  }

  async stopCapture() {
    // Stop capturing video
  }
}

const capturer = new VideoCapturer();
self.onmessage = capturer.onMessage.bind(capturer);

export {};
