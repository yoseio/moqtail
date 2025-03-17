export declare const serializeUnannounce: (props: {
    trackNamespace: string[];
}) => Uint8Array<ArrayBuffer>;
export declare const deserializeUnannounce: (controlReader: ReadableStream) => Promise<{
    trackNamespace: string[];
}>;
export interface Unannounce {
    trackNamespace: string[];
}
