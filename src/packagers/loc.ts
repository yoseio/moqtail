// serializer/deserializer for Low Overhead Container (https://datatracker.ietf.org/doc/draft-mzanaty-moq-loc/)
import type { ExtensionHeader } from "../dataStreams/extensionHeader";
import { buffRead, concatBuffer, numberToVarInt, stringToVarBytes, varBytesToString, varIntToNumber } from "../utils/bytes"

export const serializeEncodedChunk = (obj: EncodedVideoChunk | EncodedAudioChunk): Uint8Array => {
  const typeBytes = stringToVarBytes(obj.type);
  const timestampBytes = numberToVarInt(obj.timestamp);
  const durationBytes = numberToVarInt(obj.duration);
  const byteLengthBytes = numberToVarInt(obj.byteLength);
  const payload = new Uint8Array(obj.byteLength);
  obj.copyTo(payload);
  return concatBuffer([typeBytes, timestampBytes, durationBytes, byteLengthBytes, payload]);
}

export const deserializeEncodedChunk = async (reader: ReadableStream): Promise<EncodedVideoChunkInit | EncodedAudioChunkInit> => {
  const type = await varBytesToString(reader) as 'delta' | 'key';
  const timestamp = await varIntToNumber(reader);
  const duration = await varIntToNumber(reader);
  const byteLength = await varIntToNumber(reader);
  const data = await buffRead(reader, byteLength);
  return { type, timestamp, duration, data };
}

export const LOC_EXTENSION_HEADER_TYPE = {
  CAPTURE_TIMESTAMP: 2,
  VIDEO_CONFIG: 15, // 16
  AUDIO_CONFIG: 17,
  VIDEO_FRAME_MARKING: 4,
  AUDIO_LEVEL: 6
} as const;

export const videoDecoderConfigToExtensionHeader = (config: VideoDecoderConfig): ExtensionHeader => {
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
}

export const deserializeVideoDecoderConfig = async (readableStream: ReadableStream): Promise<VideoDecoderConfig> => {
  const ret: VideoDecoderConfig = {} as VideoDecoderConfig;
  ret.codec = await varBytesToString(readableStream);
  const codedWidth = await varIntToNumber(readableStream);
  if (codedWidth) ret.codedWidth = codedWidth;
  const codedHeight = await varIntToNumber(readableStream);
  if (codedHeight) ret.codedHeight = codedHeight;
  const displayAspectWidth = await varIntToNumber(readableStream);
  if (displayAspectWidth) ret.displayAspectWidth = displayAspectWidth;
  const displayAspectHeight = await varIntToNumber(readableStream);
  if (displayAspectHeight) ret.displayAspectHeight = displayAspectHeight;
  const cs = await varBytesToString(readableStream);
  if (cs) ret.colorSpace = JSON.parse(cs);
  ret.hardwareAcceleration = await varBytesToString(readableStream) as HardwareAcceleration;
  return ret;
}

export const audioDecoderConfigToExtensionHeader = (config: AudioDecoderConfig): ExtensionHeader => {
  const codecBytes = stringToVarBytes(config.codec);
  const sampleRateBytes = numberToVarInt(config.sampleRate);
  const channelCountBytes = numberToVarInt(config.numberOfChannels);
  const data = concatBuffer([codecBytes, sampleRateBytes, channelCountBytes]);
  return { id: LOC_EXTENSION_HEADER_TYPE.AUDIO_CONFIG, value: data };
}

export const deserializeAudioDecoderConfig = async (readableStream: ReadableStream): Promise<AudioDecoderConfig> => {
  const ret: AudioDecoderConfig = {} as AudioDecoderConfig;
  ret.codec = await varBytesToString(readableStream);
  ret.sampleRate = await varIntToNumber(readableStream);
  ret.numberOfChannels = await varIntToNumber(readableStream);
  return ret;
}
