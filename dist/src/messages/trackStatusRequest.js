import { numberToVarInt, stringToVarBytes, concatBuffer, varIntToNumber, varBytesToString } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';
import { deserializeNamespace } from '../utils/namespace';
export const serializeTrackStatusRequest = (props) => {
    const messageTypeBytes = numberToVarInt(CONTROL_MESSAGE.TRACK_STATUS_REQUEST);
    const trackNamespaceLength = numberToVarInt(props.trackNamespace.length);
    const trackNamespaceBytes = props.trackNamespace.map(stringToVarBytes);
    const trackNameBytes = stringToVarBytes(props.trackName);
    const body = concatBuffer([trackNamespaceLength, ...trackNamespaceBytes, trackNameBytes]);
    const length = numberToVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeTrackStatusRequest = async (controlReader) => {
    await varIntToNumber(controlReader); // length
    const trackNamespace = await deserializeNamespace(controlReader);
    const trackName = await varBytesToString(controlReader);
    return { trackNamespace, trackName };
};
