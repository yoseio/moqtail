import { type Parameter } from '../utils/parameter';
export declare const serializeAnnounce: (props: Announce) => Uint8Array;
export declare const deserializeAnnounce: (controlReader: ReadableStream) => Promise<Announce>;
export interface Announce {
    trackNamespace: string[];
    parameters?: Parameter[];
}
