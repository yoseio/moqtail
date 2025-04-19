import { SUBSCRIBE_ERROR_REASON } from '../constants';
export declare const serializeSubscribeError: (props: SubscribeError) => Uint8Array;
export declare const deserializeSubscribeError: (controlReader: ReadableStream) => Promise<SubscribeError>;
export interface SubscribeError {
    subscribeId: number;
    errorCode: SUBSCRIBE_ERROR_REASON;
    reasonPhrase: string;
    trackAlias: number;
}
