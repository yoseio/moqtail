import { serializeFetch } from './messages/fetch';
import { serializeFetchOk } from './messages/fetchOk';
import { serializeFetchError } from './messages/fetchError';
import { serializeFetchCancel } from './messages/fetchCancel';
import { GROUP_ORDER, FETCH_TYPE, FETCH_ERROR_REASON } from './constants';

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
});
