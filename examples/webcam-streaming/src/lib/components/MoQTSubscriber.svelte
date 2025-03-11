<script lang="ts">
  import { Subscriber } from "$lib/subscriber";

  let moqEl: HTMLCanvasElement;
  let moqIsPlaying = false;
  let subscriberInit = false;
  let subscriber: Subscriber;
  let setupSent = false;

  export let moqtServerUrl;
  export let canvasWidth = 480;
  export let canvasHeight = 360;
  let moqtSubTrackNamespace = ['moqtail', 'webcam-demo'];
  let moqtSubVideoTrackName = 'video';
  let moqtSubAudioTrackName = 'audio';
  let moqtSubAuth = 'secret';
  let moqtSubJitterBufferFrameSize = 10;

  // let videoQuality: 'low' | 'medium' | 'high' = 'low';

  const connectToServer = async () => {
    if (subscriberInit) return;
    subscriber = new Subscriber({
      serverUrl: moqtServerUrl,
      authInfo: moqtSubAuth,
      jitterBufferFrameSize: moqtSubJitterBufferFrameSize,
    });
    subscriberInit = true;
  }
  const setup = () => {
    if (!subscriber || setupSent) return;
    subscriber.setup();
    setupSent = true;
  }
  const playStream = () => {

  };
  const stopStream = () => {}
  const canvasGoFullscreen = () => {
    moqEl.requestFullscreen();
  };
</script>

<div class="sub">
  <h3>Subscriber</h3>
  <canvas width={canvasWidth} height={canvasHeight} bind:this={moqEl} />
  <button on:click={canvasGoFullscreen}>Go Fullscreen</button>
  <div class="track">
    <div>
      <label for="pub-track-jitter">Jitter Buffer Frame Size {moqtSubJitterBufferFrameSize}</label>
      <input
        type="range"
        min="0"
        max="60"
        step="10"
        name="pub-track-jitter"
        bind:value={moqtSubJitterBufferFrameSize}
      />
    </div>
  </div>
  <button on:click={connectToServer}>Connect to server</button>
  <button on:click={setup}>Setup</button>
  <button on:click={playStream}>Subscribe</button>
  <button on:click={stopStream}>Unsubscribe</button>
  <!-- <div>
    <fieldset>
      <legend>Video Quality</legend>
      <input type="radio" name="sub-video-quality" on:change={qualityOnChange} value="low" checked />
      <label for="sub-video-quality">Low</label>
      <input type="radio" name="sub-video-quality" on:change={qualityOnChange} value="medium" />
      <label for="sub-video-quality">Medium</label>
      <input type="radio" name="sub-video-quality" on:change={qualityOnChange} value="high" />
      <label for="sub-video-quality">High</label>
    </fieldset>
  </div> -->
</div>

<style>
  .sub {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
  }
  .track > div {
    margin: 5px;
  }
  canvas {
    background-color: #333;
  }
  fieldset {
    margin: 10px 0;
  }
</style>
