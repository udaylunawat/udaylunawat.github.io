<script>
  import BaseGallery from '$lib/components/BaseGallery.svelte';
  import ProjectCard from './ProjectCard.svelte';
  import content from '$lib/data/content.json';

  const projects = content.projects;
</script>

<BaseGallery
  title="Projects"
  ariaLabel="Projects gallery"
>
  {#each projects as project (project.id)}
    <ProjectCard {project} />
  {/each}
</BaseGallery>