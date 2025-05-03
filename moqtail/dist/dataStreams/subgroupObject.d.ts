import type { OBJECT_STATUS } from "../constants";
import { type ExtensionHeader } from "./extensionHeader";
export declare const serializeSubgroupObject: (props: SubgroupObject) => Uint8Array<ArrayBuffer>;
export declare const deserializeSubgroupObjectHeader: (readableStream: ReadableStream) => Promise<SubgroupObject>;
export interface SubgroupObject {
    objectId: number;
    extensionHeaders: ExtensionHeader[];
    objectStatus?: OBJECT_STATUS;
    payload: Uint8Array;
}
