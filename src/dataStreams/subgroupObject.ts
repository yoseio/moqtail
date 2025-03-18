import type { OBJECT_STATUS } from "../constants";
import { concatBuffer, serializeQuicVarInt, deserializeQuicVarInt } from "../utils/bytes";
import { deserializeExtensionHeader, serializeExtensionHeader, type ExtensionHeader } from "./extensionHeader";

export const serializeSubgroupObject = (props: SubgroupObject) => {
  const objectIdBytes = serializeQuicVarInt(props.objectId);
  const extensionHeadersLengthBytes = serializeQuicVarInt(props.extensionHeaders.length);
  const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
  const payloadLengthBytes = serializeQuicVarInt(props.payload.byteLength);
  let objectStatusBytes = new Uint8Array(0);
  if (props.payload.byteLength === 0) {
    if (props.objectStatus === undefined) throw new Error('objectStatus is required when payload is empty');
    objectStatusBytes = serializeQuicVarInt(props.objectStatus);
  }
  return concatBuffer([objectIdBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, payloadLengthBytes, objectStatusBytes, props.payload]);
};

export const deserializeSubgroupObjectHeader = async (readableStream: ReadableStream): Promise<SubgroupObject> => {
  const ret: SubgroupObject = {} as SubgroupObject;
  ret.objectId = await deserializeQuicVarInt(readableStream);
  const extensionHeadersLength = await deserializeQuicVarInt(readableStream);
  ret.extensionHeaders = [];
  for (let i = 0; i < extensionHeadersLength; i++) {
    ret.extensionHeaders.push(await deserializeExtensionHeader(readableStream));
  }
  const payloadLength = await deserializeQuicVarInt(readableStream);
  if (payloadLength === 0) {
    ret.objectStatus = await deserializeQuicVarInt(readableStream) as OBJECT_STATUS;
  }
  return ret;
};

export interface SubgroupObject {
  objectId: number,
  extensionHeaders: ExtensionHeader[],
  objectStatus?: OBJECT_STATUS
  payload: Uint8Array
}
