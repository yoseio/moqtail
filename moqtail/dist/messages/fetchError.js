import { serializeQuicVarInt, stringToVarBytes, concatBuffer, deserializeQuicVarInt, varBytesToString } from '../utils/bytes';
import { CONTROL_MESSAGE, FETCH_ERROR_REASON } from '../constants';
export const serializeFetchError = (props) => {
    const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.FETCH_ERROR);
    const subscribeIdBytes = serializeQuicVarInt(props.subscribeId);
    const errorCodeBytes = serializeQuicVarInt(props.errorCode);
    const reasonPhraseBytes = stringToVarBytes(props.reasonPhrase);
    const body = concatBuffer([subscribeIdBytes, errorCodeBytes, reasonPhraseBytes]);
    const length = serializeQuicVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeFetchError = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const subscribeId = await deserializeQuicVarInt(controlReader);
    const errorCode = await deserializeQuicVarInt(controlReader);
    if (!Object.values(FETCH_ERROR_REASON).includes(errorCode)) {
        throw new Error(`Invalid Fetch Error Code: ${errorCode}`);
    }
    const reasonPhrase = await varBytesToString(controlReader);
    return { subscribeId, errorCode, reasonPhrase };
};
