import { concatBuffer, numberToVarInt, varIntToNumber } from "../utils/bytes";
import { deserializeExtensionHeader, serializeExtensionHeader } from "./extensionHeader";
export const serializeSubgroupObject = (props) => {
    const objectIdBytes = numberToVarInt(props.objectId);
    const extensionHeadersLengthBytes = numberToVarInt(props.extensionHeaders.length);
    const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
    const payloadLengthBytes = numberToVarInt(props.payload.byteLength);
    let objectStatusBytes = new Uint8Array(0);
    if (props.payload.byteLength === 0) {
        if (props.objectStatus === undefined)
            throw new Error('objectStatus is required when payload is empty');
        objectStatusBytes = numberToVarInt(props.objectStatus);
    }
    return concatBuffer([objectIdBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, payloadLengthBytes, objectStatusBytes, props.payload]);
};
export const deserializeSubgroupObjectHeader = async (readableStream) => {
    const ret = {};
    ret.objectId = await varIntToNumber(readableStream);
    const extensionHeadersLength = await varIntToNumber(readableStream);
    ret.extensionHeaders = [];
    for (let i = 0; i < extensionHeadersLength; i++) {
        ret.extensionHeaders.push(await deserializeExtensionHeader(readableStream));
    }
    const payloadLength = await varIntToNumber(readableStream);
    if (payloadLength === 0) {
        ret.objectStatus = await varIntToNumber(readableStream);
    }
    return ret;
};
