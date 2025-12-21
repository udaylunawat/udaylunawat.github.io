<script>
  import { onMount } from 'svelte';
  import Navigation from '$lib/components/Navigation.svelte';
//   import UnifiedModal from '$lib/components/UnifiedModal.svelte';
  import SkillsGrid from '$lib/components/skills/SkillsGrid.svelte';
  import content from '$lib/data/content.json';
  import ProjectsGrid from '$lib/components/projects/ProjectsGrid.svelte';
  import PassionSection from '$lib/components/PassionSection.svelte';
  import ExperienceGrid from '$lib/components/experience/ExperienceGrid.svelte';
  import { openModal } from '$lib/stores/modal';
  onMount(() => {
    const MIN_LOADER_TIME = 3000;
    const MAX_LOADER_TIME = 4000;
    const startTime = performance.now();

    function reveal() {
      document.body.classList.add('show-ui');
    }

    window.addEventListener(
      'load',
      () => {
        const elapsed = performance.now() - startTime;
        const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
        setTimeout(reveal, remaining);
      },
      { once: true }
    );

    setTimeout(reveal, MAX_LOADER_TIME);
  });
</script>

<svelte:head>
  <title>Uday Lunawat - Portfolio</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Oswald:wght@200;300;400;500;600;700&family=Roboto+Mono:wght@100;200;300;400&display=swap"
  />

  <!-- Icons -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css"
  />

  <!-- TEMP: legacy scripts (will be removed later) -->
  <!-- <script src="/src/modals.js" type="module"></script> -->
</svelte:head>

<!-- ========== LOADER ========== -->
<div class="ai-loader" id="ai-loader">
  <div class="ai-loader-inner">
    <div class="ai-grid">
      <div class="ai-grid-nodes">
        {#each Array(16) as _}
          <div class="ai-node-dot"></div>
        {/each}
      </div>
      <div class="ai-grid-scan"></div>
    </div>

    <div class="ai-loader-text">
      <div>
        <div class="ai-chipline">
          <div class="ai-chip">
            <span class="ai-chip-dot"></span>
            <span>neural portfolio - Uday Lunawat</span>
          </div>
          <span></span>
        </div>
        <div class="ai-role">Senior ML Engineer · LLMs · Agents · RAG</div>
      </div>

      <div class="ai-status-line">
        <span class="ai-status-tag">BOOT</span>
        <span>linking workspace graph</span>
      </div>

      <div class="ai-progress-row">
        <div class="ai-progress-bar">
          <div class="ai-progress-fill"></div>
        </div>
        <div class="ai-progress-percent">98.4%</div>
      </div>

      <div class="ai-hints">
        <code>hydrating /skills vector space</code>
      </div>
    </div>
  </div>
</div>

<!-- ========== CANVAS / BACKGROUND PLACEHOLDERS ========== -->
<div class="canvas-container" id="canvas"></div>
<div id="particles-js"></div>
<div class="color-background" id="colorBackground"></div>

<!-- ========== NAVIGATION ========== -->
<Navigation />

<!-- ========== HOME ========== -->
<header class="home" id="homeTitle">
  <div class="wrapper">
    <div class="home-grid">
      <h4>{content.home.title1}</h4>

      <svg width="300" height="100">
        <line x1="150" y1="100" x2="150" y2="0" stroke="#ffffff37" />
        <line x1="100" y1="50" x2="200" y2="50" stroke="#ffffff37" />
      </svg>

      <h4>{content.home.title2}</h4>
    </div>

    <h1>{content.contact.name}</h1>

    <p class="tagline">
      {@html content.home.tagline}
    </p>
  </div>
</header>

<!-- ========== ABOUT ========== -->
<PassionSection about={content.about} />

<!-- ========== EXPERIENCE ========== -->

<section class="credentials" id="credentials">
  <div class="wrapper">
    <h2>Experience</h2>

    <div class="experience-gallery">
      <div class="gallery-container">
        <ExperienceGrid />
      </div>
    </div>
  </div>
</section>

<section class="skills" id="skills">
  <h2>Skills</h2>

  <!-- Temporary static skills grid -->
  <SkillsGrid skills={content.skills} />

  <!-- Brain placeholder (kept for later) -->
  <!-- <div id="brain-host"></div> -->
</section>

<!-- ========== PROJECTS ========== -->
<section class="projects" id="projects">
  <div class="wrapper">
    <h2>Projects</h2>

    <div class="infinite-gallery">
      <div class="gallery-container">
        <ProjectsGrid />
      </div>
    </div>
  </div>
</section>

<!-- ========== CONTACT ========== -->
<section class="contact" id="contact">
  <h2>{content.contact.title}</h2>

  <div class="wrapper">
    <div class="flex-container">
      <div class="img-container">
        <img
          src={content.contact.photo}
          alt={content.contact.name}
          class="profile-photo"
        />
      </div>

      <div class="contact-col">
        <p>
          {@html content.contact.description}
        </p>

        <div class="flex-container">
          {#each content.contact.links as link}
            <a href={link.url} target="_blank" rel="noopener">
              {link.text}
            </a>
          {/each}
        </div>

        <div style="margin-top:12px;">
          <a href={content.contact.resume} download>
            <button>
              DOWNLOAD RESUME
            </button>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
