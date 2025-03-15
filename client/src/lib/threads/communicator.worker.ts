import { Mogger } from '$lib/utils/mogger';
import { CONTROL_MESSAGE, deserializeAnnounceError, deserializeAnnounceOk, deserializeEncodedChunk, deserializeServerSetup, deserializeSubgroupHeader, deserializeSubgroupObjectHeader, deserializeSubscribe, deserializeSubscribeDone, deserializeSubscribeError, deserializeSubscribeOk, OBJECT_STATUS, readControlMessageType, STREAM } from '../../temp';

class MoQTCommunicator {
  private wt: WebTransport;
  private controlStream: WebTransportBidirectionalStream;
  private controlWriter: WritableStream;
  private controlReader: ReadableStream;
  private streams: Map<number, WritableStream> = new Map();
  private state: 'running' | 'stopped' = 'stopped';

  constructor(){}

  onMessage(message: MessageEvent) {
    const data = message.data as ThreadMessage;
    const handlers: { [key: string]: (data: any) => void } = {
      startConnection: this.startConnection.bind(this),
      sendControlMessage: this.sendControlMessage.bind(this),
      createSubgroupStream: this.createSubgroupStream.bind(this),
      closeSubgroupStreams: this.closeSubgroupStreams.bind(this),
      sendSubgroupObject: this.sendObject.bind(this),
      closeStream: this.closeSubgroupStream.bind(this),
      closeSession: this.closeSession.bind(this),
      startReadLoop: this.startReadLoop.bind(this),
      startStreamReadLoop: this.startStreamReadLoop.bind(this)
    };
    const handler = handlers[data.type];
    if (!handler) {
      postMessage({ type: 'error', data: `Unknown message type: ${data.type}` });
      return;
    }
    handler(data.data);
  }

  async startConnection(url: string) {
    this.wt = new WebTransport(url, { congestionControl: 'throughput' });
    await this.wt.ready;
    this.controlStream = await this.wt.createBidirectionalStream();
    this.controlWriter = this.controlStream.writable;
    this.controlReader = this.controlStream.readable;
    this.state = 'running';
    Mogger.debug('Connection established');
  }

  async sendControlMessage(data: Uint8Array) {
    const writer = this.controlWriter.getWriter();
    await writer.write(data);
    writer.releaseLock();
    Mogger.debug('Control message sent');
  }

  async closeSubgroupStreams(subgroupIds: number[]) {
    subgroupIds.map(id => {
      this.closeSubgroupStream(id);
    })
  }

  async createSubgroupStream({ subgroupId, subgroupHeader}: { subgroupId: number, subgroupHeader: Uint8Array }) {
    this.streams.set(subgroupId, await this.wt.createUnidirectionalStream());
    const writer = this.streams.get(subgroupId).getWriter();
    await writer.write(subgroupHeader);
    writer.releaseLock();
    Mogger.debug('Stream created');
  }

  closeSubgroupStream(subgroupId: number) {
    this.streams.get(subgroupId).close();
    this.streams.delete(subgroupId);
    Mogger.debug(`Stream with subgroupId: ${subgroupId} closed`);
  }

  async sendObject({ subgroupObject, subgroupId }: { subgroupObject: Uint8Array, subgroupId: number }) {
    // if (!this.streams.has(subgroupId)) {
    //   postMessage({ type: 'error', data: `Stream ${subgroupId} not found` });
    //   return;
    // }
    while (!this.streams.has(subgroupId)) {
      await new Promise((resolve) => setTimeout(resolve, 0.5));
    };
    const writer = this.streams.get(subgroupId).getWriter();
    await writer.write(subgroupObject);
    writer.releaseLock();
    Mogger.debug('Object sent');
  }

  async sendDatagram(data: Uint8Array) {
    const writer = this.wt.datagrams.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
    Mogger.debug('Datagram sent');
  }

  closeSession() {
    this.state = 'stopped';
    this.controlStream.writable.getWriter().close();
    this.wt.close();
    Mogger.debug('Session closed');
  }

  async readSubgroupObject(reader: ReadableStream, trackAlias: number) {
    let done = false;
    while (!done) {
      const header = await deserializeSubgroupObjectHeader(reader);
      done = header.objectStatus && (header.objectStatus === OBJECT_STATUS.END_OF_GROUP || header.objectStatus === OBJECT_STATUS.END_OF_TRACK || header.objectStatus === OBJECT_STATUS.END_OF_TRACK_AND_GROUP);
      if (!done) {
        const encodedChunkInit = await deserializeEncodedChunk(reader);
        postMessage({ type: 'subgroupObject', data: { header, encodedChunkInit, trackAlias } });
      } else {
        postMessage({ type: 'subgroupObjectStatus', data: { header } })
      }
    }
    await reader.cancel();
  }

  async startReadLoop() {
    while (this.state === 'running') {
      const msgType = await readControlMessageType(this.controlReader);
      let message;
      let error: string = '';
      // TODO: make it look cool
      switch (msgType) {
        case CONTROL_MESSAGE.SERVER_SETUP:
          message = await deserializeServerSetup(this.controlReader);
          break;
        case CONTROL_MESSAGE.ANNOUNCE_OK:
          message = await deserializeAnnounceOk(this.controlReader);
          break;
        case CONTROL_MESSAGE.ANNOUNCE_ERROR:
          message = await deserializeAnnounceError(this.controlReader);
          break;
        case CONTROL_MESSAGE.SUBSCRIBE:
          message = await deserializeSubscribe(this.controlReader);
          break;
        case CONTROL_MESSAGE.SUBSCRIBE_OK:
          message = await deserializeSubscribeOk(this.controlReader);
          break;
        case CONTROL_MESSAGE.SUBSCRIBE_ERROR:
          message = await deserializeSubscribeError(this.controlReader);
          break;
        case CONTROL_MESSAGE.SUBSCRIBE_DONE:
          message = await deserializeSubscribeDone(this.controlReader);
          break;
        default:
          error = `Unexpected message type: ${msgType}`;
      };
      !error ? postMessage({ type: `ctrl-${msgType}`, data: message }): postMessage({ type: 'error', data: error });
    }
  }

  async startStreamReadLoop() {
    while (this.state === 'running') {
      const reader = this.wt.incomingUnidirectionalStreams.getReader();
      const { value: readableStream, done } = await reader.read();
      if (done || !readableStream) {
        Mogger.error('Stream reader closed');
        break
      }
      const streamType = await readControlMessageType(readableStream);
      switch (streamType) {
        case STREAM.SUBGROUP_HEADER:
          const subgroupHeader = await deserializeSubgroupHeader(readableStream);
          postMessage({ type: `stream-${streamType}`, data: subgroupHeader });
          this.readSubgroupObject(readableStream, subgroupHeader.trackAlias);
          break;
      }
      reader.releaseLock();
    }
  }
}

const workerInstance = new MoQTCommunicator();
self.addEventListener('message', workerInstance.onMessage.bind(workerInstance));

export {};
