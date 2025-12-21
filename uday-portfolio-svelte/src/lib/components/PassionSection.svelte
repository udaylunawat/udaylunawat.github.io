<script>
  export let about;

  /**
   * Split content safely into paragraphs.
   * We control the source (content.json), so this is safe.
   */
  const paragraphs = about.content
    .split('<br><br>')
    .map(p => p.trim())
    .filter(Boolean);
</script>

<section class="about" id="about">
  <div class="wrapper">
    <div class="text-box passion-box">
      <h2 class="passion-title">
        <img src={about.icon} alt="" />
        {about.title}
      </h2>

      <div class="passion-content">
        {#each paragraphs as paragraph}
          <p>{@html paragraph}</p>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  /* Scoped, intentional styling */

  .passion-box {
    max-width: 760px;
  }

  .passion-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .passion-title img {
    width: 22px;
    height: 22px;
    opacity: 0.9;
  }

  .passion-content p {
    margin: 1.1rem 0;
    line-height: 1.75;
    opacity: 0.92;
  }

  /* Optional subtle emphasis for first paragraph */
  .passion-content p:first-child {
    font-weight: 500;
    opacity: 1;
  }
</style>