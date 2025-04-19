import { serializeQuicVarInt, stringToVarBytes, concatBuffer, deserializeQuicVarInt, varBytesToString } from '../utils/bytes';
import { CONTROL_MESSAGE, SUBSCRIBE_ERROR_REASON } from '../constants';
export const serializeSubscribeError = (props) => {
    const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.SUBSCRIBE_ERROR);
    const subscribeIdBytes = serializeQuicVarInt(props.subscribeId);
    const errorCodeBytes = serializeQuicVarInt(props.errorCode);
    const reasonPhraseBytes = stringToVarBytes(props.reasonPhrase);
    const trackAliasBytes = serializeQuicVarInt(props.trackAlias);
    const body = concatBuffer([subscribeIdBytes, errorCodeBytes, reasonPhraseBytes, trackAliasBytes]);
    const length = serializeQuicVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, subscribeIdBytes, errorCodeBytes, reasonPhraseBytes, trackAliasBytes]);
};
export const deserializeSubscribeError = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const subscribeId = await deserializeQuicVarInt(controlReader);
    const errorCode = await deserializeQuicVarInt(controlReader);
    if (!Object.values(SUBSCRIBE_ERROR_REASON).includes(errorCode)) {
        throw new Error(`Invalid Subscribe Error Code: ${errorCode}`);
    }
    const reasonPhrase = await varBytesToString(controlReader);
    const trackAlias = await deserializeQuicVarInt(controlReader);
    return { subscribeId, errorCode, reasonPhrase, trackAlias };
};
;
