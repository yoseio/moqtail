import { CONTROL_MESSAGE, MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION, serializeClientSetup, serializeSubscribe } from "../temp";
import type { Subscribe, ServerSetup, SubscribeOk } from "../temp";

// @ts-ignore
import CommunicatorWorker from './threads/communicator.worker?worker';
import { Mogger } from "./utils/mogger";

export class Subscriber {
  private communicator: Worker;
  private supportedVersions = [MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION];
  private subscription: { subscribe: Subscribe, subscribeOk: boolean }[] = [];

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
  subscribe(props: Subscribe) {
    const msg = serializeSubscribe(props);
    this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
    this.subscription.push({ subscribe: props, subscribeOk: false });
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
          Mogger.error(`Subscription not found for ${msg.subscribeId}`);
          break;
        }
        subscription.subscribeOk = true;
        break;
    }
  }
}
