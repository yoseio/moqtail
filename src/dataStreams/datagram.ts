import { concatBuffer, numberToVarInt, varIntToNumber } from "../utils/bytes";
import { deserializeExtensionHeader, serializeExtensionHeader } from "./extensionHeader";
import type { ExtensionHeader } from "./extensionHeader";

export const serializeDatagram = (props: Datagram) => {
  const trackAliasBytes = numberToVarInt(props.trackAlias);
  const groupIdBytes = numberToVarInt(props.groupId);
  const objectIdBytes = numberToVarInt(props.objectId);
  const publisherPriorityBytes = numberToVarInt(props.publisherPriority);
  const extensionHeadersLengthBytes = numberToVarInt(props.extensionHeaders.length);
  const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
  const datagram = concatBuffer([trackAliasBytes, groupIdBytes, objectIdBytes, publisherPriorityBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, props.payload]);
  return datagram;
}

export const deserializeDatagram = async (readableStream: ReadableStream): Promise<Datagram> => {
  const ret: Datagram = {} as Datagram;
  ret.trackAlias = await varIntToNumber(readableStream);
  ret.groupId = await varIntToNumber(readableStream);
  ret.objectId = await varIntToNumber(readableStream);
  ret.publisherPriority = await varIntToNumber(readableStream);
  const extensionHeadersLength = await varIntToNumber(readableStream);
  ret.extensionHeaders = [];
  for (let i = 0; i < extensionHeadersLength; i++) {
    ret.extensionHeaders.push(await deserializeExtensionHeader(readableStream));
  }
  ret.payload = new Uint8Array(await new Response(readableStream).arrayBuffer());
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
