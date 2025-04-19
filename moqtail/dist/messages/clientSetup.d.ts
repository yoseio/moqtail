import { type Parameter } from "../utils/parameter";
export declare const serializeClientSetup: (props: {
    supportedVersions: number[];
    params?: Parameter[];
}) => Uint8Array;
export declare const deserializeClientSetup: (controlReader: ReadableStream) => Promise<{
    versions: number[];
    parameters: Parameter[];
}>;
