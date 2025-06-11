import { H264AVCCMetadataToExtensionHeader, deserializeH264AVCCMetadata, H264AVCCExtraDataToExtensionHeader } from '../src/packagers/mi/h264AVCC';
import { opusBitstreamToExtensionHeader, deserializeOpusBitstream } from '../src/packagers/mi/opus';
import { AACLCBitstreamToExtensionHeader, deserializeAACLCBitstream } from '../src/packagers/mi/AACLC';
import { serializeUtf8Header, deserializeUtf8Header } from '../src/packagers/mi/utf8';

const streamFromArray = (arr: Uint8Array) =>
  new ReadableStream<Uint8Array>({ start(c){ c.enqueue(arr); c.close(); }, type: 'bytes' } as any);

describe('mi packagers', () => {
  test('H264AVCC metadata', async () => {
    const meta = { seqId:1, pts:2, dts:3, timebase:4, duration:5, wallclock:6 };
    const eh = H264AVCCMetadataToExtensionHeader(meta);
    const decoded = await deserializeH264AVCCMetadata(streamFromArray(eh.value as Uint8Array));
    expect(decoded).toEqual(meta);
    const ed = H264AVCCExtraDataToExtensionHeader(new ArrayBuffer(0));
    expect(ed.id).toBeDefined();
  });

  test('opus bitstream', async () => {
    const b = { seqId:1, pts:2, timebase:3, sampleFreq:4, numChannels:1, duration:5, wallclock:6 };
    const eh = opusBitstreamToExtensionHeader(b);
    const decoded = await deserializeOpusBitstream(streamFromArray(eh.value as Uint8Array));
    expect(decoded).toEqual(b);
  });

  test('AACLC bitstream', async () => {
    const a = { seqId:1, pts:2, timebase:3, sampleFreq:4, numChannels:1, duration:5, wallclock:6 };
    const eh = AACLCBitstreamToExtensionHeader(a);
    const decoded = await deserializeAACLCBitstream(streamFromArray(eh.value as Uint8Array));
    expect(decoded).toEqual(a);
  });

  test('utf8 header', async () => {
    const u = { seqId:1 };
    const bytes = serializeUtf8Header(u);
    const decoded = await deserializeUtf8Header(streamFromArray(bytes));
    expect(decoded).toEqual(u);
  });
});
