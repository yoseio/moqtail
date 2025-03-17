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
    VIDEO_CONFIG: 15, // 16
    AUDIO_CONFIG: 17,
    VIDEO_FRAME_MARKING: 4,
    AUDIO_LEVEL: 6
};
export const videoDecoderConfigToExtensionHeader = (config) => {
    const codecBytes = stringToVarBytes(config.codec);
    // TODO: desc
    const widthBytes = numberToVarInt(config.codedWidth ?? 0);
    const heightBytes = numberToVarInt(config.codedHeight ?? 0);
    const displayAspectWidthBytes = numberToVarInt(config.displayAspectWidth ?? 0);
    const displayAspectHeightBytes = numberToVarInt(config.displayAspectHeight ?? 0);
    const colorSpaceBytes = stringToVarBytes(JSON.stringify(config.colorSpace ?? ''));
    const hardwareAccelerationBytes = stringToVarBytes(config.hardwareAcceleration ?? 'no-preference');
    const data = concatBuffer([codecBytes, widthBytes, heightBytes, displayAspectWidthBytes, displayAspectHeightBytes, colorSpaceBytes, hardwareAccelerationBytes]);
    return { id: LOC_EXTENSION_HEADER_TYPE.VIDEO_CONFIG, value: data };
};
export const deserializeVideoDecoderConfig = async (readableStream) => {
    const ret = {};
    ret.codec = await varBytesToString(readableStream);
    const codedWidth = await varIntToNumber(readableStream);
    if (codedWidth)
        ret.codedWidth = codedWidth;
    const codedHeight = await varIntToNumber(readableStream);
    if (codedHeight)
        ret.codedHeight = codedHeight;
    const displayAspectWidth = await varIntToNumber(readableStream);
    if (displayAspectWidth)
        ret.displayAspectWidth = displayAspectWidth;
    const displayAspectHeight = await varIntToNumber(readableStream);
    if (displayAspectHeight)
        ret.displayAspectHeight = displayAspectHeight;
    const cs = await varBytesToString(readableStream);
    if (cs)
        ret.colorSpace = JSON.parse(cs);
    ret.hardwareAcceleration = await varBytesToString(readableStream);
    return ret;
};
export const audioDecoderConfigToExtensionHeader = (config) => {
    const codecBytes = stringToVarBytes(config.codec);
    const sampleRateBytes = numberToVarInt(config.sampleRate);
    const channelCountBytes = numberToVarInt(config.numberOfChannels);
    const data = concatBuffer([codecBytes, sampleRateBytes, channelCountBytes]);
    return { id: LOC_EXTENSION_HEADER_TYPE.AUDIO_CONFIG, value: data };
};
export const deserializeAudioDecoderConfig = async (readableStream) => {
    const ret = {};
    ret.codec = await varBytesToString(readableStream);
    ret.sampleRate = await varIntToNumber(readableStream);
    ret.numberOfChannels = await varIntToNumber(readableStream);
    return ret;
};
