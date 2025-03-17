import { DATAGRAM } from "../constants";
import { concatBuffer, getUint8, numberToVarInt, setUint8, varIntToNumber } from "../utils/bytes";
import { deserializeExtensionHeader, serializeExtensionHeader } from "./extensionHeader";
import type { ExtensionHeader } from "./extensionHeader";

export const deserializeDatagramType = async (readableStream: ReadableStream): Promise<number> => {
  return await varIntToNumber(readableStream);
}

export const serializeDatagram = (props: Datagram) => {
  const typeBytes = numberToVarInt(props.payload.byteLength ? DATAGRAM.OBJECT_DATAGRAM: DATAGRAM.OBJECT_DATAGRAM_STATUS);
  const trackAliasBytes = numberToVarInt(props.trackAlias);
  const groupIdBytes = numberToVarInt(props.groupId);
  const objectIdBytes = numberToVarInt(props.objectId);
  const publisherPriorityBytes = setUint8(props.publisherPriority);
  const extensionHeadersLengthBytes = numberToVarInt(props.extensionHeaders.length);
  const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
  const datagram = concatBuffer([typeBytes, trackAliasBytes, groupIdBytes, objectIdBytes, publisherPriorityBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, props.payload]);
  return datagram;
}

export const deserializeDatagramHeader = async (readableStream: ReadableStream): Promise<Datagram> => {
  const ret: Datagram = {} as Datagram;
  ret.trackAlias = await varIntToNumber(readableStream);
  ret.groupId = await varIntToNumber(readableStream);
  ret.objectId = await varIntToNumber(readableStream);
  ret.publisherPriority = await getUint8(readableStream);
  const extensionHeadersLength = await varIntToNumber(readableStream);
  ret.extensionHeaders = [];
  for (let i = 0; i < extensionHeadersLength; i++) {
    ret.extensionHeaders.push(await deserializeExtensionHeader(readableStream));
  }
  return ret;
}

export interface Datagram {
  trackAlias: number,
  groupId: number,
  objectId: number,
  publisherPriority: number,
  extensionHeaders: ExtensionHeader[],
  payload: Uint8Array
};
