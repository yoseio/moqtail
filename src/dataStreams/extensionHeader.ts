import { buffRead, concatBuffer, numberToVarInt, stringToVarBytes, varIntToNumber } from "../utils/bytes";

export interface ExtensionHeader {
  id: number;
  value: number | string | Uint8Array;
}

export const serializeExtensionHeader = (props: ExtensionHeader) => {
  if (!props) return new Uint8Array(0);
  if (props.id === 0) throw new Error('Extension header type 0 is not allowed');
  const typeBytes = numberToVarInt(props.id);
  let valueBytes: Uint8Array;
  if (props.id % 2 === 0) {
    valueBytes = numberToVarInt(props.value as number);
  } else if (typeof props.value === 'object') {
    valueBytes = concatBuffer([numberToVarInt(props.value.byteLength), props.value]);
  } else {
    valueBytes = stringToVarBytes(props.value as string);
  }
  return concatBuffer([typeBytes, valueBytes]);
}

export const deserializeExtensionHeader = async (reader: ReadableStream): Promise<ExtensionHeader> => {
  const id = await varIntToNumber(reader);
  let value: string | number | Uint8Array;
  if (id % 2 === 0) {
    value = await varIntToNumber(reader);
  } else {
    const len = await varIntToNumber(reader);
    value = await buffRead(reader, len);
  }
  return { id, value };
}
