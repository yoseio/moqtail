import type { ExtensionHeader } from "./extensionHeader";
export declare const serializeDatagram: (props: Datagram) => Uint8Array<ArrayBuffer>;
export declare const deserializeDatagram: (readableStream: ReadableStream) => Promise<Datagram>;
export interface Datagram {
    trackAlias: number;
    groupId: number;
    objectId: number;
    publisherPriority: number;
    extensionHeaders: ExtensionHeader[];
    payload: Uint8Array;
}
