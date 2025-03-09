import { Mogger } from '$lib/utils/mogger';
import { CONTROL_MESSAGE, deserializeServerSetup, readControlMessageType } from '../../temp';

class MoQTCommunicator {
  private wt: WebTransport;
  private controlStream: WebTransportBidirectionalStream;
  private controlWriter: WritableStream;
  private controlReader: ReadableStream;
  private streams: { [key: string]: WritableStream } = {};
  private state: 'running' | 'stopped' = 'stopped';

  constructor(){}

  onMessage(message: MessageEvent) {
    const data = message.data as ThreadMessage;
    switch (data.type) {
      case 'startConnection':
        this.startConnection(data.data);
        break;
      case 'sendControlMessage':
        this.sendControlMessage(data.data);
        break;
      case 'sendSubgroupObject':
        this.sendObject(data.data.object, data.data.subgroupId, );
        break;
      case 'closeStream':
        this.closeSubgroupStream(data.data);
        break;
      case 'closeSession':
        this.closeSession();
        break;
      case 'startReadLoop':
        this.startReadLoop();
        break;
    }
  }

  async startConnection(url: string) {
    this.wt = new WebTransport(url, { congestionControl: 'throughput' });
    await this.wt.ready;
    this.controlStream = await this.wt.createBidirectionalStream();
    this.controlWriter = this.controlStream.writable;
    this.controlReader = this.controlStream.readable;
    this.state = 'running';
    Mogger.info('Connection established');
  }

  async sendControlMessage(data: Uint8Array) {
    const writer = this.controlWriter.getWriter();
    await writer.write(data);
    writer.releaseLock();
    Mogger.info('Control message sent');
  }

  async sendObject(data: Uint8Array, subgroupId: string) {
    if (!this.streams[subgroupId]) {
      this.streams[subgroupId] = await this.wt.createUnidirectionalStream();
    }
    const writer = this.streams[subgroupId].getWriter();
    await writer.write(data);
    writer.releaseLock();
    Mogger.info('Object sent');
  }

  async sendDatagram(data: Uint8Array) {
    const writer = this.wt.datagrams.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
    Mogger.info('Datagram sent');
  }

  closeSubgroupStream(subgroupId: string) {
    this.streams[subgroupId].getWriter().close();
    delete this.streams[subgroupId];
    Mogger.info('Stream closed');
  }

  closeSession() {
    this.state = 'stopped';
    this.controlStream.writable.getWriter().close();
    this.wt.close();
    Mogger.info('Session closed');
  }

  async startReadLoop() {
    while (this.state === 'running') {
      const msgType = await readControlMessageType(this.controlReader);
      Mogger.info(`Received message type: ${msgType}`);
      let message;
      let error: string = '';
      switch (msgType) {
        case CONTROL_MESSAGE.SERVER_SETUP:
          message = await deserializeServerSetup(this.controlReader);
          break;
        default:
          error = `Unexpected message type: ${msgType}`;
      };
      !error ? postMessage({ type: 'serverSetup', data: message }): postMessage({ type: 'error', data: error });
    }
  }
}

const workerInstance = new MoQTCommunicator();
self.addEventListener('message', workerInstance.onMessage.bind(workerInstance));

export {};
