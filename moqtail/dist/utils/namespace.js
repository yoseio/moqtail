import { varBytesToString, deserializeQuicVarInt } from "./bytes";
export const deserializeNamespace = async (stream) => {
    const namespaceLength = await deserializeQuicVarInt(stream);
    const namespace = [];
    for (let i = 0; i < namespaceLength; i++) {
        namespace.push(await varBytesToString(stream));
    }
    return namespace;
};
