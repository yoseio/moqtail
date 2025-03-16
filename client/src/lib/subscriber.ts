import { Mogger } from "./utils/mogger";
import { CONTROL_MESSAGE, deserializeVideoDecoderConfig, deserializeSubgroupObjectHeader, LOC_EXTENSION_HEADER_TYPE, MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION, serializeClientSetup, serializeSubscribe, STREAM } from "../temp";
import type { Subscribe, ServerSetup, SubscribeOk, SubgroupHeader, SubgroupObject, SubscribeError } from "../temp";

// @ts-ignore
import CommunicatorWorker from './threads/communicator.worker?worker';
// @ts-ignore
import VideoDecoderWorker from './threads/video/decoder.worker?worker';
// @ts-ignore
import AudioDecoderWorker from './threads/audio/decoder.worker?worker';

type RegisteredSubscription = { subscribe: Subscribe, subscribeOk: boolean, decoder: Worker };

export class Subscriber {
  private communicator: Worker;
  private supportedVersions = [MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION];
  private selectedVersion: number = 0;
  private subscription: RegisteredSubscription[] = [];
  private waitingForKeyFrame = true;

  private canvasElement: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

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
    const decoder: Worker = trackType === 'video' ? new VideoDecoderWorker() : new AudioDecoderWorker();
    decoder.onmessage = this.decoderMessageHandler.bind(this);
    decoder.postMessage({ type: 'init', data: props });
    this.subscription.push({ subscribe: props, subscribeOk: false, decoder });
  }
  setCanvasElement(canvasElement: HTMLCanvasElement) {
    this.canvasElement = canvasElement;
    this.ctx = this.canvasElement.getContext('2d');
  }
  communicatorMessageHandler(message: MessageEvent) {
    let msg;
    let sub: RegisteredSubscription;
    switch (message.data.type) {
      case `ctrl-${CONTROL_MESSAGE.SERVER_SETUP}`:
        msg = message.data.data as ServerSetup;
        if (!this.supportedVersions.includes(msg.selectedVersion)) {
          Mogger.error('Server does not support any of the versions we support');
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        }
        this.selectedVersion = msg.selectedVersion;
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
      case `ctrl-${CONTROL_MESSAGE.SUBSCRIBE_ERROR}`:
        msg = message.data.data as SubscribeError;
        Mogger.error(`Subscribe error for alias ${msg.trackAlias}: ${msg.reasonPhrase}`);
        break;
      case `stream-${STREAM.SUBGROUP_HEADER}`:
        const subgroupHeader: SubgroupHeader = message.data.data;
        sub = this.subscription.find(s => s.subscribe.trackAlias === subgroupHeader.trackAlias);
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
        break;
      case 'subgroupObject':
        const encodedChunkInit = message.data.data.encodedChunkInit as EncodedVideoChunkInit;
        if (this.waitingForKeyFrame && encodedChunkInit.type !== 'key') break;
        this.waitingForKeyFrame = false;
        const trackAlias: number = message.data.data.trackAlias;
        sub = this.subscription.find(s => s.subscribe.trackAlias === trackAlias);
        if (!sub) {
          Mogger.error(`Unknown subgroup object with alias:${trackAlias} received`);
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        } else if (!sub.subscribeOk) {
          Mogger.error(`Subgroup Objcet with alias:${trackAlias} received before subscribeOk`);
          this.communicator.postMessage({ type: 'closeSession', data: null });
          break;
        }
        const header = message.data.data.header as SubgroupObject;
        let videoDecoderConfig = null;
        header.extensionHeaders.map(h => {
          if (h.id !== LOC_EXTENSION_HEADER_TYPE.VIDEO_CONFIG) return;
          // TODO: implement fixed buffer reader and deserialize as it is
          const value = h.value as Uint8Array;
          const readableStream = new ReadableStream({
            type: 'bytes',
            start(controller) {
              // Push the Uint8Array into the stream
              controller.enqueue(value);
              controller.close(); // Close the stream when done
            }
          });
          deserializeVideoDecoderConfig(readableStream).then((config) => {
            videoDecoderConfig = config;
          });
        })
        const chunk = new EncodedVideoChunk(encodedChunkInit);
        sub.decoder.postMessage({ type: 'decode', data: { encodedVideoChunk: chunk, config: videoDecoderConfig } });
        break;
      case 'subgroupObjectStatus':
        Mogger.info(`End of subgroup object: ${message.data.data.header.objectStatus}`);
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
        Mogger.debug(`VideoFrame with subscribeId:${vfData.subscribeId} received. Rendering...`);
        // this.canvasElement.width = vfData.frame.codedWidth;
        // this.canvasElement.height = vfData.frame.codedHeight;
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.ctx.drawImage(vfData.frame, 0, 0, this.canvasElement.width, this.canvasElement.height);
        vfData.frame.close()
        break;
    }
  }
}
