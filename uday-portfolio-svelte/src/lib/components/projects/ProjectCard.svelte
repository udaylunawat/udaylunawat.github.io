<script>
  import BaseCard from '$lib/components/BaseCard.svelte';
  import { openModal } from '$lib/stores/modal';
  import { loadModalContent } from '$lib/utils/modalContent';

  export let project;

  async function openProject() {
    const { title, content } = await loadModalContent(
      'project',
      project.id
    );

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
  title={project.title}
  subtitle={null}
  description={project.description}
  logos={project.logos ?? []}
  tags={project.tags.map(t => ({ label: t, priority: 'secondary' }))}
  badges={[]}
  onOpen={openProject}
/>