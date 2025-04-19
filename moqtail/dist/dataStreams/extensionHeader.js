import { buffRead, concatBuffer, serializeQuicVarInt, stringToVarBytes, deserializeQuicVarInt } from "../utils/bytes";
export const serializeExtensionHeader = (props) => {
    if (!props)
        return new Uint8Array(0);
    if (props.id === 0)
        throw new Error('Extension header type 0 is not allowed');
    const typeBytes = serializeQuicVarInt(props.id);
    let valueBytes;
    if (props.id % 2 === 0) {
        valueBytes = serializeQuicVarInt(props.value);
    }
    else if (typeof props.value === 'object') {
        valueBytes = concatBuffer([serializeQuicVarInt(props.value.byteLength), props.value]);
    }
    else {
        valueBytes = stringToVarBytes(props.value);
    }
    return concatBuffer([typeBytes, valueBytes]);
};
export const deserializeExtensionHeader = async (reader) => {
    const id = await deserializeQuicVarInt(reader);
    let value;
    if (id % 2 === 0) {
        value = await deserializeQuicVarInt(reader);
    }
    else {
        const len = await deserializeQuicVarInt(reader);
        value = await buffRead(reader, len);
    }
    return { id, value };
};
