import type { ExtensionHeader } from "../dataStreams/extensionHeader";
export declare const serializeEncodedChunk: (obj: EncodedVideoChunk | EncodedAudioChunk) => Uint8Array;
export declare const deserializeEncodedChunk: (reader: ReadableStream) => Promise<EncodedVideoChunkInit | EncodedAudioChunkInit>;
export declare const LOC_EXTENSION_HEADER_TYPE: {
    CAPTURE_TIMESTAMP: number;
    VIDEO_CONFIG: number;
    VIDEO_FRAME_MARKING: number;
    AUDIO_LEVEL: number;
};
export declare const videoDecoderConfigToExtensionHeader: (config: VideoDecoderConfig) => ExtensionHeader;
