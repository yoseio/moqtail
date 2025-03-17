import { buffRead, concatBuffer, numberToVarInt, stringToVarBytes, varIntToNumber } from "../utils/bytes";
export const serializeExtensionHeader = (props) => {
    if (!props)
        return new Uint8Array(0);
    if (props.id === 0)
        throw new Error('Extension header type 0 is not allowed');
    const typeBytes = numberToVarInt(props.id);
    let valueBytes;
    if (props.id % 2 === 0) {
        valueBytes = numberToVarInt(props.value);
    }
    else if (typeof props.value === 'object') {
        valueBytes = concatBuffer([numberToVarInt(props.value.byteLength), props.value]);
    }
    else {
        valueBytes = stringToVarBytes(props.value);
    }
    return concatBuffer([typeBytes, valueBytes]);
};
export const deserializeExtensionHeader = async (reader) => {
    const id = await varIntToNumber(reader);
    let value;
    if (id % 2 === 0) {
        value = await varIntToNumber(reader);
    }
    else {
        const len = await varIntToNumber(reader);
        value = await buffRead(reader, len);
    }
    return { id, value };
};
