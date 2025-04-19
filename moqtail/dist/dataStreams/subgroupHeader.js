import { STREAM } from "../constants";
import { concatBuffer, getUint8, serializeQuicVarInt, setUint8, deserializeQuicVarInt } from "../utils/bytes";
export const serializeSubgroupHeader = (props) => {
    const streamTypeBytes = serializeQuicVarInt(STREAM.SUBGROUP_HEADER);
    const trackAliasBytes = serializeQuicVarInt(props.trackAlias);
    const groupIdBytes = serializeQuicVarInt(props.groupId);
    const subgroupIdBytes = serializeQuicVarInt(props.subgroupId);
    const publisherPriorityBytes = setUint8(props.publisherPriority);
    return concatBuffer([streamTypeBytes, trackAliasBytes, groupIdBytes, subgroupIdBytes, publisherPriorityBytes]);
};
export const deserializeSubgroupHeader = async (controlReader) => {
    const ret = {};
    ret.trackAlias = await deserializeQuicVarInt(controlReader);
    ret.groupId = await deserializeQuicVarInt(controlReader);
    ret.subgroupId = await deserializeQuicVarInt(controlReader);
    ret.publisherPriority = await getUint8(controlReader);
    return ret;
};
