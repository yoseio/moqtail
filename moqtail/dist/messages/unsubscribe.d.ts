export declare const serializeUnsubscribe: (subscribeId: number) => Uint8Array<ArrayBuffer>;
export declare const deserializeUnsubscribe: (controlReader: ReadableStream) => Promise<{
    subscribeId: number;
}>;
export interface Unsubscribe {
    subscribeId: number;
}
