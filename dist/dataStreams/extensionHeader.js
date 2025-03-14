import { concatBuffer, numberToVarInt, stringToVarBytes, varBytesToString, varIntToNumber } from "../utils/bytes";
export const serializeExtensionHeader = (props) => {
    if (props.type === 0)
        throw new Error('Extension header type 0 is not allowed');
    const typeBytes = numberToVarInt(props.type);
    let valueBytes;
    if (props.type % 2 === 0) {
        valueBytes = numberToVarInt(props.value);
    }
    else {
        valueBytes = stringToVarBytes(props.value);
    }
    return concatBuffer([typeBytes, valueBytes]);
};
export const deserializeExtensionHeader = async (reader) => {
    const type = await varIntToNumber(reader);
    let value;
    if (type % 2 === 0) {
        value = await varIntToNumber(reader);
    }
    else {
        value = await varBytesToString(reader);
    }
    return { type, value };
};
