import { ExtensionHeader } from "./extensionHeader";
export declare const serializeDatagram: (props: {
    trackAlias: number;
    groupId: number;
    objectId: number;
    publisherPriority: number;
    extensionHeaders: ExtensionHeader[];
    payload: Uint8Array;
}) => Uint8Array;
