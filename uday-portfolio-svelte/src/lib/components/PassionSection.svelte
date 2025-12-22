<script>
  export let about;

  const paragraphs =
    about?.content
      ?.split('<br><br>')
      .map(p => p.trim())
      .filter(Boolean) ?? [];
</script>

{#if about}
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
{/if}
