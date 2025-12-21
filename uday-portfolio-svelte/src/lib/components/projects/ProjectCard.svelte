<script>
  import BaseCard from '$lib/components/BaseCard.svelte';
  import { openModal } from '$lib/stores/modal';
  import { loadModalContent } from '$lib/utils/modalContent';

  export let project;

  async function openProject() {
    const { title, content } = await loadModalContent('project', project.id);

    openModal(
      'project',
      project.id,
      title,
      content,
      project.logos ?? []
    );
  }
</script>

<BaseCard
  type="project"
  title={project.title}
  description={project.description}
  tags={project.tags}
  logos={project.logos}
  onOpen={openProject}
/>