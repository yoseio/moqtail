<script lang="ts">
  import { onMount } from 'svelte';
  import { ringStats } from '$lib/utils/store';
  import { get } from 'svelte/store';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const radius = 80;

  let capacity: number;
  let writePos: number;
  let readPos: number;

  const unsubscribe = ringStats.subscribe((stats) => {
    ({ capacity, writePos, readPos } = stats);
    if (ctx && capacity != null) {
      drawRingBuffer(stats);
    }
  });

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    drawRingBuffer(get(ringStats));
    return () => {
      unsubscribe();
    };
  });

  const drawRingBuffer = ({ capacity, writePos, readPos }) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const toAngle = (pos) => (pos / capacity) * 2 * Math.PI;
    const writeAngle = toAngle(writePos) - Math.PI / 2;
    const readAngle = toAngle(readPos) - Math.PI / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, readAngle, writeAngle, false);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, readAngle, readAngle + 0.01);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, writeAngle, writeAngle + 0.01);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 10;
    ctx.stroke();
  }
</script>

<canvas bind:this={canvas} width="200" height="200"></canvas>
