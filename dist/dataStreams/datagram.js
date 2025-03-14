import { concatBuffer, numberToVarInt } from "../utils/bytes";
import { serializeExtensionHeader } from "./extensionHeader";
export const serializeDatagram = (props) => {
    const trackAliasBytes = numberToVarInt(props.trackAlias);
    const groupIdBytes = numberToVarInt(props.groupId);
    const objectIdBytes = numberToVarInt(props.objectId);
    const publisherPriorityBytes = numberToVarInt(props.publisherPriority);
    const extensionHeadersLengthBytes = numberToVarInt(props.extensionHeaders.length);
    const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
    const datagram = concatBuffer([trackAliasBytes, groupIdBytes, objectIdBytes, publisherPriorityBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, props.payload]);
    return datagram;
};
