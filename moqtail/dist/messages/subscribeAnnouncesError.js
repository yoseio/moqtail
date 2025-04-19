import { serializeQuicVarInt, stringToVarBytes, concatBuffer, deserializeQuicVarInt, varBytesToString } from '../utils/bytes';
import { CONTROL_MESSAGE, SUBSCRIBE_ANNOUNCES_ERROR_REASON } from '../constants';
import { deserializeNamespace } from '../utils/namespace';
export const serializeSubscribeAnnouncesError = (props) => {
    const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.SUBSCRIBE_ANNOUNCES_ERROR);
    const trackNamespacePrefixLength = serializeQuicVarInt(props.trackNamespacePrefix.length);
    const trackNamespacePrefixBytes = props.trackNamespacePrefix.map(stringToVarBytes);
    const errorCodeBytes = serializeQuicVarInt(props.errorCode);
    const reasonPhraseBytes = stringToVarBytes(props.reasonPhrase);
    const body = concatBuffer([trackNamespacePrefixLength, ...trackNamespacePrefixBytes, errorCodeBytes, reasonPhraseBytes]);
    const length = serializeQuicVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeSubscribeAnnouncesError = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const trackNamespacePrefix = await deserializeNamespace(controlReader);
    const errorCode = await deserializeQuicVarInt(controlReader);
    if (!Object.values(SUBSCRIBE_ANNOUNCES_ERROR_REASON).includes(errorCode)) {
        throw new Error(`Invalid Subscribe Announces Error Code: ${errorCode}`);
    }
    const reasonPhrase = await varBytesToString(controlReader);
    return { trackNamespacePrefix, errorCode, reasonPhrase };
};
