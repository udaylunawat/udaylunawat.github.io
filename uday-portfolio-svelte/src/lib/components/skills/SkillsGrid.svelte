<script>
  export let skills = [];
</script>

<div class="skills-grid">
  {#each skills as skill}
    <div class="skill-card">
      {#if skill.img}
        <img
          src={skill.img}
          alt={skill.name}
          class="skill-icon-img"
          loading="lazy"
        />
      {:else if skill.icon}
        <i class={skill.icon + ' skill-icon'}></i>
      {/if}

      <span class="skill-name">{skill.name}</span>
    </div>
  {/each}
</div>