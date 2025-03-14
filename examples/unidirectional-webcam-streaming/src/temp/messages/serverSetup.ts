import { CONTROL_MESSAGE } from "../constants";
import { deserializeParams, type ParameterTemp, type Parameter, serializeParams } from "../utils/parameter";
import { concatBuffer, numberToVarInt, varIntToNumber } from "../utils/bytes";

export const serializeServerSetup = (props: { version: number, params: ParameterTemp[] }) => {
  const messageType = numberToVarInt(CONTROL_MESSAGE.SERVER_SETUP);
  const selectedVersion = numberToVarInt(props.version);
  const params = serializeParams(props.params);
  const length = numberToVarInt(concatBuffer([selectedVersion, params]).byteLength);
  return concatBuffer([messageType, length, selectedVersion, params]);
}

export const deserializeServerSetup = async (controlReader: ReadableStream) => {
  await varIntToNumber(controlReader); // length
  const selectedVersion = await varIntToNumber(controlReader);
  const parameters = await deserializeParams(CONTROL_MESSAGE.SERVER_SETUP, controlReader);
  return { selectedVersion, parameters };
}

export interface ServerSetup {
  selectedVersion: number;
  parameters: Parameter[];
}