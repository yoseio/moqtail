export declare const buffReadFrombyobReader: (reader: ReadableStreamBYOBReader, buffer: ArrayBuffer, offset: number, size: number) => Promise<ArrayBuffer>;
export declare const getNumberLength: (v: number | bigint) => 2 | 4 | 1 | 8;
export declare const serializeQuicVarInt: (value: number | bigint) => Uint8Array<ArrayBufferLike>;
export declare const deserializeQuicVarInt: (readableStream: ReadableStream) => Promise<number>;
export declare const deserializeQuicVarIntFromArray: (data: Uint8Array, offset?: number) => {
    value: number;
    byteLength: number;
};
export declare const getUint8: (readableStream: ReadableStream) => Promise<number>;
export declare const setUint8: (v: number) => Uint8Array<ArrayBuffer>;
export declare const concatBuffer: (arr: Uint8Array[]) => Uint8Array<ArrayBuffer>;
export declare const buffRead: (readableStream: ReadableStream, size: number) => Promise<Uint8Array>;
export declare const buffReadFromArray: (data: Uint8Array, size: number, offset: number) => Uint8Array;
export declare const readUntilEof: (readableStream: any, blockSize: any) => Promise<Uint8Array<ArrayBuffer>>;
export declare const stringToVarBytes: (str: string) => Uint8Array<ArrayBuffer>;
export declare const varBytesToString: (receiveStream: ReadableStream) => Promise<string>;
export declare const varBytesToStringFromArray: (data: Uint8Array, offset?: number) => {
    byteLength: number;
    value: string;
};
