// main thread for publisher
// interaction with the component page: video/audio start, stop, pause, resume, 
import { MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION, PARAMETER, serializeAnnounce, serializeClientSetup } from 'moqtail';
// @ts-ignore
import CommunicatorWorker from './threads/communicator.worker?worker';
// @ts-ignore
import VideoEncoderWorker from './threads/video/encoder.worker?worker';

export class Publisher {
  private communicator: Worker; 
  private videoEncoder: Worker; 
  private tracks: Track[];

  constructor(props: PublisherInitProps) {
    this.communicator = new CommunicatorWorker();
    this.communicator.onmessage = this.communicatorMessageHandler;
    this.communicator.postMessage({ type: 'startConnection', data: props.serverUrl });
    this.communicator.postMessage({ type: 'startReadLoop', data: null });
    this.videoEncoder = new VideoEncoderWorker();
    this.videoEncoder.onmessage = this.videoEncoderMessageHandler;
    this.tracks = props.tracks;
  }

  setup() {
    const msg = serializeClientSetup({
      supportedVersions: [MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION],
      params: [
        { type: PARAMETER.SETUP.MAX_SUBSCRIBE_ID.KEY, value: 100 }
      ]
    });
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
  }

  announce(namespace: string[]) {
    const msg = serializeAnnounce({ trackNamespace: namespace });
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
  }

  private communicatorMessageHandler(message: MessageEvent) {}
  private videoEncoderMessageHandler(message: MessageEvent) {}
}

