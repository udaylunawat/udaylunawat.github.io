<script lang="ts">
  import { onMount } from 'svelte';

  export let showDots = false;
  export let ariaLabel = 'Horizontal gallery';

  let container: HTMLDivElement;
  let cardWidth = 320;
  let gap = 24;

  let dots = 0;
  let active = 0;
  let canScrollLeft = false;
  let canScrollRight = false;

  function updateMetrics() {
    if (!container) return;

    const children = container.querySelectorAll(
      ':scope > .gallery-track > *'
    );

    if (children.length) {
      const rect = children[0].getBoundingClientRect();
      cardWidth = rect.width;
    }

    dots = Math.max(1, children.length);
    active = Math.round(container.scrollLeft / (cardWidth + gap));

    canScrollLeft = container.scrollLeft > 0;
    canScrollRight =
      container.scrollLeft + container.clientWidth <
      container.scrollWidth - 2;
  }

  function scrollByCards(n: number) {
    container.scrollBy({
      left: n * (cardWidth + gap),
      behavior: 'smooth'
    });
  }

  function goTo(i: number) {
    container.scrollTo({
      left: i * (cardWidth + gap),
      behavior: 'smooth'
    });
  }

  function onKeydown(e: KeyboardEvent) {
    if (!container) return;

    const step = container.clientWidth * 0.9;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        container.scrollBy({ left: step, behavior: 'smooth' });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        container.scrollBy({ left: -step, behavior: 'smooth' });
        break;
      case 'PageDown':
        e.preventDefault();
        scrollByCards(3);
        break;
      case 'PageUp':
        e.preventDefault();
        scrollByCards(-3);
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(dots - 1);
        break;
    }
  }

  onMount(() => {
    updateMetrics();
    container.addEventListener('scroll', updateMetrics);
    window.addEventListener('resize', updateMetrics);

    return () => {
      container.removeEventListener('scroll', updateMetrics);
      window.removeEventListener('resize', updateMetrics);
    };
  });
</script>

<div
  class="gallery-wrapper
    {canScrollLeft ? 'can-left' : ''}
    {canScrollRight ? 'can-right' : ''}"
>
  <!-- Keyboard focus proxy -->
  <div
    class="gallery-focus-proxy"
    tabindex="0"
    role="group"
    aria-label={ariaLabel}
    on:keydown={onKeydown}
  >
    <div
      class="gallery-container"
      bind:this={container}
      aria-hidden="true"
    >
      <div class="gallery-track">
        <slot />
      </div>
    </div>
  </div>

  {#if showDots && dots > 1}
    <div class="gallery-dots" aria-hidden="true">
      {#each Array(dots) as _, i}
        <button
          type="button"
          class="gallery-dot {i === active ? 'active' : ''}"
          aria-label={`Go to item ${i + 1}`}
          on:click={() => goTo(i)}
        ></button>
      {/each}
    </div>
  {/if}

</div>

<style>
  .gallery-focus-proxy:focus-visible {
    outline: none;
    box-shadow:
      inset 0 0 0 1px rgba(0, 255, 0, 0.45),
      0 0 0 2px rgba(0, 255, 0, 0.15);
  }
</style>