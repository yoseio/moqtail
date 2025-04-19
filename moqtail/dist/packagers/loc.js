import { buffRead, concatBuffer, serializeQuicVarInt, stringToVarBytes, varBytesToString, deserializeQuicVarInt, varBytesToStringFromArray, deserializeQuicVarIntFromArray } from "../utils/bytes";
export const serializeEncodedChunk = (obj) => {
    const typeBytes = stringToVarBytes(obj.type);
    const timestampBytes = serializeQuicVarInt(obj.timestamp);
    const durationBytes = serializeQuicVarInt(obj.duration);
    const byteLengthBytes = serializeQuicVarInt(obj.byteLength);
    const payload = new Uint8Array(obj.byteLength);
    obj.copyTo(payload);
    return concatBuffer([typeBytes, timestampBytes, durationBytes, byteLengthBytes, payload]);
};
export const deserializeEncodedChunk = async (reader) => {
    const type = await varBytesToString(reader);
    const timestamp = await deserializeQuicVarInt(reader);
    const duration = await deserializeQuicVarInt(reader);
    const byteLength = await deserializeQuicVarInt(reader);
    const data = await buffRead(reader, byteLength);
    return { type, timestamp, duration, data };
};
export const LOC_EXTENSION_HEADER_TYPE = {
    CAPTURE_TIMESTAMP: 2,
    VIDEO_CONFIG: 15,
    AUDIO_CONFIG: 17,
    VIDEO_FRAME_MARKING: 4,
    AUDIO_LEVEL: 6
};
export const videoDecoderConfigToExtensionHeader = (config) => {
    const codecBytes = stringToVarBytes(config.codec);
    const widthBytes = serializeQuicVarInt(config.codedWidth ?? 0);
    const heightBytes = serializeQuicVarInt(config.codedHeight ?? 0);
    const displayAspectWidthBytes = serializeQuicVarInt(config.displayAspectWidth ?? 0);
    const displayAspectHeightBytes = serializeQuicVarInt(config.displayAspectHeight ?? 0);
    const colorSpaceBytes = stringToVarBytes(JSON.stringify(config.colorSpace ?? ''));
    const hardwareAccelerationBytes = stringToVarBytes(config.hardwareAcceleration ?? 'no-preference');
    // TODO: let moqmi packager handle desc instead of here
    const desc = config.description;
    const codecDescBytes = desc ? new Uint8Array(desc) : new Uint8Array(0);
    const codecDescLengthBytes = serializeQuicVarInt(codecDescBytes.byteLength);
    const data = concatBuffer([codecBytes, widthBytes, heightBytes, displayAspectWidthBytes, displayAspectHeightBytes, colorSpaceBytes, hardwareAccelerationBytes, codecDescLengthBytes, codecDescBytes]);
    return { id: LOC_EXTENSION_HEADER_TYPE.VIDEO_CONFIG, value: data };
};
// export const deserializeVideoDecoderConfig = async (readableStream: ReadableStream): Promise<VideoDecoderConfig> => {
//   const ret: VideoDecoderConfig = {} as VideoDecoderConfig;
//   ret.codec = await varBytesToString(readableStream);
//   const codedWidth = await deserializeQuicVarInt(readableStream);
//   if (codedWidth) ret.codedWidth = codedWidth;
//   const codedHeight = await deserializeQuicVarInt(readableStream);
//   if (codedHeight) ret.codedHeight = codedHeight;
//   const displayAspectWidth = await deserializeQuicVarInt(readableStream);
//   if (displayAspectWidth) ret.displayAspectWidth = displayAspectWidth;
//   const displayAspectHeight = await deserializeQuicVarInt(readableStream);
//   if (displayAspectHeight) ret.displayAspectHeight = displayAspectHeight;
//   const cs = await varBytesToString(readableStream);
//   if (cs) ret.colorSpace = JSON.parse(cs);
//   ret.hardwareAcceleration = await varBytesToString(readableStream) as HardwareAcceleration;
//   const descLength = await deserializeQuicVarInt(readableStream);
//   if (descLength) {
//     const desc = await buffRead(readableStream, descLength);
//     ret.description = desc;
//   }
//   return ret;
// }
export const deserializeVideoDecoderConfig = (buff) => {
    const ret = {};
    let offset = 0;
    let result;
    result = varBytesToStringFromArray(buff);
    ret.codec = result.value;
    offset += result.byteLength;
    result = deserializeQuicVarIntFromArray(buff, offset);
    if (result.value)
        ret.codedWidth = result.value;
    offset += result.byteLength;
    result = deserializeQuicVarIntFromArray(buff, offset);
    if (result.value)
        ret.codedHeight = result.value;
    offset += result.byteLength;
    result = deserializeQuicVarIntFromArray(buff, offset);
    if (result.value)
        ret.displayAspectWidth = result.value;
    offset += result.byteLength;
    result = deserializeQuicVarIntFromArray(buff, offset);
    if (result.value)
        ret.displayAspectHeight = result.value;
    offset += result.byteLength;
    result = varBytesToStringFromArray(buff, offset);
    if (result.value)
        ret.colorSpace = JSON.parse(result.value);
    offset += result.byteLength;
    result = varBytesToStringFromArray(buff, offset);
    if (result.value)
        ret.hardwareAcceleration = result.value;
    offset += result.byteLength;
    result = deserializeQuicVarIntFromArray(buff, offset);
    if (result.value) {
        offset += result.byteLength;
        const desc = new Uint8Array(buff.slice(offset, offset + result.value));
        ret.description = desc.buffer;
    }
    return ret;
};
export const audioDecoderConfigToExtensionHeader = (config) => {
    const codecBytes = stringToVarBytes(config.codec);
    const sampleRateBytes = serializeQuicVarInt(config.sampleRate);
    const channelCountBytes = serializeQuicVarInt(config.numberOfChannels);
    const data = concatBuffer([codecBytes, sampleRateBytes, channelCountBytes]);
    return { id: LOC_EXTENSION_HEADER_TYPE.AUDIO_CONFIG, value: data };
};
export const deserializeAudioDecoderConfig = async (readableStream) => {
    const ret = {};
    ret.codec = await varBytesToString(readableStream);
    ret.sampleRate = await deserializeQuicVarInt(readableStream);
    ret.numberOfChannels = await deserializeQuicVarInt(readableStream);
    return ret;
};
