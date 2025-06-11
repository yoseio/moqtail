import { serializeAnnounce } from '../src/messages/announce';
import { serializeAnnounceOk } from '../src/messages/announceOk';
import { serializeAnnounceError } from '../src/messages/announceError';
import { serializeAnnounceCancel } from '../src/messages/announceCancel';
import { serializeUnannounce } from '../src/messages/unannounce';
import { serializeTrackStatusRequest } from '../src/messages/trackStatusRequest';
import { serializeTrackStatus } from '../src/messages/trackStatus';
import { ANNOUNCE_ERROR_REASON, TRACK_STATUS_CODE } from '../src/constants';

describe('control messages announce', () => {
  test('serializeAnnounce', () => {
    const bytes = serializeAnnounce({ trackNamespace:['ns'], parameters:[] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeAnnounceOk', () => {
    const bytes = serializeAnnounceOk({ trackNamespace:['ns'] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeAnnounceError', () => {
    const bytes = serializeAnnounceError({ trackNamespace:['ns'], errorCode:ANNOUNCE_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'e' });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeAnnounceCancel', () => {
    const bytes = serializeAnnounceCancel({ trackNamespace:['ns'], errorCode:ANNOUNCE_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'e' });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeUnannounce', () => {
    const bytes = serializeUnannounce({ trackNamespace:['ns'] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeTrackStatusRequest', () => {
    const bytes = serializeTrackStatusRequest({ trackNamespace:['ns'], trackName:'t' });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeTrackStatus', () => {
    const bytes = serializeTrackStatus({ trackNamespace:['ns'], trackName:'t', statusCode:TRACK_STATUS_CODE.IN_PROGRESS, lastGroupId:1, lastObjectId:1 });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
