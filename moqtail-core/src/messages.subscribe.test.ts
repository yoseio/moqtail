import { serializeSubscribe } from './messages/subscribe';
import { serializeUnsubscribe } from './messages/unsubscribe';
import { serializeSubscribeOk } from './messages/subscribeOk';
import { serializeSubscribeError } from './messages/subscribeError';
import { serializeSubscribeDone } from './messages/subscribeDone';
import { serializeSubscribeUpdate } from './messages/subscribeUpdate';
import { serializeSubscribeAnnounces } from './messages/subscribeAnnounces';
import { serializeSubscribeAnnouncesOk } from './messages/subscribeAnnouncesOk';
import { serializeSubscribeAnnouncesError } from './messages/subscribeAnnouncesError';
import { serializeUnsubscribeAnnounces } from './messages/unsubscribeAnnounces';
import { GROUP_ORDER, SUBSCRIBE_FILTER, CONTENT_EXISTS, SUBSCRIBE_ERROR_REASON, SUBSCRIBE_DONE_REASON, SUBSCRIBE_ANNOUNCES_ERROR_REASON } from './constants';

describe('control messages subscribe', () => {
  test('serializeSubscribe', () => {
    const msg = { subscribeId:1, trackAlias:0, trackNamespace:['ns'], trackName:'t', subscriberPriority:1, groupOrder:GROUP_ORDER.ASCENDING, filterType:SUBSCRIBE_FILTER.LATEST_OBJECT, parameters:[] };
    const bytes = serializeSubscribe(msg);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeUnsubscribe', () => {
    const bytes = serializeUnsubscribe(1);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribeOk', () => {
    const bytes = serializeSubscribeOk({ subscribeId:1, expires:1, groupOrder:GROUP_ORDER.ASCENDING, contentExists:CONTENT_EXISTS.NO, parameters:[] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribeError', () => {
    const bytes = serializeSubscribeError({ subscribeId:1, errorCode:SUBSCRIBE_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'e', trackAlias:0 });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribeDone', () => {
    const bytes = serializeSubscribeDone({ subscribeId:1, statusCode:SUBSCRIBE_DONE_REASON.EXPIRED, reasonPhrase:'r', streamCount:1 });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribeUpdate', () => {
    const bytes = serializeSubscribeUpdate({ subscribeId:1, startGroup:1, startObject:1, endGroup:1, subscriberPriority:1, parameters:[] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribeAnnounces', () => {
    const bytes = serializeSubscribeAnnounces({ trackNamespacePrefix:['a'], parameters:[] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribeAnnouncesOk', () => {
    const bytes = serializeSubscribeAnnouncesOk(['a']);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribeAnnouncesError', () => {
    const bytes = serializeSubscribeAnnouncesError({ trackNamespacePrefix:['a'], errorCode:SUBSCRIBE_ANNOUNCES_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'x' });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeUnsubscribeAnnounces', () => {
    const bytes = serializeUnsubscribeAnnounces(['a']);
    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
