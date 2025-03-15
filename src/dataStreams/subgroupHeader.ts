import { STREAM } from "../constants";
import { concatBuffer, getUint8, numberToVarInt, setUint8, varIntToNumber } from "../utils/bytes";

export const serializeSubgroupHeader = (props: SubgroupHeader) => {
  const streamTypeBytes = numberToVarInt(STREAM.SUBGROUP_HEADER);
  const trackAliasBytes = numberToVarInt(props.trackAlias);
  const groupIdBytes = numberToVarInt(props.groupId);
  const subgroupIdBytes = numberToVarInt(props.subgroupId);
  const publisherPriorityBytes = setUint8(props.publisherPriority);
  return concatBuffer([streamTypeBytes, trackAliasBytes, groupIdBytes, subgroupIdBytes, publisherPriorityBytes]);
}

export const deserializeSubgroupHeader = async (controlReader: ReadableStream): Promise<SubgroupHeader> => {
  const ret: SubgroupHeader = {} as SubgroupHeader;
  ret.trackAlias = await varIntToNumber(controlReader);
  ret.groupId = await varIntToNumber(controlReader);
  ret.subgroupId = await varIntToNumber(controlReader);
  ret.publisherPriority = await getUint8(controlReader);
  return ret;
}

export interface SubgroupHeader {
  trackAlias: number,
  groupId: number,
  subgroupId: number,
  publisherPriority: number,
}
