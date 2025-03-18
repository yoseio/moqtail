import { concatBuffer, deserializeQuicVarInt, serializeQuicVarInt } from "../../utils/bytes";

export type AACLCBitstream = {
  seqId: number,
  pts: number,
  timebase: number,
  sampleFreq: number,
  numChannels: number,
  duration: number,
  wallclock: number
};

export const serializeAACLCBitstream = (props: AACLCBitstream): Uint8Array => {
  const seqId = serializeQuicVarInt(props.seqId);
  const pts = serializeQuicVarInt(props.pts);
  const timebase = serializeQuicVarInt(props.timebase);
  const sampleFreq = serializeQuicVarInt(props.sampleFreq);
  const numChannels = serializeQuicVarInt(props.numChannels);
  const duration = serializeQuicVarInt(props.duration);
  const wallclock = serializeQuicVarInt(props.wallclock);
  return concatBuffer([seqId, pts, timebase, sampleFreq, numChannels, duration, wallclock]);
}

export const deserializeAACLCBitstream = async (reader: ReadableStream): Promise<AACLCBitstream> => {
  const seqId = await deserializeQuicVarInt(reader);
  const pts = await deserializeQuicVarInt(reader);
  const timebase = await deserializeQuicVarInt(reader);
  const sampleFreq = await deserializeQuicVarInt(reader);
  const numChannels = await deserializeQuicVarInt(reader);
  const duration = await deserializeQuicVarInt(reader);
  const wallclock = await deserializeQuicVarInt(reader);
  return { seqId, pts, timebase, sampleFreq, numChannels, duration, wallclock };
}
