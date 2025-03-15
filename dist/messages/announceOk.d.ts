export declare const serializeAnnounceOk: (props: {
    trackNamespace: string[];
}) => Uint8Array<ArrayBuffer>;
export declare const deserializeAnnounceOk: (controlReader: ReadableStream) => Promise<{
    trackNamespace: string[];
}>;
export interface AnnounceOk {
    trackNamespace: string[];
}
