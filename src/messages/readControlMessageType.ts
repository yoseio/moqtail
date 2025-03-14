import { varIntToNumber } from "../utils/bytes";

export const readControlMessageType = async (reader: ReadableStream) => {
  return await varIntToNumber(reader);
}
