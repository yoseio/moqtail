import { Mogger } from "./utils/mogger";
import { CONTROL_MESSAGE, MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION, serializeClientSetup, serializeSubscribe, STREAM } from "../temp";
import type { Subscribe, ServerSetup, SubscribeOk, SubgroupHeader } from "../temp";

// @ts-ignore
import CommunicatorWorker from './threads/communicator.worker?worker';
// @ts-ignore
import VideoDecoderWorker from './threads/video/decoder.worker?worker';
// @ts-ignore
import AudioDecoderWorker from './threads/audio/decoder.worker?worker';

export class Subscriber {
  private communicator: Worker;
  private supportedVersions = [MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION];
  private subscription: { subscribe: Subscribe, subscribeOk: boolean, decoder: Worker }[] = [];

  constructor(props: SubscriberInitProps) {
    this.communicator = new CommunicatorWorker();
    this.communicator.onmessage = this.communicatorMessageHandler.bind(this);
    this.communicator.postMessage({ type: 'startConnection', data: props.serverUrl });
  }
  setup() {
    this.communicator.postMessage({ type: 'startReadLoop', data: null });
    const msg = serializeClientSetup({ supportedVersions: this.supportedVersions });
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
  }
  subscribe(props: Subscribe, trackType: 'video' | 'audio') {
    const msg = serializeSubscribe(props);
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
    const decoder = trackType === 'video' ? new VideoDecoderWorker() : new AudioDecoderWorker();
    decoder.onmessage = this.decoderMessageHandler.bind(this);
    this.subscription.push({ subscribe: props, subscribeOk: false, decoder });
  }
  communicatorMessageHandler(message: MessageEvent) {
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
      case `ctrl-${CONTROL_MESSAGE.SUBSCRIBE_OK}`:
        msg = message.data.data as SubscribeOk;
        Mogger.info(`Subscribe successful for ${msg.subscribeId}`);
        const subscription = this.subscription.find(sub => sub.subscribe.subscribeId === msg.subscribeId);
        if (!subscription) {
          Mogger.error(`Unknown subscribeOk with subscribeId:${msg.subscribeId} received`);
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        }
        subscription.subscribeOk = true;
        this.communicator.postMessage({ type: 'startStreamReadLoop', data: null });
        break;
      case `stream-${STREAM.SUBGROUP_HEADER}`:
        const subgroupHeader: SubgroupHeader = message.data.data.subgroupHeader;
        const sub = this.subscription.find(sub => sub.subscribe.trackAlias === subgroupHeader.trackAlias);
        if (!sub) {
          Mogger.error(`Unknown subgroup stream with trackAlias:${subgroupHeader.trackAlias} received`);
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        } else if (!sub.subscribeOk) {
          Mogger.error(`Subgroup stream with trackAlias:${subgroupHeader.trackAlias} received before subscribeOk`);
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        }
        Mogger.info(`Subgroup stream with trackAlias:${subgroupHeader.trackAlias} received`);
        const stream: ReadableStream = message.data.data.readableStream;
        sub.decoder.postMessage({ type: 'registerStream', data: stream }, [stream]);
        sub.decoder.postMessage({ type: 'decode', data: null });
        break;
      case 'error':
        Mogger.error(`Subscriber communicator: ${message.data.data}`);
        break;
    }
  }
  decoderMessageHandler(message: MessageEvent) {
    switch (message.data.type) {
      case 'videoFrame':
        const vfData = message.data.data as { subscribeId: number, frame: VideoFrame };
        const sub = this.subscription.find(sub => sub.subscribe.subscribeId === vfData.subscribeId);
        if (!sub) {
          Mogger.error(`Unknown videoFrame with subscribeId:${vfData.subscribeId} received`);
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        } else if (!sub.subscribeOk) {
          Mogger.error(`VideoFrame with subscribeId:${vfData.subscribeId} received before subscribeOk`);
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        }
        Mogger.info(`VideoFrame with subscribeId:${vfData.subscribeId} received`);
        break;
    }
  }
}
