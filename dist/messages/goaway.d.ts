export declare const serializeGoaway: (props: {
    newSessionUri: string;
}) => Uint8Array<ArrayBuffer>;
export declare const deserializeGoaway: (controlReader: ReadableStream) => Promise<{
    newSessionUri: string;
}>;
