/**
 * Adds the missing `captureStream` method for HTMLVideoElement and HTMLAudioElement so TypeScript
 * does not complain when accessing it in Svelte components.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/captureStream)
 */
declare interface HTMLMediaElement {
  captureStream(frameRequestRate?: number): MediaStream;
}
