import { serializeFetch, deserializeFetch } from '../src/messages/fetch';
import { serializeFetchOk, deserializeFetchOk } from '../src/messages/fetchOk';
import { serializeFetchError, deserializeFetchError } from '../src/messages/fetchError';
import { serializeFetchCancel, deserializeFetchCancel } from '../src/messages/fetchCancel';
import { GROUP_ORDER, FETCH_TYPE, FETCH_ERROR_REASON, CONTROL_MESSAGE } from '../src/constants';
import { serializeQuicVarInt } from 'bytes';

const streamFromArray = (arr: Uint8Array) => new ReadableStream<Uint8Array>({ start(c){ c.enqueue(arr); c.close(); }, type:'bytes' } as any);

describe('control messages fetch', () => {
  test('serializeFetch', () => {
    const props = { subscribeId:1, subscriberPriority:1, groupOrder:GROUP_ORDER.ASCENDING, fetchType:FETCH_TYPE.STANDALONE, trackNamespace:['ns'], trackName:'t', startGroup:1, startObject:1, endGroup:1, endObject:1 };
    const bytes = serializeFetch(props);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeFetchOk', () => {
    const bytes = serializeFetchOk({ subscribeId:1, groupOrder:GROUP_ORDER.ASCENDING, endOfTrack:0, largestGroupId:1, largestObjectId:1, parameters:[] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeFetchError', () => {
    const bytes = serializeFetchError({ subscribeId:1, errorCode:FETCH_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'err' });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeFetchCancel', () => {
    const bytes = serializeFetchCancel(1);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('deserializeFetch', async () => {
    const props = { subscribeId:1, subscriberPriority:1, groupOrder:GROUP_ORDER.ASCENDING, fetchType:FETCH_TYPE.STANDALONE, trackNamespace:['ns'], trackName:'t', startGroup:1, startObject:1, endGroup:1, endObject:1 };
    const bytes = serializeFetch(props);
    const off = serializeQuicVarInt(CONTROL_MESSAGE.FETCH).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeFetch(stream)).resolves.toEqual({ ...props, parameters: [] });
  });

  test('deserializeFetchOk', async () => {
    const bytes = serializeFetchOk({ subscribeId:1, groupOrder:GROUP_ORDER.ASCENDING, endOfTrack:0, largestGroupId:1, largestObjectId:1, parameters:[] });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.FETCH_OK).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeFetchOk(stream)).resolves.toEqual({ subscribeId:1, groupOrder:GROUP_ORDER.ASCENDING, endOfTrack:0, largestGroupId:1, largestObjectId:1, parameters: [] });
  });

  test('deserializeFetchError', async () => {
    const bytes = serializeFetchError({ subscribeId:1, errorCode:FETCH_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'err' });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.FETCH_ERROR).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeFetchError(stream)).resolves.toEqual({ subscribeId:1, errorCode:FETCH_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'err' });
  });

  test('deserializeFetchCancel', async () => {
    const bytes = serializeFetchCancel(1);
    const off = serializeQuicVarInt(CONTROL_MESSAGE.FETCH_CANCEL).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeFetchCancel(stream)).resolves.toEqual({ subscribeId:1 });
  });
});
