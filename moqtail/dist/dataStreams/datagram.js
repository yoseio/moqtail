import { DATAGRAM } from "../constants";
import { concatBuffer, getUint8, serializeQuicVarInt, setUint8, deserializeQuicVarInt } from "../utils/bytes";
import { deserializeExtensionHeader, serializeExtensionHeader } from "./extensionHeader";
export const deserializeDatagramType = async (readableStream) => {
    return await deserializeQuicVarInt(readableStream);
};
export const serializeDatagram = (props) => {
    const typeBytes = serializeQuicVarInt(props.payload.byteLength ? DATAGRAM.OBJECT_DATAGRAM : DATAGRAM.OBJECT_DATAGRAM_STATUS);
    const trackAliasBytes = serializeQuicVarInt(props.trackAlias);
    const groupIdBytes = serializeQuicVarInt(props.groupId);
    const objectIdBytes = serializeQuicVarInt(props.objectId);
    const publisherPriorityBytes = setUint8(props.publisherPriority);
    const extensionHeadersLengthBytes = serializeQuicVarInt(props.extensionHeaders.length);
    const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
    const datagram = concatBuffer([typeBytes, trackAliasBytes, groupIdBytes, objectIdBytes, publisherPriorityBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, props.payload]);
    return datagram;
};
export const deserializeDatagramHeader = async (readableStream) => {
    const ret = {};
    ret.trackAlias = await deserializeQuicVarInt(readableStream);
    ret.groupId = await deserializeQuicVarInt(readableStream);
    ret.objectId = await deserializeQuicVarInt(readableStream);
    ret.publisherPriority = await getUint8(readableStream);
    const extensionHeadersLength = await deserializeQuicVarInt(readableStream);
    ret.extensionHeaders = [];
    for (let i = 0; i < extensionHeadersLength; i++) {
        ret.extensionHeaders.push(await deserializeExtensionHeader(readableStream));
    }
    return ret;
};
;
