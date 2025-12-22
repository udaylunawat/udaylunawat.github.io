<script>
	// import '../app.css';
	import '$lib/styles/loader.css';
	import '$lib/styles/foundation.css';
	import '$lib/styles/base.css';
	import '$lib/styles/utilities.css';
	import '$lib/styles/layout.css';
	import '$lib/styles/sections.css';

	import '$lib/styles/navigation.css';
	import '$lib/styles/home.css';
	import '$lib/styles/about.css';
	import '$lib/styles/credentials.css';
	import '$lib/styles/experience.css';
	import '$lib/styles/skills.css';
	import '$lib/styles/contact.css';

	import '$lib/styles/cards.css';
	import '$lib/styles/base-gallery.css';
	import '$lib/styles/modal.css';

	import '$lib/styles/background.css';
	import UnifiedModal from '$lib/components/UnifiedModal.svelte';
</script>

<slot />
<UnifiedModal />