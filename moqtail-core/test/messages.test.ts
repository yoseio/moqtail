import { serializeSubscribe, deserializeSubscribe } from '../src/messages/subscribe';
import { serializeFetch, deserializeFetch } from '../src/messages/fetch';
import { GROUP_ORDER, SUBSCRIBE_FILTER, FETCH_TYPE, CONTROL_MESSAGE } from '../src/constants';
import { serializeParams } from '../src/utils/parameter';

const streamFromArray = (arr: Uint8Array) =>
  new ReadableStream<Uint8Array>({ start(c){ c.enqueue(arr); c.close(); }, type: 'bytes' } as any);

describe('messages', () => {
  test('serializeSubscribe produces bytes', () => {
    const msg = { subscribeId:1, trackAlias:0, trackNamespace:['ns'], trackName:'track', subscriberPriority:1, groupOrder:GROUP_ORDER.ASCENDING, filterType:SUBSCRIBE_FILTER.LATEST_OBJECT, parameters:[] };
    const bytes = serializeSubscribe(msg);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeFetch produces bytes', () => {
    const props = { subscribeId:1, subscriberPriority:1, groupOrder:GROUP_ORDER.ASCENDING, fetchType:FETCH_TYPE.STANDALONE, trackNamespace:['ns'], trackName:'t', startGroup:1, startObject:1, endGroup:1, endObject:1 };
    const bytes = serializeFetch(props);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
