// https://www.ietf.org/id/draft-cenzano-moq-media-interop-02.html

export const MI_EXTENSION_HEADER_TYPE = {
  MEDIA_TYPE: 0xA,
  H264AVCC_METADATA: 0xB,
  H264AVCC_EXTRA_DATA: 0xD,
  OPUS_BITSTREAM: 0xF,
  UTF8_HEADER: 0x11,
  AACLC_BITSTREAM: 0x13,
} as const;

export const MI_MEDIA_TYPE = {
  H264AVCC: 0x0,
  OPUS: 0x1,
  UTF8: 0x2,
  AACLC: 0x3,
} as const;
