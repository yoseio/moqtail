import { Mogger } from '$lib/utils/mogger';
import { readControlMessageType } from 'moqtail';

class MoQTCommunicator {
  private wt: WebTransport;
  private controlStream: WebTransportBidirectionalStream;
  private controlWriter: WritableStream;
  private controlReader: ReadableStream;
  private streams: { [key: string]: WebTransportBidirectionalStream } = {};
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
        this.closeStream(data.data);
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
      this.streams[subgroupId] = await this.wt.createBidirectionalStream();
    }
    const writer = this.streams[subgroupId].writable.getWriter();
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

  closeStream(subgroupId: string) {
    this.streams[subgroupId].writable.getWriter().close();
    delete this.streams[subgroupId];
    Mogger.info('Stream closed');
  }

  async startReadLoop() {
    while (this.state === 'running') {
      const msgType = await readControlMessageType(this.controlReader);
      Mogger.info(`Received message type: ${msgType}`);
      postMessage({ type: 'controlMessage', data: msgType });
    }
  }
}

const workerInstance = new MoQTCommunicator();
self.addEventListener('message', workerInstance.onMessage.bind(workerInstance));

export {};
