<script lang="ts">
  import { AUDIO_ENCODER_DEFAULT_CONFIG, VIDEO_ENCODER_DEFAULT_CONFIG } from '$lib/config';
  import { Publisher } from '$lib/publisher';
  import { GROUP_ORDER } from '../../temp';
  import { onMount } from 'svelte';

  let liveEl: HTMLVideoElement;
  let publisherInit = false;
  let setupSent = false;
  let publisher: Publisher;
  let stream: MediaStream;

  export let moqtServerUrl: string;
  let namespace = ['moqtail'];
  let keyFrameDuration = 30;
  let authInfo = 'secret';

  const videoTrack: Track = {
    namespace,
    name: 'video',
    type: 'video',
    objectForwardingPrefereces: 'Subgroup',
    encoderConfig: { encoderConfig: VIDEO_ENCODER_DEFAULT_CONFIG, keyFrameDuration },
    groupOrderPublisherPreference: GROUP_ORDER.ASCENDING,
    subscribers: [],
    groups: [],
  };
  const audioTrack: Track = {
    namespace,
    name: 'audio',
    type: 'audio',
    objectForwardingPrefereces: 'Datagram',
    encoderConfig: { encoderConfig: AUDIO_ENCODER_DEFAULT_CONFIG, keyFrameDuration },
    groupOrderPublisherPreference: GROUP_ORDER.ASCENDING,
    subscribers: [],
    groups: [],
  };


  const camera = {
    inputDevices: null as MediaDeviceInfo[],
    selectedDevice: null as string
  };

  const changeDevice = async (e) => {
    // const newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: e.target.value } } });
    // stream.removeTrack(stream.getVideoTracks()[0]);
    // stream.addTrack(newStream.getVideoTracks()[0]);
    // setLiveVideo(newStream, liveEl);
    // if (!publisher) return;
    // publisher.replaceTrack(stream);
  };

  const setLiveVideo = async (stream: MediaStream, videoEl: HTMLVideoElement): Promise<MediaStream> => {
    if (!stream) throw new Error('Failed retrieving media devices');
    videoEl.srcObject = stream;
    return stream;
  };
  const connectToServer = async () => {
    if (publisherInit) return;
    publisher = new Publisher({
      serverUrl: moqtServerUrl,
      tracks: [videoTrack, audioTrack],
      authInfo,
    });
    publisherInit = true;
  };
  const setup = () => {
    if (!publisherInit || setupSent) return;
    publisher.setup();
    setupSent = true;
  }
  const startStreaming = () => {
    if (!publisherInit) return;
    publisher.announce(namespace);
    const vt = stream.getVideoTracks()[0];
    publisher.startStream({ track: videoTrack, mediaTrack: vt });
    const at = stream.getAudioTracks()[0];
    publisher.startStream({ track: audioTrack, mediaTrack: at });
  }
  const stopStreaming = () => {
    if (!publisherInit) return;
    publisher.unannounce(namespace);
    publisherInit = false;
  }

  onMount(async () => {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => {
      throw new Error('Error accessing media devices:');
    });
    camera.inputDevices = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === 'videoinput'
    );
    setLiveVideo(stream, liveEl);
  });
</script>

<div class="pub">
  <h3>Publisher (Webcam capture)</h3>
  <div class="pub-video">
    <video autoplay muted playsinline bind:this={liveEl} />
    {#if camera.inputDevices}
      <select on:change={changeDevice}>
        {#each camera.inputDevices as device}
          <option value={device.deviceId}>{device.label}</option>
        {/each}
      </select>
    {/if}
  </div>
  <div class="track">
    <div>
      <label for="pub-track-keyframe-duration">Key Frame Duration {keyFrameDuration}</label>
      <input type="range" min="1" max="120" name="pub-track-keyframe-duration" bind:value={keyFrameDuration} />
    </div>
  </div>
  <button on:click={async () => await connectToServer()}>Connect to server</button>
  <button on:click={async () => setup()}>Setup</button>
  <button on:click={async () => startStreaming()}>Start streaming</button>
  <button on:click={async () => stopStreaming()}>Stop streaming</button>
</div>

<style lang="scss">
  .pub {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    &-video {
      position: relative;
      video {
        object-fit: contain;
      }
      & > select {
        position: absolute;
        bottom: 10px;
        left: 10px;
        border: none;
        padding: 5px 10px;
      }
    }
    .track > div {
      margin: 5px;
    }
  }
</style>
