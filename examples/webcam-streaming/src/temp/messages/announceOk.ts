import { numberToVarInt, stringToVarBytes, concatBuffer, varIntToNumber, varBytesToString } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';
import { deserializeNamespace } from '../utils/namespace';

export const serializeAnnounceOk = (props: { trackNamespace: string[] }) => {
  const messageTypeBytes = numberToVarInt(CONTROL_MESSAGE.ANNOUNCE_OK);
  const trackNamespaceLength = numberToVarInt(props.trackNamespace.length);
  const trackNamespaceBytes = props.trackNamespace.map(stringToVarBytes);
  const body = concatBuffer([trackNamespaceLength, ...trackNamespaceBytes]);
  const length = numberToVarInt(body.byteLength);
  return concatBuffer([messageTypeBytes, length, body]);
}

export const deserializeAnnounceOk = async (controlReader: ReadableStream) => {
  await varIntToNumber(controlReader); // length
  const trackNamespace = await deserializeNamespace(controlReader);
  return { trackNamespace };
}

export interface AnnounceOk {
  trackNamespace: string[];
}
