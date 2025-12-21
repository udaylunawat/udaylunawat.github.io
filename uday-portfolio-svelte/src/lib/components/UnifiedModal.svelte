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
  <div class="modal-overlay active" aria-hidden="false"></div>

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
      <div class="modal-content-wrapper">

        <!-- Header -->
        <header class="modal-header">
          <div class="modal-header-main">
            <h1 id="modal-title" class="modal-title">
              {$modal.title}
            </h1>

            {#if $modal.logos?.length}
              <div class="modal-logos">
                {#each $modal.logos as logo}
                  <img src={logo} alt="" />
                {/each}
              </div>
            {/if}
          </div>

          <button
            type="button"
            class="modal-close"
            aria-label="Close modal"
            on:click={closeModal}
          >
            ×
          </button>
        </header>

        <!-- Body -->
        <div class="modal-body">
          <div class="blog-content">
            {@html $modal.content}
          </div>
        </div>

      </div>
    </div>
  </div>
{/if}