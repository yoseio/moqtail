import type { ExtensionHeader } from "../../dataStreams/extensionHeader";
export type H264AVCCMetadata = {
    seqId: number;
    pts: number;
    dts: number;
    timebase: number;
    duration: number;
    wallclock: number;
};
export declare const H264AVCCMetadataToExtensionHeader: (props: H264AVCCMetadata) => ExtensionHeader;
export declare const deserializeH264AVCCMetadata: (controlReader: ReadableStream) => Promise<H264AVCCMetadata>;
export declare const H264AVCCExtraDataToExtensionHeader: (props: ArrayBuffer) => ExtensionHeader;
