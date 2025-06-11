import { serializeClientSetup } from './messages/clientSetup';
import { serializeServerSetup } from './messages/serverSetup';
import { serializeGoaway } from './messages/goaway';
import { serializeMaxSubscribeId } from './messages/maxSubscribeId';
import { serializeSubscribesBlocked } from './messages/subscribesBlocked';
import { MOQT_DRAFT09_VERSION } from './constants';

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
});
