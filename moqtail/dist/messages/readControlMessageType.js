import { deserializeQuicVarInt } from "../utils/bytes";
export const readControlMessageType = async (reader) => {
    return await deserializeQuicVarInt(reader);
};
