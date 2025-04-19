import { CONTROL_MESSAGE } from "../constants";
import { deserializeParams, serializeParams } from "../utils/parameter";
import { concatBuffer, serializeQuicVarInt, deserializeQuicVarInt } from "../utils/bytes";
export const serializeServerSetup = (props) => {
    const messageType = serializeQuicVarInt(CONTROL_MESSAGE.SERVER_SETUP);
    const selectedVersion = serializeQuicVarInt(props.selectedVersion);
    const params = serializeParams(props.parameters);
    const length = serializeQuicVarInt(concatBuffer([selectedVersion, params]).byteLength);
    return concatBuffer([messageType, length, selectedVersion, params]);
};
export const deserializeServerSetup = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const selectedVersion = await deserializeQuicVarInt(controlReader);
    const parameters = await deserializeParams(CONTROL_MESSAGE.SERVER_SETUP, controlReader);
    return { selectedVersion, parameters };
};
