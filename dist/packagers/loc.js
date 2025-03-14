import { buffRead, concatBuffer, numberToVarInt, stringToVarBytes, varBytesToString, varIntToNumber } from "../utils/bytes";
export const serializeEncodedChunk = (obj) => {
    const typeBytes = stringToVarBytes(obj.type);
    const timestampBytes = numberToVarInt(obj.timestamp);
    const durationBytes = numberToVarInt(obj.duration);
    const byteLengthBytes = numberToVarInt(obj.byteLength);
    const payload = new Uint8Array(obj.byteLength);
    obj.copyTo(payload);
    return concatBuffer([typeBytes, timestampBytes, durationBytes, byteLengthBytes, payload]);
};
export const deserializeEncodedChunk = async (reader) => {
    const type = await varBytesToString(reader);
    const timestamp = await varIntToNumber(reader);
    const duration = await varIntToNumber(reader);
    const byteLength = await varIntToNumber(reader);
    const data = await buffRead(reader, byteLength);
    return { type, timestamp, duration, data };
};
export const LOC_EXTENSION_HEADER_TYPE = {
    CAPTURE_TIMESTAMP: 2,
    VIDEO_CONFIG: 16,
    VIDEO_FRAME_MARKING: 4,
    AUDIO_LEVEL: 6
};
export const videoDecoderConfigToExtensionHeader = (config) => {
    const jsn = JSON.stringify(config);
    return { type: LOC_EXTENSION_HEADER_TYPE.VIDEO_CONFIG, value: jsn };
};
