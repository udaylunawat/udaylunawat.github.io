<script>
  export let title = '';
</script>

<section class="gallery-section">
  {#if title}
    <h2 class="gallery-title">{title}</h2>
  {/if}

  <div class="gallery-viewport">
    <div class="gallery-track">
      <slot />
    </div>
  </div>
</section>