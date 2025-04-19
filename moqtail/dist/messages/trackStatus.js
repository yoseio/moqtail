import { serializeQuicVarInt, stringToVarBytes, concatBuffer, deserializeQuicVarInt, varBytesToString } from '../utils/bytes';
import { CONTROL_MESSAGE, TRACK_STATUS_CODE } from '../constants';
import { deserializeNamespace } from '../utils/namespace';
export const serializeTrackStatus = (props) => {
    const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.TRACK_STATUS);
    const trackNamespaceLength = serializeQuicVarInt(props.trackNamespace.length);
    const trackNamespaceBytes = props.trackNamespace.map(stringToVarBytes);
    const trackNameBytes = stringToVarBytes(props.trackName);
    const statusCodeBytes = serializeQuicVarInt(props.statusCode);
    const lastGroupIdBytes = serializeQuicVarInt(props.lastGroupId);
    const lastObjectIdBytes = serializeQuicVarInt(props.lastObjectId);
    const body = concatBuffer([trackNamespaceLength, ...trackNamespaceBytes, trackNameBytes, statusCodeBytes, lastGroupIdBytes, lastObjectIdBytes]);
    const length = serializeQuicVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeTrackStatus = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const trackNamespace = await deserializeNamespace(controlReader);
    const trackName = await varBytesToString(controlReader);
    const statusCode = await deserializeQuicVarInt(controlReader);
    if (!Object.values(TRACK_STATUS_CODE).includes(statusCode)) {
        throw new Error(`Invalid Track Status Code: ${statusCode}`);
    }
    const lastGroupId = await deserializeQuicVarInt(controlReader);
    const lastObjectId = await deserializeQuicVarInt(controlReader);
    return { trackNamespace, trackName, statusCode, lastGroupId, lastObjectId };
};
