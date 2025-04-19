import { serializeQuicVarInt, concatBuffer, deserializeQuicVarInt } from '../utils/bytes';
import { CONTROL_MESSAGE } from '../constants';

export const serializeFetchCancel = (subscribeId: number) => {
  const messageTypeBytes = serializeQuicVarInt(CONTROL_MESSAGE.FETCH_CANCEL);
  const subscribeIdBytes = serializeQuicVarInt(subscribeId);
  const length = serializeQuicVarInt(subscribeIdBytes.byteLength);
  return concatBuffer([messageTypeBytes, length, subscribeIdBytes]);
}

export const deserializeFetchCancel = async (controlReader: ReadableStream) => {
  await deserializeQuicVarInt(controlReader); // length
  const subscribeId = await deserializeQuicVarInt(controlReader);
  return { subscribeId };
}
