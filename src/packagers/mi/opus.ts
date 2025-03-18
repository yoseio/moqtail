import { concatBuffer, deserializeQuicVarInt, serializeQuicVarInt } from "../../utils/bytes";

export type OpusBitstream = {
  seqId: number,
  pts: number,
  timebase: number,
  sampleFreq: number,
  numChannels: number,
  duration: number,
  wallclock: number
};

export const serializeOpusBitstream = (props: OpusBitstream): Uint8Array => {
  const seqId = serializeQuicVarInt(props.seqId);
  const pts = serializeQuicVarInt(props.pts);
  const timebase = serializeQuicVarInt(props.timebase);
  const sampleFreq = serializeQuicVarInt(props.sampleFreq);
  const numChannels = serializeQuicVarInt(props.numChannels);
  const duration = serializeQuicVarInt(props.duration);
  const wallclock = serializeQuicVarInt(props.wallclock);
  return concatBuffer([seqId, pts, timebase, sampleFreq, numChannels, duration, wallclock]);
}

export const deserializeOpusBitstream = async (reader: ReadableStream): Promise<OpusBitstream> => {
  const seqId = await deserializeQuicVarInt(reader);
  const pts = await deserializeQuicVarInt(reader);
  const timebase = await deserializeQuicVarInt(reader);
  const sampleFreq = await deserializeQuicVarInt(reader);
  const numChannels = await deserializeQuicVarInt(reader);
  const duration = await deserializeQuicVarInt(reader);
  const wallclock = await deserializeQuicVarInt(reader);
  return { seqId, pts, timebase, sampleFreq, numChannels, duration, wallclock };
}
