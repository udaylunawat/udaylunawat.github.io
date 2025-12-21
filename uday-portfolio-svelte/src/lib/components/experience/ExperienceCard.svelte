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
      experience.logos ?? experience.logo ? [experience.logo] : []
    );
  }
</script>

<BaseCard
  type="experience"
  title={experience.title}
  description={experience.description}
  dates={experience.dates}
  tags={experience.tags}
  logos={experience.logos ?? (experience.logo ? [experience.logo] : [])}
  onOpen={openExperience}
/>