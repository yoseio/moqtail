import { CONTROL_MESSAGE, PARAMETER } from "../constants";
import { concatBuffer, getNumberLength, numberToVarInt, stringToVarBytes, varBytesToString, varIntToNumber } from "./bytes"

export interface Parameter {
  type: number,
  value: string | number
}

export const serializeParams = (params: Parameter[]): Uint8Array => {
  const serialized = params.map(param => {
    const type = numberToVarInt(param.type);
    let len: Uint8Array = new Uint8Array(0);
    let value: Uint8Array;
    if (typeof param.value === 'string') {
      value = stringToVarBytes(param.value);
    } else {
      len = numberToVarInt(getNumberLength(param.value));
      value = numberToVarInt(param.value);
    }
    return concatBuffer([type, len, value]);
  });
  const numParams = numberToVarInt(params.length);
  return concatBuffer([numParams, ...serialized]);
}

export const deserializeParams = async (messageType: number, controlReader: ReadableStream): Promise<Parameter[]> => {
  const ret: Parameter[] = [];
  const numParams = await varIntToNumber(controlReader);
  for (let i = 0; i < numParams; i++) {
    const paramId = await varIntToNumber(controlReader);
    if (messageType === CONTROL_MESSAGE.CLIENT_SETUP || messageType === CONTROL_MESSAGE.SERVER_SETUP) {
      switch (paramId) {
        case PARAMETER.SETUP.PATH.KEY:
          ret.push({ type: PARAMETER.SETUP.PATH.KEY, value: await varBytesToString(controlReader) });
          break;
        case PARAMETER.SETUP.MAX_SUBSCRIBE_ID.KEY:
          await varIntToNumber(controlReader); // length
          ret.push({ type: PARAMETER.SETUP.MAX_SUBSCRIBE_ID.KEY, value: await varIntToNumber(controlReader) });
          break
        default:
          throw new Error(`unexpected setup parameter ${paramId}`); // TODO: ProtocolViolation
      }
    } else {
      switch (paramId) {
        case PARAMETER.AUTHORIZATION_INFO.KEY:
          ret.push({ type: PARAMETER.AUTHORIZATION_INFO.KEY, value: await varBytesToString(controlReader) });
          break;
        case PARAMETER.DELIVERY_TIMOUT.KEY:
          await varIntToNumber(controlReader); // length
          ret.push({ type: PARAMETER.DELIVERY_TIMOUT.KEY, value: await varIntToNumber(controlReader) });
          break;
        case PARAMETER.MAX_CACHE_DURATION.KEY:
          await varIntToNumber(controlReader); // length
          ret.push({ type: PARAMETER.MAX_CACHE_DURATION.KEY, value: await varIntToNumber(controlReader) });
          break;
        default:
          throw new Error(`unexpected parameter ${paramId}`); // TODO: ProtocolViolation
      }
    }
  }
  return ret;
}
