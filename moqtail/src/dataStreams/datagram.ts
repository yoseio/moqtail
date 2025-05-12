import { DATAGRAM } from "../constants";
import { concatBuffer, getUint8, serializeQuicVarInt, setUint8, deserializeQuicVarInt, getQuicVarIntLength } from "../utils/bytes";
import { deserializeExtensionHeader, serializeExtensionHeader } from "./extensionHeader";
import type { ExtensionHeader } from "./extensionHeader";

export const deserializeDatagramType = async (readableStream: ReadableStream): Promise<number> => {
  return await deserializeQuicVarInt(readableStream);
}

export const serializeDatagram = (props: Datagram) => {
  const typeBytes = serializeQuicVarInt(props.payload.byteLength ? DATAGRAM.OBJECT_DATAGRAM: DATAGRAM.OBJECT_DATAGRAM_STATUS);
  const trackAliasBytes = serializeQuicVarInt(props.trackAlias);
  const groupIdBytes = serializeQuicVarInt(props.groupId);
  const objectIdBytes = serializeQuicVarInt(props.objectId);
  const publisherPriorityBytes = setUint8(props.publisherPriority);
  const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
  const extensionHeadersLengthBytes = serializeQuicVarInt(extensionHeaderBytes.length);
  const datagram = concatBuffer([typeBytes, trackAliasBytes, groupIdBytes, objectIdBytes, publisherPriorityBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, props.payload]);
  return datagram;
}

export const deserializeDatagramHeader = async (readableStream: ReadableStream): Promise<Datagram> => {
  const ret: Datagram = {} as Datagram;
  ret.trackAlias = await deserializeQuicVarInt(readableStream);
  ret.groupId = await deserializeQuicVarInt(readableStream);
  ret.objectId = await deserializeQuicVarInt(readableStream);
  ret.publisherPriority = await getUint8(readableStream);
  let extensionHeadersLength = await deserializeQuicVarInt(readableStream);
  ret.extensionHeaders = [];
  while (extensionHeadersLength > 0) {
    const v = await deserializeExtensionHeader(readableStream);
    ret.extensionHeaders.push(v.value);
    extensionHeadersLength -= v.byteLength;
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
