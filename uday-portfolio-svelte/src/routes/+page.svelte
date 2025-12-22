<script lang="ts">
  import { onMount } from 'svelte';
  import { modal } from '$lib/stores/modal';
  import { backgroundService } from '$lib/background/backgroundService';
  import { neuralParticlesService } from '$lib/background/neuralParticlesService';

  import Navigation from '$lib/components/Navigation.svelte';
  import PassionSection from '$lib/components/PassionSection.svelte';
  import SkillsGrid from '$lib/components/skills/SkillsGrid.svelte';
  import ExperienceGrid from '$lib/components/experience/ExperienceGrid.svelte';
  import ProjectsGrid from '$lib/components/projects/ProjectsGrid.svelte';
  import BaseGallery from '$lib/components/BaseGallery.svelte';
  import content from '$lib/data/content.json';

  let currentTheme: 'experience' | 'projects' | null = null;

  onMount(() => {
  /* =========================
     LOADER RELEASE
     ========================= */

  const MIN_LOADER_TIME = 1200;
  const startTime = performance.now();

  const reveal = () => {
    document.body.classList.add('show-ui');
  };

  window.addEventListener(
    'load',
    () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);
      setTimeout(reveal, remaining);
    },
    { once: true }
  );

  // Safety fallback
  setTimeout(reveal, 2500);
    /* =========================
       BACKGROUND + PARTICLES
       ========================= */

    const bgContainer = document.getElementById('bg-canvas');
    const particleContainer = document.getElementById('particles-canvas');

    if (bgContainer) backgroundService.mount(bgContainer);
    if (particleContainer) neuralParticlesService.mount(particleContainer);

    /* =========================
       SCROLL VELOCITY
       ========================= */

    let lastScroll = window.scrollY;
    let lastTime = performance.now();

    const onScroll = () => {
      const now = performance.now();
      const deltaY = Math.abs(window.scrollY - lastScroll);
      const deltaT = Math.max(16, now - lastTime);

      const velocity = Math.min(deltaY / deltaT, 1.5);

      neuralParticlesService.setScrollVelocity(velocity);

      lastScroll = window.scrollY;
      lastTime = now;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    /* =========================
       SECTION THEMES
       ========================= */

    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;

          const id = e.target.id as 'experience' | 'projects';
          if (id === currentTheme) return;

          currentTheme = id;
          backgroundService.setTheme(id);
          neuralParticlesService.setTheme(id);
        }
      },
      { threshold: 0.45, rootMargin: '-10% 0px -10% 0px' }
    );

    ['experience', 'projects'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    /* =========================
       MODAL PAUSE
       ========================= */

    const unsubscribe = modal.subscribe(m => {
      backgroundService.setPaused(m.open);
      neuralParticlesService.setPaused(m.open);
    });

    return () => {
      unsubscribe();
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
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
</svelte:head>

<!-- =========================
     BACKGROUND
     ========================= -->
<div id="bg-canvas" class="background-layer" aria-hidden="true"></div>
<div id="particles-canvas" class="particles-layer" aria-hidden="true"></div>

<!-- =========================
     LOADER
     ========================= -->
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
            <span>neural portfolio · Uday Lunawat</span>
          </div>
        </div>
        <div class="ai-role">
          Senior ML Engineer · LLMs · Agents · RAG
        </div>
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

<!-- =========================
     NAV
     ========================= -->
<Navigation />

<!-- =========================
     HOME
     ========================= -->
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

<!-- =========================
     ABOUT
     ========================= -->
<PassionSection about={content.about} />

<!-- =========================
     EXPERIENCE
     ========================= -->
<section
  class="experience credentials"
  id="experience"
  on:introend={setExperienceTheme}
>
  <div class="wrapper">
    <h2>Experience</h2>

    <BaseGallery showDots ariaLabel="Experience gallery">
      <ExperienceGrid />
    </BaseGallery>
  </div>
</section>

<!-- =========================
     SKILLS
     ========================= -->
<section class="skills" id="skills">
  <h2>Skills</h2>
  <SkillsGrid skills={content.skills} />
</section>

<!-- =========================
     PROJECTS
     ========================= -->
<section
  class="projects"
  id="projects"
  on:introend={setProjectsTheme}
>
  <div class="wrapper">
    <h2>Projects</h2>

    <BaseGallery showDots ariaLabel="Projects gallery">
      <ProjectsGrid />
    </BaseGallery>
  </div>
</section>

<!-- =========================
     CONTACT
     ========================= -->
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
        <p>{@html content.contact.description}</p>

        <div class="flex-container">
          {#each content.contact.links as link}
            <a href={link.url} target="_blank" rel="noopener">
              {link.text}
            </a>
          {/each}
        </div>

        <div style="margin-top:12px;">
          <a href={content.contact.resume} download>
            <button>DOWNLOAD RESUME</button>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
