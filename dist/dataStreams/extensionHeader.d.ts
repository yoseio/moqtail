export interface ExtensionHeader {
    type: number;
    value: number | string;
}
export declare const serializeExtensionHeader: (props: ExtensionHeader) => Uint8Array<ArrayBuffer>;
export declare const deserializeExtensionHeader: (reader: ReadableStream) => Promise<ExtensionHeader>;
