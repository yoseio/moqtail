import { numberToVarInt, stringToVarBytes, concatBuffer, varIntToNumber } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';
import { deserializeNamespace } from '../utils/namespace';
export const serializeSubscribeAnnouncesOk = (trackNamespacePrefix) => {
    const messageTypeBytes = numberToVarInt(CONTROL_MESSAGE.SUBSCRIBE_ANNOUNCES_OK);
    const trackNamespacePrefixLength = numberToVarInt(trackNamespacePrefix.length);
    const trackNamespacePrefixBytes = trackNamespacePrefix.map(stringToVarBytes);
    const body = concatBuffer([trackNamespacePrefixLength, ...trackNamespacePrefixBytes]);
    const length = numberToVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeSubscribeAnnouncesOk = async (controlReader) => {
    await varIntToNumber(controlReader); // length
    const trackNamespacePrefix = await deserializeNamespace(controlReader);
    return { trackNamespacePrefix };
};
