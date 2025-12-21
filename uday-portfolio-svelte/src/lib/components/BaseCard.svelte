<script>
  import { onMount } from 'svelte';

  export let title;
  export let description;
  export let logos = [];
  export let tags = [];
  export let dates = null;        // Experience only
  export let onOpen;              // click handler
  export let type = 'project';    // 'project' | 'experience'

  let tagsEl;
  let tagsOverflow = false;

  onMount(() => {
    if (tagsEl) {
      requestAnimationFrame(() => {
        tagsOverflow = tagsEl.scrollWidth > tagsEl.clientWidth;
      });
    }
  });
</script>

<button
  type="button"
  class="gallery-card base-card {type}"
  aria-label={`Open ${title}`}
  on:click={onOpen}
>
  <!-- Logos -->
  {#if logos?.length}
    <div class="card-logos">
      {#each logos as logo}
        <img src={logo} alt="" class="card-logo" />
      {/each}
    </div>
  {/if}

  <!-- Title -->
  <h3 class="card-title">{title}</h3>

  <!-- Dates (Experience only) -->
  {#if dates}
    <div class="card-dates">
      <span class="timeline-dot"></span>
      <span>{dates}</span>
    </div>
  {/if}

  <!-- Description -->
  <p class="card-description">
    {description}
  </p>

  <!-- Tags -->
  {#if tags?.length}
    <div
      class="card-tags {tagsOverflow ? 'marquee-active' : ''}"
      bind:this={tagsEl}
    >
      <div class="tags-track">
        {#each tags.slice(0, 2) as tag}
          <span class="tag tag-primary">{tag}</span>
        {/each}

        {#each tags.slice(2) as tag}
          <span class="tag tag-secondary">{tag}</span>
        {/each}
      </div>
    </div>
  {/if}
</button>