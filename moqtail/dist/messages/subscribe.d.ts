import { GROUP_ORDER, SUBSCRIBE_FILTER } from "../constants";
import { type Parameter } from "../utils/parameter";
export declare const serializeSubscribe: (props: Subscribe) => Uint8Array<ArrayBuffer>;
export declare const deserializeSubscribe: (controlReader: ReadableStream) => Promise<Subscribe>;
export interface Subscribe {
    subscribeId: number;
    trackAlias: number;
    trackNamespace: string[];
    trackName: string;
    subscriberPriority: number;
    groupOrder: GROUP_ORDER;
    filterType: SUBSCRIBE_FILTER;
    startGroup?: number;
    startObject?: number;
    endGroup?: number;
    parameters?: Parameter[];
}
