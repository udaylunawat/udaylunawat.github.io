<script>
  import ExperienceCard from './ExperienceCard.svelte';
  import content from '$lib/data/content.json';

  const experiences = content.experience;
</script>

<div class="gallery-grid">
  {#each experiences as experience (experience.id)}
    <ExperienceCard {experience} />
  {/each}
</div>