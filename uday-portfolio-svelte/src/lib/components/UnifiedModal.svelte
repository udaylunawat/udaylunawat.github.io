<script>
  import { modal, closeModal } from '$lib/stores/modal';
  import { onMount } from 'svelte';

  let dialogEl;

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if $modal.open}
  <!-- Backdrop -->
  <div class="modal-overlay active" aria-hidden="true"></div>

  <!-- Dialog -->
  <div
    class="modal-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    bind:this={dialogEl}
  >
    <div class="modal-content">

      <!-- ================= HEADER ================= -->
      <header class="modal-header">
        <!-- Title zone -->
        <div class="modal-header-title">
          <h1 id="modal-title" class="modal-title">
            {$modal.title || ''}
          </h1>
        </div>

        <!-- Logos zone (optional, isolated) -->
        {#if $modal.logos?.length}
          <div
            class="modal-header-logos"
            aria-hidden="true"
          >
            {#each $modal.logos as logo}
              <img
                src={logo}
                alt=""
                loading="lazy"
              />
            {/each}
          </div>
        {/if}

        <!-- Close button (fixed position) -->
        <button
          type="button"
          class="modal-close"
          aria-label="Close modal"
          on:click={closeModal}
        >
          ×
        </button>
      </header>
      <!-- =============== END HEADER =============== -->

      <!-- Body -->
      <div class="modal-body">
        <div class="blog-content">
          {@html $modal.content}
        </div>
      </div>

    </div>
  </div>
{/if}