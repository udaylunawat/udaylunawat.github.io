<script>
  import BaseCard from '$lib/components/BaseCard.svelte';
  import { openModal } from '$lib/stores/modal';
  import { loadModalContent } from '$lib/utils/modalContent';

  export let experience;

  async function openExperience() {
    const { title, content } = await loadModalContent(
      'experience',
      experience.id
    );

    openModal(
      'experience',
      experience.id,
      title,
      content,
      experience.logos ? experience.logos : experience.logo ? [experience.logo] : []
    );
  }
</script>

<BaseCard
  title={experience.title}
  subtitle={experience.dates}
  description={experience.description}
  logos={experience.logos ?? (experience.logo ? [experience.logo] : [])}
  tags={experience.tags.map(t => ({ label: t, priority: 'primary' }))}
  badges={experience.badges}
  onOpen={openExperience}
/>