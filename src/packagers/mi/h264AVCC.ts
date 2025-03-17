import { buffRead, concatBuffer, numberToVarInt, varIntToNumber } from "src/temp/utils/bytes";

export type H264AVCCMetadata = {
  seqId: number,
  pts: number,
  dts: number,
  timebase: number,
  duration: number,
  wallclock: number
}

export const serializeH264AVCCMetadata = (props: H264AVCCMetadata): Uint8Array => {
  const seqIdBytes = numberToVarInt(props.seqId);
  const ptsBytes = numberToVarInt(props.pts);
  const dtsBytes = numberToVarInt(props.dts);
  const timebaseBytes = numberToVarInt(props.timebase);
  const durationBytes = numberToVarInt(props.duration);
  const wallclockBytes = numberToVarInt(props.wallclock);
  return concatBuffer([seqIdBytes, ptsBytes, dtsBytes, timebaseBytes, durationBytes, wallclockBytes]);
}

export const deserializeH264AVCCMetadata = async (controlReader: ReadableStream): Promise<H264AVCCMetadata> => {
  const seqId = await varIntToNumber(controlReader);
  const pts = await varIntToNumber(controlReader);
  const dts = await varIntToNumber(controlReader);
  const timebase = await varIntToNumber(controlReader);
  const duration = await varIntToNumber(controlReader);
  const wallclock = await varIntToNumber(controlReader);
  return { seqId, pts, dts, timebase, duration, wallclock };
}

type AVCDecoderConfigurationRecord = {
  configurationVersion: number; // 8 bits, typically 1
  AVCProfileIndication: number; // 8 bits, specifies the profile (e.g., Baseline, Main, High)
  profileCompatibility: number; // 8 bits, compatibility flags
  AVCLevelIndication: number; // 8 bits, specifies the level (e.g., Level 3.1)
  lengthSizeMinusOne: number; // 2 bits, indicates the size of NALUnitLength field minus one
  sequenceParameterSets: {
    sequenceParameterSetLength: number; // 16 bits, length of SPS NAL unit
    sequenceParameterSetNALUnit: Uint8Array; // SPS NAL unit data
  }[];
  pictureParameterSets: {
    pictureParameterSetLength: number; // 16 bits, length of PPS NAL unit
    pictureParameterSetNALUnit: Uint8Array; // PPS NAL unit data
  }[];
};

export type H264AVCCExtraData = {
  extraData: AVCDecoderConfigurationRecord
}

export const serializeH264AVCCExtraData = (props: H264AVCCExtraData): Uint8Array => {
  const configurationVersion = numberToVarInt(props.extraData.configurationVersion);
  const AVCProfileIndication = numberToVarInt(props.extraData.AVCProfileIndication);
  const profileCompatibility = numberToVarInt(props.extraData.profileCompatibility);
  const AVCLevelIndication = numberToVarInt(props.extraData.AVCLevelIndication);
  const lengthSizeMinusOne = numberToVarInt(props.extraData.lengthSizeMinusOne);
  const sequenceParameterSets = props.extraData.sequenceParameterSets.map(sps => concatBuffer([numberToVarInt(sps.sequenceParameterSetLength), sps.sequenceParameterSetNALUnit]));
  const pictureParameterSets = props.extraData.pictureParameterSets.map(pps => concatBuffer([numberToVarInt(pps.pictureParameterSetLength), pps.pictureParameterSetNALUnit]));
  return concatBuffer([configurationVersion, AVCProfileIndication, profileCompatibility, AVCLevelIndication, lengthSizeMinusOne, ...sequenceParameterSets, ...pictureParameterSets]);
}

export const deserializeH264AVCCExtraData = async (controlReader: ReadableStream): Promise<H264AVCCExtraData> => {
  const configurationVersion = await varIntToNumber(controlReader);
  const AVCProfileIndication = await varIntToNumber(controlReader);
  const profileCompatibility = await varIntToNumber(controlReader);
  const AVCLevelIndication = await varIntToNumber(controlReader);
  const lengthSizeMinusOne = await varIntToNumber(controlReader);
  const sequenceParameterSets = [];
  const numSPS = await varIntToNumber(controlReader);
  for (let i = 0; i < numSPS; i++) {
    const sequenceParameterSetLength = await varIntToNumber(controlReader);
    const sequenceParameterSetNALUnit = await buffRead(controlReader, sequenceParameterSetLength);
    sequenceParameterSets.push({ sequenceParameterSetLength, sequenceParameterSetNALUnit });
  }
  const pictureParameterSets = [];
  const numPPS = await varIntToNumber(controlReader);
  for (let i = 0; i < numPPS; i++) {
    const pictureParameterSetLength = await varIntToNumber(controlReader);
    const pictureParameterSetNALUnit = await buffRead(controlReader, pictureParameterSetLength);
    pictureParameterSets.push({ pictureParameterSetLength, pictureParameterSetNALUnit });
  }
  return { extraData: { configurationVersion, AVCProfileIndication, profileCompatibility, AVCLevelIndication, lengthSizeMinusOne, sequenceParameterSets, pictureParameterSets } };
}
