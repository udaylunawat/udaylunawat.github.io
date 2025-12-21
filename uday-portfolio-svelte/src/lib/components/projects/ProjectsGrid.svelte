<script>
  import ProjectCard from './ProjectCard.svelte';
  import content from '$lib/data/content.json';

  const projects = content.projects;
</script>

<div class="gallery-grid">
  {#each projects as project (project.id)}
    <ProjectCard {project} />
  {/each}
</div>
