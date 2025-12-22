<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  /* ========================
     Public API
     ======================== */

  export let title: string;
  export let subtitle: string | null = null;        // dates, timeline
  export let description: string | null = null;

  export let logos: string[] = [];
  export let tags: { label: string; priority?: 'primary' | 'secondary' }[] = [];
  export let badges: string[] = [];

  export let onOpen: () => void;

  /* ========================
     Internal state
     ======================== */

  let tagContainer: HTMLDivElement | null = null;
  let isTagOverflowing = false;
  let resizeObserver: ResizeObserver | null = null;

  function checkTagOverflow() {
    if (!tagContainer) return;
    isTagOverflowing =
      tagContainer.scrollWidth > tagContainer.clientWidth + 2;
  }

  onMount(() => {
    checkTagOverflow();

    resizeObserver = new ResizeObserver(checkTagOverflow);
    if (tagContainer) resizeObserver.observe(tagContainer);
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  }
</script>

<div
  class="gallery-card"
  role="button"
  tabindex="0"
  aria-label={`Open ${title}`}
  aria-describedby={"more-hint-" + title.replace(/\s+/g, '-').toLowerCase()}
  on:click={onOpen}
  on:keydown={handleKeydown}
>
  <!-- ========================
       Logos
       ======================== -->
  {#if logos.length}
    <div class="card-logos" aria-hidden="true">
      {#each logos as logo}
        <img
          src={logo}
          alt=""
          class="card-logo"
          loading="lazy"
        />
      {/each}
    </div>
  {/if}

  <div class="card-body">
    <!-- title -->
    <!-- subtitle -->
    <!-- description -->
  </div>

  <!-- ========================
       Title
       ======================== -->
  <!-- Header -->
  <div class="card-header">
    <h3 class="card-title">
      {title}
    </h3>

  <!-- <h3 class="card-title">{title}</h3> -->

  {#if subtitle}
    <div class="card-subtitle timeline-date">
      {subtitle}
    </div>
  {/if}

  {#if description}
    <p class="card-description">
      {description}
      <!-- <span class="more-affordance">More</span> -->
      <span class="card-more">More</span>
    </p>
  {/if}
  </div>

  <!-- ========================
       Badges / Metrics
       ======================== -->
  {#if badges.length}
    <div class="card-badges">
      {#each badges as badge}
        <span class="badge">{badge}</span>
      {/each}
    </div>
  {/if}

  <!-- ========================
       Tags (marquee only if overflowing)
       ======================== -->
  {#if tags.length}
    <div
      class="card-tags {isTagOverflowing ? 'marquee-active' : ''}"
      bind:this={tagContainer}
    >
      <div class="tags-track">
        {#each tags as tag}
          <span
            class="tag {tag.priority === 'primary' ? 'tag-primary' : 'tag-secondary'}"
          >
            {tag.label}
          </span>
        {/each}
      </div>
    </div>
  {/if}

</div>