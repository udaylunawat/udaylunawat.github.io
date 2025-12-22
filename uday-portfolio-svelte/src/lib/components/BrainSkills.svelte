<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { mountBrainDeepSkills } from '$lib/brain/mountBrainDeepSkills';

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
    position: relative;
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  #brain-host.hidden {
    opacity: 0;
    transform: translateY(12px);
    pointer-events: none;
  }
</style>