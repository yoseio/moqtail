import { serializeClientSetup, deserializeClientSetup } from '../src/messages/clientSetup';
import { serializeServerSetup, deserializeServerSetup } from '../src/messages/serverSetup';
import { serializeGoaway, deserializeGoaway } from '../src/messages/goaway';
import { serializeMaxSubscribeId, deserializeMaxSubscribeId } from '../src/messages/maxSubscribeId';
import { serializeSubscribesBlocked, deserializeSubscribesBlocked } from '../src/messages/subscribesBlocked';
import { MOQT_DRAFT09_VERSION, CONTROL_MESSAGE } from '../src/constants';
import { serializeQuicVarInt } from 'bytes';

const streamFromArray = (arr: Uint8Array) =>
  new ReadableStream<Uint8Array>({ start(c){ c.enqueue(arr); c.close(); }, type:'bytes' } as any);

describe('control messages setup', () => {
  test('serializeClientSetup', () => {
    const bytes = serializeClientSetup({ supportedVersions: [MOQT_DRAFT09_VERSION] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeServerSetup', () => {
    const bytes = serializeServerSetup({ selectedVersion: MOQT_DRAFT09_VERSION, parameters: [] });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeGoaway', () => {
    const bytes = serializeGoaway({ newSessionUri: 'uri' });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeMaxSubscribeId', () => {
    const bytes = serializeMaxSubscribeId({ subscribeId: 1 });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('serializeSubscribesBlocked', () => {
    const bytes = serializeSubscribesBlocked({ maxSubscribeId: 1 });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test('deserializeClientSetup', async () => {
    const bytes = serializeClientSetup({ supportedVersions: [MOQT_DRAFT09_VERSION] });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.CLIENT_SETUP).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeClientSetup(stream)).resolves.toEqual({ versions: [MOQT_DRAFT09_VERSION], parameters: [] });
  });

  test('deserializeServerSetup', async () => {
    const bytes = serializeServerSetup({ selectedVersion: MOQT_DRAFT09_VERSION, parameters: [] });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.SERVER_SETUP).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeServerSetup(stream)).resolves.toEqual({ selectedVersion: MOQT_DRAFT09_VERSION, parameters: [] });
  });

  test('deserializeGoaway', async () => {
    const bytes = serializeGoaway({ newSessionUri: 'uri' });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.GOAWAY).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeGoaway(stream)).resolves.toEqual({ newSessionUri: 'uri' });
  });

  test('deserializeMaxSubscribeId', async () => {
    const bytes = serializeMaxSubscribeId({ subscribeId: 1 });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.MAX_SUBSCRIBE_ID).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeMaxSubscribeId(stream)).resolves.toEqual({ subscribeId: 1 });
  });

  test('deserializeSubscribesBlocked', async () => {
    const bytes = serializeSubscribesBlocked({ maxSubscribeId: 1 });
    const off = serializeQuicVarInt(CONTROL_MESSAGE.SUBSCRIBES_BLOCKED).byteLength;
    const stream = streamFromArray(bytes.slice(off));
    await expect(deserializeSubscribesBlocked(stream)).resolves.toEqual({ maxSubscribeId: 1 });
  });
});
