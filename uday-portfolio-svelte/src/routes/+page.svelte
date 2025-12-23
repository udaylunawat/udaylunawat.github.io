<script lang="ts">
  import { onMount } from 'svelte';
  import { modal } from '$lib/stores/modal';
  import { backgroundService } from '$lib/background/backgroundService';
  import { neuralParticlesService } from '$lib/background/neuralParticlesService';
  import BrainSkills from '$lib/components/BrainSkills.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import PassionSection from '$lib/components/PassionSection.svelte';
  import SkillsGrid from '$lib/components/skills/SkillsGrid.svelte';
  import { MatrixEffect } from '$lib/brain/matrix/matrixEffect';
  import ExperienceGrid from '$lib/components/experience/ExperienceGrid.svelte';
  import ProjectsGrid from '$lib/components/projects/ProjectsGrid.svelte';
  import BaseGallery from '$lib/components/BaseGallery.svelte';
  import content from '$lib/data/content.json';

  let currentTheme: 'experience' | 'projects' | null = null;

  // 🔥 MATRIX STATE
  let skillsSection: HTMLElement;
  let matrixHasRun = false;

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

    const themeObserver = new IntersectionObserver(
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
      if (el) themeObserver.observe(el);
    });

    /* =========================
       MATRIX EFFECT (SKILLS)
       ========================= */

    const matrixObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (matrixHasRun) return;

        matrixHasRun = true;
        matrixObserver.disconnect();

        // Hide brain initially
        const brainHost = document.getElementById('brain-host');
        if (brainHost) {
          brainHost.classList.add('matrix-hidden');
        }

        // Start Matrix
        const matrix = new MatrixEffect();

        matrix.onComplete = () => {
          if (brainHost) {
            brainHost.classList.remove('matrix-hidden');
            brainHost.classList.add('matrix-revealed');
          }
        };
      },
      {
        threshold: 0.6,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    if (skillsSection) {
      matrixObserver.observe(skillsSection);
    }

    /* =========================
       MODAL PAUSE
       ========================= */

    let modalInitialized = false;

    const unsubscribe = modal.subscribe(m => {
      if (!modalInitialized) {
        modalInitialized = true;
        return;
      }

      backgroundService.setPaused(m.open);
      neuralParticlesService.setPaused(m.open);
    });

    return () => {
      unsubscribe();
      themeObserver.disconnect();
      matrixObserver.disconnect();
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

    <!-- 🔒 SINGLE ANCHORED BLOCK -->
    <div class="hero-text">
      <h1>{content.contact.name}</h1>

      <p class="tagline">
        {@html content.home.tagline}
      </p>
    </div>

  </div>
</header>

<!-- =========================
     ABOUT
     ========================= -->

<section class="section about" id="about">
  <PassionSection about={content.about} />
</section>

<!-- =========================
     EXPERIENCE
     ========================= -->
<section class="section experience" id="experience">
  <h2 class="section-title">Experience</h2>

  <BaseGallery showDots>
    <ExperienceGrid />
  </BaseGallery>
</section>

<!-- =========================
     SKILLS
     ========================= -->
<!-- <section id="skills-brain" class="skills-brain">
  <h2>Skills</h2>
  <BrainSkills />
</section>

<style>
  .skills-brain {
    position: relative;
    width: 100%;
    padding: 4rem 0;
  }
</style> -->

<section
  bind:this={skillsSection}
  class="section skills"
  id="skills"
>
  <h2 class="section-title">Skills</h2>

  <!-- Brain is mounted immediately, but hidden -->
  <BrainSkills />
</section>

<!-- =========================
     PROJECTS
     ========================= -->
<section class="section projects" id="projects">
  <h2 class="section-title">Projects</h2>

  <BaseGallery showDots>
    <ProjectsGrid />
  </BaseGallery>
</section>

<!-- =========================
     CONTACT
     ========================= -->
<section class="section contact" id="contact">
  <h2 class="section-title">Contact</h2>

  <div class="wrapper">
    <div class="flex-container contact-grid">
      <!-- LEFT: Profile + Links -->
      <div class="contact-col">
        <div class="img-container">
          <img
            src={content.contact.photo}
            alt={content.contact.name}
            class="profile-photo"
          />
        </div>

        <p class="contact-description">
          {@html content.contact.description}
        </p>

        <div class="flex-container contact-links">
          {#each content.contact.links as link}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="secondary-btn"
            >
              {link.text}
            </a>
          {/each}
        </div>

        <div class="resume-wrap">
          <a
            href={content.contact.resume}
            download
            class="primary-btn"
          >
            DOWNLOAD RESUME
            {#if content.contact.resumeIcon}
              <img
                src={content.contact.resumeIcon}
                alt="PDF"
                class="resume-icon"
              />
            {/if}
          </a>
        </div>
      </div>

      <!-- RIGHT: Contact Form -->
      <div class="contact-col contact-form-container">
        <h4>Contact Me</h4>

        <form
          class="contact-form"
          action="https://formspree.io/f/mvgbvdbq"
          method="POST"
        >
          <label>
            Your email
            <input
              type="email"
              name="email"
              required
            />
          </label>

          <label>
            Your message
            <textarea
              name="message"
              rows="4"
              required
            ></textarea>
          </label>

          <button type="submit" class="primary-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  </div>
</section>