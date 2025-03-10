// main thread for publisher
// interaction with the component page: video/audio start, stop, pause, resume, 
import { CONTROL_MESSAGE, MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION, PARAMETER, serializeAnnounce, serializeClientSetup, serializeUnannounce } from '../temp';
import type { ServerSetup, AnnounceOk } from '../temp';
// @ts-ignore
import CommunicatorWorker from './threads/communicator.worker?worker';
// @ts-ignore
import VideoEncoderWorker from './threads/video/encoder.worker?worker';
import { TrackManager } from './track';
import { Mogger } from './utils/mogger';

export class Publisher {
  private communicator: Worker; 
  private videoEncoders: { [key: string]: Worker } = {};
  private audioEncoder: { [key: string]: Worker } = {};
  private trackManager: TrackManager = new TrackManager();
  private supportedVersions = [MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION];
  private maxSubscribeId = 1000;

  constructor(props: PublisherInitProps) {
    this.communicator = new CommunicatorWorker();
    this.communicator.onmessage = this.communicatorMessageHandler.bind(this);
    this.communicator.postMessage({ type: 'startConnection', data: props.serverUrl });
    props.tracks.map(track => {
      this.trackManager.addTrack(track);
      if (track.type === 'video') {
        this.videoEncoders[track.name] = new VideoEncoderWorker();
        this.videoEncoders[track.name].onmessage = this.videoEncoderMessageHandler.bind(this);
        this.videoEncoders[track.name].postMessage({ type: 'init', data: track });
      } else if (track.type === 'audio') {
        // this.audioEncoder[track.name] = new AudioEncoderWorker();
        // this.audioEncoder[track.name].onmessage = this.audioEncoderMessageHandler.bind(this);
      }
    })
  }

  registerTrack(track: Track) {
    this.trackManager.addTrack(track);
  }

  startStream({ track, mediaTrack }: { track: Track, mediaTrack: MediaStreamTrack }) {
    if (track.type === 'video') {
      const processor = new MediaStreamTrackProcessor({ track: mediaTrack as MediaStreamVideoTrack });
      if (!this.videoEncoders[track.name]) {
        Mogger.error(`Video encoder for track ${track.name} not found`);
        return;
      }
      this.videoEncoders[track.name].postMessage({ type: 'capture', data: processor.readable }, [processor.readable]);
    } else if (track.type === 'audio') {
      // TODO: audio
    }
  }

  setup() {
    this.communicator.postMessage({ type: 'startReadLoop', data: null });
    const msg = serializeClientSetup({
      supportedVersions: this.supportedVersions,
      params: [
        { type: PARAMETER.SETUP.MAX_SUBSCRIBE_ID.KEY, value: this.maxSubscribeId }
      ]
    });
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
  }
  announce(namespace: string[]) {
    const msg = serializeAnnounce({ trackNamespace: namespace });
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
  }
  unannounce(namespace: string[]) {
    const msg = serializeUnannounce({ trackNamespace: namespace });
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
  }

  private communicatorMessageHandler(message: MessageEvent) {
    let msg;
    switch (message.data.type) {
      case `ctrl-${CONTROL_MESSAGE.SERVER_SETUP}`:
        msg = message.data.data as ServerSetup;
        if (!this.supportedVersions.includes(msg.selectedVersion)) {
          Mogger.error('Server does not support any of the versions we support');
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        }
        Mogger.info(`Setup successful with version ${msg.selectedVersion}`);
        break;
      case `ctrl-${CONTROL_MESSAGE.ANNOUNCE_OK}`:
        msg = message.data.data as AnnounceOk;
        Mogger.info(`Announce with namespace ${message.data.data.trackNamespace} successful`);
        break;
      case 'error':
        Mogger.error(`Error from communicator: ${message.data.data}`);
        break;
      default:
        Mogger.error(`Unexpected message type ${message.data.type}`);
        break;
    }
  }
  private videoEncoderMessageHandler(message: MessageEvent) {}
  private audioEncoderMessageHandler(message: MessageEvent) {}
}

