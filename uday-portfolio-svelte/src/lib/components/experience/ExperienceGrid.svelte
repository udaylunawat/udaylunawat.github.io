<script>
  import BaseGallery from '$lib/components/BaseGallery.svelte';
  import ExperienceCard from './ExperienceCard.svelte';
  import content from '$lib/data/content.json';

  const experiences = content.experience;
</script>

<BaseGallery
  title="Experience"
  ariaLabel="Experience timeline gallery"
>
  {#each experiences as experience (experience.id)}
    <ExperienceCard {experience} />
  {/each}
</BaseGallery>