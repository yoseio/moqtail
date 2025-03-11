import { numberToVarInt, stringToVarBytes, concatBuffer, varIntToNumber, varBytesToString } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';
import { serializeParams, deserializeParams, type Parameter } from '../utils/parameter';
import { deserializeNamespace } from '../utils/namespace';

export const serializeAnnounce = (props: { trackNamespace: string[], parameters?: Parameter[] }) => {
  const messageTypeBytes = numberToVarInt(CONTROL_MESSAGE.ANNOUNCE);
  const trackNamespaceLength = numberToVarInt(props.trackNamespace.length);
  const trackNamespaceBytes = props.trackNamespace.map(stringToVarBytes);
  const parametersBytes = serializeParams(props.parameters || []);
  const body = concatBuffer([trackNamespaceLength, ...trackNamespaceBytes, parametersBytes]);
  const length = numberToVarInt(body.byteLength);
  return concatBuffer([messageTypeBytes, length, body]);
}

export const deserializeAnnounce = async (controlReader: ReadableStream) => {
  await varIntToNumber(controlReader); // length
  const trackNamespace = await deserializeNamespace(controlReader);
  const parameters = await deserializeParams(CONTROL_MESSAGE.ANNOUNCE, controlReader);
  return { trackNamespace, parameters };
}
