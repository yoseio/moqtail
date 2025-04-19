import type { ExtensionHeader } from "./extensionHeader";
export declare const deserializeDatagramType: (readableStream: ReadableStream) => Promise<number>;
export declare const serializeDatagram: (props: Datagram) => Uint8Array;
export declare const deserializeDatagramHeader: (readableStream: ReadableStream) => Promise<Datagram>;
export interface Datagram {
    trackAlias: number;
    groupId: number;
    objectId: number;
    publisherPriority: number;
    extensionHeaders: ExtensionHeader[];
    payload: Uint8Array;
}
