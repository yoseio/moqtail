import type { ExtensionHeader } from "../../dataStreams/extensionHeader";
export type AACLCBitstream = {
    seqId: number;
    pts: number;
    timebase: number;
    sampleFreq: number;
    numChannels: number;
    duration: number;
    wallclock: number;
};
export declare const AACLCBitstreamToExtensionHeader: (props: AACLCBitstream) => ExtensionHeader;
export declare const deserializeAACLCBitstream: (reader: ReadableStream) => Promise<AACLCBitstream>;
