import { serializeQuicVarInt, stringToVarBytes, concatBuffer, deserializeQuicVarInt } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';
import { deserializeNamespace } from '../utils/namespace';

export const serializeAnnounceOk = (props: { trackNamespace: string[] }) => {
  const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.ANNOUNCE_OK);
  const trackNamespaceLength = serializeQuicVarInt(props.trackNamespace.length);
  const trackNamespaceBytes = props.trackNamespace.map(stringToVarBytes);
  const body = concatBuffer([trackNamespaceLength, ...trackNamespaceBytes]);
  const length = serializeQuicVarInt(body.byteLength);
  return concatBuffer([messageTypeBytes, length, body]);
}

export const deserializeAnnounceOk = async (controlReader: ReadableStream) => {
  await deserializeQuicVarInt(controlReader); // length
  const trackNamespace = await deserializeNamespace(controlReader);
  return { trackNamespace };
}

export interface AnnounceOk {
  trackNamespace: string[];
}
