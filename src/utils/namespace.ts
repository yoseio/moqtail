import { varBytesToString, varIntToNumber } from "./bytes";

export const deserializeNamespace = async (stream: ReadableStream): Promise<string[]> => {
  const namespaceLength = await varIntToNumber(stream);
  const namespace: string[] = [];
  for (let i = 0; i < namespaceLength; i++) {
    namespace.push(await varBytesToString(stream));
  }
  return namespace;
}
