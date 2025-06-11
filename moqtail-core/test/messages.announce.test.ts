import { serializeAnnounce, deserializeAnnounce } from '../src/messages/announce';
import { serializeAnnounceOk, deserializeAnnounceOk } from '../src/messages/announceOk';
import { serializeAnnounceError, deserializeAnnounceError } from '../src/messages/announceError';
import { serializeAnnounceCancel, deserializeAnnounceCancel } from '../src/messages/announceCancel';
import { serializeUnannounce, deserializeUnannounce } from '../src/messages/unannounce';
import { serializeTrackStatusRequest, deserializeTrackStatusRequest } from '../src/messages/trackStatusRequest';
import { serializeTrackStatus, deserializeTrackStatus } from '../src/messages/trackStatus';
import { ANNOUNCE_ERROR_REASON, TRACK_STATUS_CODE, CONTROL_MESSAGE } from '../src/constants';
import { serializeQuicVarInt } from 'bytes';

const streamFromArray = (arr: Uint8Array) => new ReadableStream<Uint8Array>({ start(c){ c.enqueue(arr); c.close(); }, type:'bytes' } as any);

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

  test('deserializeAnnounce', async () => {
    const props = { trackNamespace:['ns'], parameters:[] };
    const bytes = serializeAnnounce(props);
    const off = serializeQuicVarInt(CONTROL_MESSAGE.ANNOUNCE).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeAnnounce(stream)).resolves.toEqual(props);
  });

  test('deserializeAnnounceOk', async () => {
    const bytes = serializeAnnounceOk({ trackNamespace:['ns'] });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.ANNOUNCE_OK).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeAnnounceOk(stream)).resolves.toEqual({ trackNamespace:['ns'] });
  });

  test('deserializeAnnounceError', async () => {
    const props = { trackNamespace:['ns'], errorCode:ANNOUNCE_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'e' };
    const bytes = serializeAnnounceError(props);
    const off = serializeQuicVarInt(CONTROL_MESSAGE.ANNOUNCE_ERROR).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeAnnounceError(stream)).resolves.toEqual(props);
  });

  test('deserializeAnnounceCancel', async () => {
    const props = { trackNamespace:['ns'], errorCode:ANNOUNCE_ERROR_REASON.INTERNAL_ERROR, reasonPhrase:'e' };
    const bytes = serializeAnnounceCancel(props);
    const off = serializeQuicVarInt(CONTROL_MESSAGE.ANNOUNCE_CANCEL).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeAnnounceCancel(stream)).resolves.toEqual(props);
  });

  test('deserializeUnannounce', async () => {
    const bytes = serializeUnannounce({ trackNamespace:['ns'] });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.UNANNOUNCE).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeUnannounce(stream)).resolves.toEqual({ trackNamespace:['ns'] });
  });

  test('deserializeTrackStatusRequest', async () => {
    const props = { trackNamespace:['ns'], trackName:'t' };
    const bytes = serializeTrackStatusRequest(props);
    const off = serializeQuicVarInt(CONTROL_MESSAGE.TRACK_STATUS_REQUEST).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeTrackStatusRequest(stream)).resolves.toEqual(props);
  });

  test('deserializeTrackStatus', async () => {
    const props = { trackNamespace:['ns'], trackName:'t', statusCode:TRACK_STATUS_CODE.IN_PROGRESS, lastGroupId:1, lastObjectId:1 };
    const bytes = serializeTrackStatus(props);
    const off = serializeQuicVarInt(CONTROL_MESSAGE.TRACK_STATUS).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeTrackStatus(stream)).resolves.toEqual(props);
  });
});
