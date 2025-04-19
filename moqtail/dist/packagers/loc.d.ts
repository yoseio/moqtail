/// <reference types="dom-webcodecs" />
import type { ExtensionHeader } from "../dataStreams/extensionHeader";
export declare const serializeEncodedChunk: (obj: EncodedVideoChunk | EncodedAudioChunk) => Uint8Array;
export declare const deserializeEncodedChunk: (reader: ReadableStream) => Promise<EncodedVideoChunkInit | EncodedAudioChunkInit>;
export declare const LOC_EXTENSION_HEADER_TYPE: {
    readonly CAPTURE_TIMESTAMP: 2;
    readonly VIDEO_CONFIG: 15;
    readonly AUDIO_CONFIG: 17;
    readonly VIDEO_FRAME_MARKING: 4;
    readonly AUDIO_LEVEL: 6;
};
export declare const videoDecoderConfigToExtensionHeader: (config: VideoDecoderConfig) => ExtensionHeader;
export declare const deserializeVideoDecoderConfig: (buff: Uint8Array) => VideoDecoderConfig;
export declare const audioDecoderConfigToExtensionHeader: (config: AudioDecoderConfig) => ExtensionHeader;
export declare const deserializeAudioDecoderConfig: (readableStream: ReadableStream) => Promise<AudioDecoderConfig>;
