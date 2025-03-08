export declare const serializeDatagram: (props: {
    trackAlias: number;
    groupId: number;
    objectId: number;
    publisherPriority: number;
    extensionHeaders: any[];
    payload: Uint8Array;
}) => Uint8Array;
