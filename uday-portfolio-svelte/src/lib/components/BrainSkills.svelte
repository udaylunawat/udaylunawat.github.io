<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { mountBrainDeepSkills } from '$lib/brain/brainDeepSkills';

  let host: HTMLDivElement;
  let brain: any;

  onMount(async () => {
    brain = await mountBrainDeepSkills({
      container: host,
      glbPath: '/brain/brain.glb',
      options: {
        autoReveal: true
      }
    });
  });

  onDestroy(() => {
    brain?.destroy?.();
  });
</script>

<div
  bind:this={host}
  id="brain-host"
  aria-label="Neural skill visualization"
></div>

<style>
  #brain-host {
    width: 100%;
    height: min(88svh, 88dvh, 760px);
    position: relative;
    overflow: hidden;
  }
</style>