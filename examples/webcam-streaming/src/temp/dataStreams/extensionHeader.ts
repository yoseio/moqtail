import { concatBuffer, numberToVarInt, stringToVarBytes, varBytesToString, varIntToNumber } from "../utils/bytes";

export interface ExtensionHeader {
  type: number;
  value: number | string;
}

export const serializeExtensionHeader = (props: ExtensionHeader) => {
  if (props.type === 0) throw new Error('Extension header type 0 is not allowed');
  const typeBytes = numberToVarInt(props.type);
  let valueBytes: Uint8Array;
  if (props.type % 2 === 0) {
    valueBytes = numberToVarInt(props.value as number);
  } else {
    valueBytes = stringToVarBytes(props.value as string);
  }
  return concatBuffer([typeBytes, valueBytes]);
}

export const deserializeExtensionHeader = async (reader: ReadableStream): Promise<ExtensionHeader> => {
  const type = await varIntToNumber(reader);
  let value: string | number;
  if (type % 2 === 0) {
    value = await varIntToNumber(reader);
  } else {
    value = await varBytesToString(reader);
  }
  return { type, value };
}
