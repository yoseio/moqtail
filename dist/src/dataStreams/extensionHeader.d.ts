export interface ExtensionHeader {
    id: number;
    value: number | string | Uint8Array;
}
export declare const serializeExtensionHeader: (props: ExtensionHeader) => Uint8Array<ArrayBuffer>;
export declare const deserializeExtensionHeader: (reader: ReadableStream) => Promise<ExtensionHeader>;
