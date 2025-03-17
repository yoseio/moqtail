import { CONTENT_EXISTS } from "../constants";
import { type Parameter } from "../utils/parameter";
export declare const serializeSubscribeOk: (props: SubscribeOk) => Uint8Array<ArrayBuffer>;
export declare const deserializeSubscribeOk: (controlReader: ReadableStream) => Promise<SubscribeOk>;
export interface SubscribeOk {
    subscribeId: number;
    expires: number;
    groupOrder: number;
    contentExists: CONTENT_EXISTS;
    largestGroupId?: number;
    largestObjectId?: number;
    parameters?: Parameter[];
}
