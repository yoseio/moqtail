import { type Parameter } from '../utils/parameter';
export declare const serializeSubscribeAnnounces: (props: {
    trackNamespacePrefix: string[];
    parameters?: Parameter[];
}) => Uint8Array<ArrayBuffer>;
export declare const deserializeSubscribeAnnounces: (controlReader: ReadableStream) => Promise<{
    trackNamespacePrefix: string[];
    parameters: Parameter[];
}>;
