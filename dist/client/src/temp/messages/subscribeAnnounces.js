import { numberToVarInt, stringToVarBytes, concatBuffer, varIntToNumber } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';
import { serializeParams, deserializeParams } from '../utils/parameter';
import { deserializeNamespace } from '../utils/namespace';
export const serializeSubscribeAnnounces = (props) => {
    const messageTypeBytes = numberToVarInt(CONTROL_MESSAGE.SUBSCRIBE_ANNOUNCES);
    const trackNamespacePrefixLength = numberToVarInt(props.trackNamespacePrefix.length);
    const trackNamespacePrefixBytes = props.trackNamespacePrefix.map(stringToVarBytes);
    const parametersBytes = serializeParams(props.parameters || []);
    const body = concatBuffer([trackNamespacePrefixLength, ...trackNamespacePrefixBytes, parametersBytes]);
    const length = numberToVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeSubscribeAnnounces = async (controlReader) => {
    await varIntToNumber(controlReader); // length
    const trackNamespacePrefix = await deserializeNamespace(controlReader);
    const parameters = await deserializeParams(CONTROL_MESSAGE.SUBSCRIBE_ANNOUNCES, controlReader);
    return { trackNamespacePrefix, parameters };
};
