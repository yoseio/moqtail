export declare const serializeMaxSubscribeId: (props: {
    subscribeId: number;
}) => Uint8Array<ArrayBuffer>;
export declare const deserializeMaxSubscribeId: (controlReader: ReadableStream) => Promise<{
    subscribeId: number;
}>;
