import { deserializeQuicVarInt, serializeQuicVarInt } from "../../utils/bytes";
export const serializeUtf8Header = (props) => {
    const seqId = serializeQuicVarInt(props.seqId);
    return seqId;
};
export const deserializeUtf8Header = async (reader) => {
    const seqId = await deserializeQuicVarInt(reader);
    return { seqId };
};
