export declare const serializeSubgroupHeader: (props: SubgroupHeader) => Uint8Array;
export declare const deserializeSubgroupHeader: (controlReader: ReadableStream) => Promise<SubgroupHeader>;
export interface SubgroupHeader {
    trackAlias: number;
    groupId: number;
    subgroupId: number;
    publisherPriority: number;
}
