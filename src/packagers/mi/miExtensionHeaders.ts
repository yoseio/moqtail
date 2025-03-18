import { serializeQuicVarInt } from "src/temp/utils/bytes";
import type { ExtensionHeader } from "../../dataStreams/extensionHeader";
import { audioDecoderConfigToExtensionHeader, LOC_EXTENSION_HEADER_TYPE, videoDecoderConfigToExtensionHeader } from "../loc";
import { H264AVCCExtraDataToExtensionHeader, H264AVCCMetadataToExtensionHeader } from "./h264AVCC";
import { opusBitstreamToExtensionHeader } from "./opus";

export const MI_EXTENSION_HEADER_TYPE = {
  MEDIA_TYPE: 0xA,
  H264AVCC_METADATA: 0xB,
  H264AVCC_EXTRA_DATA: 0xD,
  OPUS_BITSTREAM: 0xF,
  UTF8_HEADER: 0x11,
  AACLC_BITSTREAM: 0x13,
} as const;
export type MI_EXTENSION_HEADER_TYPE = ObjectValueList<typeof MI_EXTENSION_HEADER_TYPE>;

export const MI_MEDIA_TYPE = {
  H264AVCC: 0x0,
  OPUS: 0x1,
  UTF8: 0x2,
  AACLC: 0x3,
} as const;
export type MI_MEDIA_TYPE = ObjectValueList<typeof MI_MEDIA_TYPE>;

export const getMiExtensionHeaders = (type: MI_MEDIA_TYPE, config: VideoDecoderConfig | AudioDecoderConfig, chunk: EncodedVideoChunk | EncodedAudioChunk, seqId?: number): ExtensionHeader[] => {
  let ret: ExtensionHeader[] = [];
  ret.push({
    id: MI_EXTENSION_HEADER_TYPE.MEDIA_TYPE,
    value: serializeQuicVarInt(type)
  });
  switch (type) {
    case MI_MEDIA_TYPE.H264AVCC:
      if (!seqId) throw new Error('H264AVCC chunk must have seqId');
      const h264avccConfig = config as VideoDecoderConfig;
      ret.push(videoDecoderConfigToExtensionHeader(h264avccConfig));
      const h264Desc = config.description as ArrayBuffer;
      // in moq-mi v2, chunks with key frame are always the first object in a group
      const evChunk = chunk as EncodedVideoChunk;
      if (evChunk.type === 'key' && !h264Desc) throw new Error('H264AVCC key frame must have description');
      ret.push(H264AVCCExtraDataToExtensionHeader(h264Desc));
      ret.push(H264AVCCMetadataToExtensionHeader({
        seqId,
        pts: evChunk.timestamp,
        dts: evChunk.timestamp,
        timebase: 30,
        duration: evChunk.duration,
        wallclock: Date.now()
      }));
      break;
    case MI_MEDIA_TYPE.OPUS:
      if (!seqId) throw new Error('OPUS chunk must have seqId');
      const opusConfig = config as AudioDecoderConfig;
      const opusBitstream = opusConfig.description as ArrayBuffer;
      if (!opusBitstream) throw new Error('OPUS config must have description');
      ret.push(audioDecoderConfigToExtensionHeader(opusConfig));
      const eaChunk = chunk as EncodedAudioChunk;
      // How can I get bitstream from description????
  }
  return ret;
}
