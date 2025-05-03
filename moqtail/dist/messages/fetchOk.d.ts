import { type Parameter } from '../utils/parameter';
export declare const serializeFetchOk: (props: {
    subscribeId: number;
    groupOrder: number;
    endOfTrack: number;
    largestGroupId: number;
    largestObjectId: number;
    parameters?: Parameter[];
}) => Uint8Array<ArrayBuffer>;
export declare const deserializeFetchOk: (controlReader: ReadableStream) => Promise<{
    subscribeId: number;
    groupOrder: number;
    endOfTrack: number;
    largestGroupId: number;
    largestObjectId: number;
    parameters: Parameter[];
}>;
