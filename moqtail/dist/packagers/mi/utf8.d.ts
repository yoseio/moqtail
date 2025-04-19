export type utf8Header = {
    seqId: number;
};
export declare const serializeUtf8Header: (props: utf8Header) => Uint8Array;
export declare const deserializeUtf8Header: (reader: ReadableStream) => Promise<utf8Header>;
