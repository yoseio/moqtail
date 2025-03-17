export declare const serializeSubscribeAnnouncesOk: (trackNamespacePrefix: string[]) => Uint8Array<ArrayBuffer>;
export declare const deserializeSubscribeAnnouncesOk: (controlReader: ReadableStream) => Promise<{
    trackNamespacePrefix: string[];
}>;
