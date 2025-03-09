// main thread for publisher
// interaction with the component page: video/audio start, stop, pause, resume, 
import { MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION, PARAMETER, serializeAnnounce, serializeClientSetup, type ServerSetup } from '../temp';
// @ts-ignore
import CommunicatorWorker from './threads/communicator.worker?worker';
// @ts-ignore
import VideoEncoderWorker from './threads/video/encoder.worker?worker';
import { Mogger } from './utils/mogger';

export class Publisher {
  private communicator: Worker; 
  private videoEncoder: Worker; 
  private tracks: Track[];
  private supportedVersions = [MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION];

  constructor(props: PublisherInitProps) {
    this.communicator = new CommunicatorWorker();
    this.communicator.onmessage = this.communicatorMessageHandler.bind(this);
    this.communicator.postMessage({ type: 'startConnection', data: props.serverUrl });
    this.videoEncoder = new VideoEncoderWorker();
    this.videoEncoder.onmessage = this.videoEncoderMessageHandler.bind(this);
    this.tracks = props.tracks;
  }

  setup() {
    this.communicator.postMessage({ type: 'startReadLoop', data: null });
    const msg = serializeClientSetup({
      supportedVersions: this.supportedVersions,
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

  private communicatorMessageHandler(message: MessageEvent) {
    switch (message.data.type) {
      case 'serverSetup':
        Mogger.info('Server setup received');
        const msg = message.data.data as ServerSetup;
        if (!this.supportedVersions.includes(msg.selectedVersion)) {
          Mogger.error('Server does not support any of the versions we support');
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        }
        Mogger.info(`Setup successful with version ${msg.selectedVersion}`);
        break;
    }
  }
  private videoEncoderMessageHandler(message: MessageEvent) {}
}

