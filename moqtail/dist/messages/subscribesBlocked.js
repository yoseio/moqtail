import { CONTROL_MESSAGE } from "../constants";
import { concatBuffer, serializeQuicVarInt, deserializeQuicVarInt } from "../utils/bytes";
export const serializeSubscribesBlocked = (props) => {
    const messageType = serializeQuicVarInt(CONTROL_MESSAGE.SUBSCRIBES_BLOCKED);
    const maxSubscribeIdBytes = serializeQuicVarInt(props.maxSubscribeId);
    const length = serializeQuicVarInt(maxSubscribeIdBytes.byteLength);
    return concatBuffer([messageType, length, maxSubscribeIdBytes]);
};
export const deserializeSubscribesBlocked = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const maxSubscribeId = await deserializeQuicVarInt(controlReader);
    return { maxSubscribeId };
};
