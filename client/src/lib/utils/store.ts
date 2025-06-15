import { writable } from 'svelte/store';

export const moqVideoTransmissionLatencyStore = writable<number>(0);

export const ringStats = writable<RingBufferStats>({
  capacity: 48000,
  writePos: 0,
  readPos: 0,
  size: 0,
  available: 0,
  free: 48000,
});

export const bitrateStore = writable<number>(0);
