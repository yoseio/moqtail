import { concatBuffer, numberToVarInt } from "../utils/bytes";
export const serializeDatagram = (props) => {
    const trackAliasBytes = numberToVarInt(props.trackAlias);
    const groupIdBytes = numberToVarInt(props.groupId);
    const objectIdBytes = numberToVarInt(props.objectId);
    const publisherPriorityBytes = numberToVarInt(props.publisherPriority);
    const extensionHeadersLengthBytes = numberToVarInt(props.extensionHeaders.length);
    // const extensionHeadersBytes = props.extensionHeaders.map((header) => {
    //   const headerLengthBytes = numberToVarInt(header.byteLength);
    //   return concatBuffer([headerLengthBytes, header]);
    // });
    const datagram = concatBuffer([trackAliasBytes, groupIdBytes, objectIdBytes, publisherPriorityBytes, props.payload]);
    return datagram;
};
