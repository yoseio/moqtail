import { type Parameter } from "../utils/parameter";
export declare const serializeServerSetup: (props: ServerSetup) => Uint8Array<ArrayBuffer>;
export declare const deserializeServerSetup: (controlReader: ReadableStream) => Promise<{
    selectedVersion: number;
    parameters: Parameter[];
}>;
export interface ServerSetup {
    selectedVersion: number;
    parameters: Parameter[];
}
