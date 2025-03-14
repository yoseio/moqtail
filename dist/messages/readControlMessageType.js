import { varIntToNumber } from "../utils/bytes";
export const readControlMessageType = async (reader) => {
    return await varIntToNumber(reader);
};
