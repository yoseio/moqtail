<script>
  import { moqVideoTransmissionLatencyStore } from '$lib/store';
  import { Mogger } from '$lib/utils/mogger';

  let cpuLoad = 'Compute Pressure API not supported';

  const pressureObserverCallback = (records) => {
    const lastRecord = records[records.length - 1];
    cpuLoad = lastRecord.state;
  };

  try {
    const observer = new PressureObserver(pressureObserverCallback); // ts might be salty but let it be
    observer.observe('cpu', { sampleInterval: 1000, });
  } catch (error) {
    Mogger.error('PressureObserver not supported:', error);
  }
</script>

<div class="statistics">
  <h3>Statistics</h3>
  <div class="stat-item">
    <span class="stat-label">Transmission Latency:</span> {$moqVideoTransmissionLatencyStore}ms
  </div>
  <div class="stat-item">
    <span class="stat-label">CPU Load:</span> {cpuLoad}
  </div>
</div>

<style>
  .statistics {
    padding: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .stat-item {
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-weight: bold;
    min-width: 250px;
  }
</style>
