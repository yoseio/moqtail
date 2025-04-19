import { serializeQuicVarInt, concatBuffer, deserializeQuicVarInt, stringToVarBytes, varBytesToString, setUint8, getUint8 } from '../utils/bytes';
import { CONTROL_MESSAGE, FETCH_TYPE } from '../constants';
import { deserializeParams, serializeParams } from '../utils/parameter';
import { deserializeNamespace } from '../utils/namespace';
export const serializeFetch = (props) => {
    const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.FETCH);
    const subscribeIdBytes = serializeQuicVarInt(props.subscribeId);
    const subscriberPriorityBytes = setUint8(props.subscriberPriority);
    const groupOrderBytes = setUint8(props.groupOrder);
    const fetchTypeBytes = serializeQuicVarInt(props.fetchType);
    let body;
    if (props.fetchType === FETCH_TYPE.STANDALONE) {
        if (!props.trackNamespace || !props.trackName || !props.startGroup || !props.startObject || !props.endGroup || !props.endObject) {
            throw new Error('Invalid Fetch props for Standalone');
        }
        const trackNamespaceLength = serializeQuicVarInt(props.trackNamespace.length);
        const trackNamespaceBytes = props.trackNamespace.map(stringToVarBytes);
        const trackNameBytes = stringToVarBytes(props.trackName);
        const startGroupBytes = serializeQuicVarInt(props.startGroup);
        const startObjectBytes = serializeQuicVarInt(props.startObject);
        const endGroupBytes = serializeQuicVarInt(props.endGroup);
        const endObjectBytes = serializeQuicVarInt(props.endObject);
        const parametersBytes = serializeParams(props.parameters || []);
        body = concatBuffer([subscribeIdBytes, subscriberPriorityBytes, groupOrderBytes, fetchTypeBytes, trackNamespaceLength, ...trackNamespaceBytes, trackNameBytes, startGroupBytes, startObjectBytes, endGroupBytes, endObjectBytes, parametersBytes]);
    }
    else {
        if (!props.joiningSubscribeId || !props.precedingGroupOffset) {
            throw new Error('Invalid Fetch props for Joining');
        }
        const joiningSubscribeIdBytes = serializeQuicVarInt(props.joiningSubscribeId);
        const precedingGroupOffsetBytes = serializeQuicVarInt(props.precedingGroupOffset);
        const parametersBytes = serializeParams(props.parameters || []);
        body = concatBuffer([subscribeIdBytes, subscriberPriorityBytes, groupOrderBytes, fetchTypeBytes, joiningSubscribeIdBytes, precedingGroupOffsetBytes, parametersBytes]);
    }
    const length = serializeQuicVarInt(body.byteLength);
    return concatBuffer([messageTypeBytes, length, body]);
};
export const deserializeFetch = async (controlReader) => {
    await deserializeQuicVarInt(controlReader); // length
    const subscribeId = await deserializeQuicVarInt(controlReader);
    const subscriberPriority = await getUint8(controlReader);
    const groupOrder = await getUint8(controlReader);
    const fetchType = await deserializeQuicVarInt(controlReader);
    if (fetchType !== FETCH_TYPE.STANDALONE && fetchType !== FETCH_TYPE.JOINING) {
        throw new Error(`Invalid Fetch Type: ${fetchType}`);
    }
    let result = { subscribeId, subscriberPriority, groupOrder, fetchType };
    if (fetchType === FETCH_TYPE.STANDALONE) {
        const trackNamespace = await deserializeNamespace(controlReader);
        const trackName = await varBytesToString(controlReader);
        const startGroup = await deserializeQuicVarInt(controlReader);
        const startObject = await deserializeQuicVarInt(controlReader);
        const endGroup = await deserializeQuicVarInt(controlReader);
        const endObject = await deserializeQuicVarInt(controlReader);
        const parameters = await deserializeParams(CONTROL_MESSAGE.FETCH, controlReader);
        result = { ...result, trackNamespace, trackName, startGroup, startObject, endGroup, endObject, parameters };
    }
    else {
        const joiningSubscribeId = await deserializeQuicVarInt(controlReader);
        const precedingGroupOffset = await deserializeQuicVarInt(controlReader);
        const parameters = await deserializeParams(CONTROL_MESSAGE.FETCH, controlReader);
        result = { ...result, joiningSubscribeId, precedingGroupOffset, parameters };
    }
    return result;
};
