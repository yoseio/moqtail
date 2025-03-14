import type { OBJECT_STATUS } from "../constants";
import { concatBuffer, numberToVarInt, varIntToNumber } from "../utils/bytes";
import { deserializeExtensionHeader, serializeExtensionHeader, type ExtensionHeader } from "./extensionHeader";

export const serializeSubgroupObject = (props: SubgroupObject) => {
  const objectIdBytes = numberToVarInt(props.objectId);
  const extensionHeadersLengthBytes = numberToVarInt(props.extensionHeaders.length);
  const extensionHeaderBytes = props.extensionHeaders.map(serializeExtensionHeader);
  const payloadLengthBytes = numberToVarInt(props.payload.byteLength);
  let objectStatusBytes = new Uint8Array(0);
  if (props.payload.byteLength === 0) {
    if (props.objectStatus === undefined) throw new Error('objectStatus is required when payload is empty');
    objectStatusBytes = numberToVarInt(props.objectStatus);
  }
  return concatBuffer([objectIdBytes, extensionHeadersLengthBytes, ...extensionHeaderBytes, payloadLengthBytes, objectStatusBytes, props.payload]);
};

export const deserializeSubgroupObjectHeader = async (readableStream: ReadableStream): Promise<SubgroupObject> => {
  const ret: SubgroupObject = {} as SubgroupObject;
  ret.objectId = await varIntToNumber(readableStream);
  const extensionHeadersLength = await varIntToNumber(readableStream);
  ret.extensionHeaders = [];
  for (let i = 0; i < extensionHeadersLength; i++) {
    ret.extensionHeaders.push(await deserializeExtensionHeader(readableStream));
  }
  const payloadLength = await varIntToNumber(readableStream);
  if (payloadLength === 0) {
    ret.objectStatus = await varIntToNumber(readableStream) as OBJECT_STATUS;
  }
  return ret;
};

export interface SubgroupObject {
  objectId: number,
  extensionHeaders: ExtensionHeader[],
  objectStatus?: OBJECT_STATUS
  payload: Uint8Array
}
