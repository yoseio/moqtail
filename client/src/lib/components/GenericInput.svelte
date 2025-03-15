<script lang="ts">
  export let key: string
  export let defaultVal: string;
</script>

<div>
  <label for="val">{key}</label>
  <input type="text" name="val" bind:value={defaultVal} />
</div>

<style>
  div {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  div > input {
    margin-left: 5px;
    width: 50%;
    max-width: 300px;
  }
</style>
