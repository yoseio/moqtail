<script>
  import { Mogger } from "$lib/utils/mogger";

  let encodingLatency = "0 ms";
  let decodingLatency = "0 ms";
  let transmissionLatency = "0 ms";
  let cpuLoad = "Compute Pressure API not supported";

  const pressureObserverCallback = (records) => {
    const lastRecord = records[records.length - 1];
    cpuLoad = lastRecord.state;
  }

  try {
    const observer = new PressureObserver(pressureObserverCallback); // ts might be salty but let it be
    observer.observe("cpu", {
      sampleInterval: 1000,
    });
  } catch (error) {
    Mogger.error("PressureObserver not supported:", error);
  }
</script>

<style>
  .statistics {
    padding: 1rem;
    max-width: 300px;
    margin: 0 auto;
  }

  .stat-item {
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-weight: bold;
  }
</style>

<div class="statistics">
  <div class="stat-item">
    <span class="stat-label">Encoding Latency:</span> {encodingLatency}
  </div>
  <div class="stat-item">
    <span class="stat-label">Decoding Latency:</span> {decodingLatency}
  </div>
  <div class="stat-item">
    <span class="stat-label">Transmission Latency:</span> {transmissionLatency}
  </div>
  <div class="stat-item">
    <span class="stat-label">CPU Load:</span> {cpuLoad}
  </div>
</div>
