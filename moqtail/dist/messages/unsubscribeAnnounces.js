import { serializeQuicVarInt, stringToVarBytes, concatBuffer, deserializeQuicVarInt } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';
import { deserializeNamespace } from '../utils/namespace';
export const serializeUnsubscribeAnnounces = (trackNamespacePrefix) => {
    const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.UNSUBSCRIBE_ANNOUNCES);
    const trackNamespacePrefixLength = serializeQuicVarInt(trackNamespacePrefix.length);
    const trackNamespacePrefixBytes = trackNamespacePrefix.map(stringToVarBytes);
    const body = concatBuffer([trackNamespacePrefixLength, ...trackNamespacePrefixBytes]);
    const length = serializeQuicVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeUnsubscribeAnnounces = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const trackNamespacePrefix = await deserializeNamespace(controlReader);
    return { trackNamespacePrefix };
};
