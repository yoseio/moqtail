<script lang="ts">
  import MoQTSubscriber from '$lib/components/MoQTSubscriber.svelte';
  import MoQtPublisher from '$lib/components/MoQTPublisher.svelte';
  import GenericInput from '$lib/components/GenericInput.svelte';

  let moqtServerUrl = 'https://203.178.143.71:4433/moq';
  // let moqtServerUrl = 'https://fb.mvfst.net:9448/moq-relay';
  // let moqtServerUrl = 'https://31.133.145.159:9000'
</script>

<svelte:head>
  <title>Video Call over MoQT</title>
</svelte:head>

<!-- svelte-ignore a11y-media-has-caption -->
<div class="container">
  <h1>Webcam Streaming Demo</h1>
  <div class="description">
    <p>possibly sends: CLIENT_SETUP, ANNOUNCE, UNANNOUNCE, SUBSCRIBE and UNSUBSCRIBE</p>
    <p>handles incoming: SERVER_SETUP, ANNOUNCE_OK, ANNOUNCE_ERROR, SUBSCRIBE_OK</p>
  </div>
  <div class="relay-server">
    <GenericInput key="Relay Server" bind:defaultVal={moqtServerUrl} />
  </div>
  <div class="container-videos">
    <div class="left">
      <MoQtPublisher {moqtServerUrl} />
    </div>
    <div class="right">
      <MoQTSubscriber {moqtServerUrl} canvasWidth={480} canvasHeight={360} />
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .description {
      margin-bottom: 10px;
      p {
        margin: 5px 0;
      }
    }
    .relay-server {
      margin: 5px;
      width: 100%;
    }
    &-videos {
      margin: 10px 0 0 0;
      display: flex;
      justify-content: space-between;
      & > div {
        margin: 0 10px;
        max-width: 480px;
      }
    }
  }
</style>
