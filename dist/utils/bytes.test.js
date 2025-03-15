import { expect, test } from 'vitest';
import { setUint8, getUint8 } from './bytes';
test('setUint8', () => {
    const v = 0x12;
    const ret = setUint8(v);
    expect(ret[0]).toBe(v);
});
test('getUint8', async () => {
    const v = 0x12;
    const ret = await getUint8(new ReadableStream({
        start(controller) {
            controller.enqueue(new Uint8Array([v]));
            controller.close();
        },
        type: 'bytes'
    }));
    expect(ret).toBe(v);
});
test('getUint8 after setUint8', async () => {
    const v = 0x12;
    const ret = setUint8(v);
    const ret2 = await getUint8(new ReadableStream({
        start(controller) {
            controller.enqueue(ret);
            controller.close();
        },
        type: 'bytes'
    }));
    expect(ret2).toBe(v);
});
