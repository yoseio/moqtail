/// <reference types="dom-webcodecs" />
import type { ExtensionHeader } from "../../dataStreams/extensionHeader";
export declare const MI_EXTENSION_HEADER_TYPE: {
    readonly MEDIA_TYPE: 10;
    readonly H264AVCC_METADATA: 11;
    readonly H264AVCC_EXTRA_DATA: 13;
    readonly OPUS_BITSTREAM: 15;
    readonly UTF8_HEADER: 17;
    readonly AACLC_BITSTREAM: 19;
};
export type MI_EXTENSION_HEADER_TYPE = ObjectValueList<typeof MI_EXTENSION_HEADER_TYPE>;
export declare const MI_MEDIA_TYPE: {
    readonly H264AVCC: 0;
    readonly OPUS: 1;
    readonly UTF8: 2;
    readonly AACLC: 3;
};
export type MI_MEDIA_TYPE = ObjectValueList<typeof MI_MEDIA_TYPE>;
export declare const getMiExtensionHeaders: (type: MI_MEDIA_TYPE, config: VideoDecoderConfig | AudioDecoderConfig, chunk: EncodedVideoChunk | EncodedAudioChunk, seqId?: number) => ExtensionHeader[];
