import type { ExtensionHeader } from "../../dataStreams/extensionHeader";
export type OpusBitstream = {
    seqId: number;
    pts: number;
    timebase: number;
    sampleFreq: number;
    numChannels: number;
    duration: number;
    wallclock: number;
};
export declare const opusBitstreamToExtensionHeader: (props: OpusBitstream) => ExtensionHeader;
export declare const deserializeOpusBitstream: (reader: ReadableStream) => Promise<OpusBitstream>;
