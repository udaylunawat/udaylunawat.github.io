# Astro + Tailwind Portfolio Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate a vanilla JS portfolio to Astro 5 + Tailwind v4 with a Hamish-style displacement shader hero, GSAP scroll animations, blog, and GitHub Pages deployment.

**Architecture:** Astro SSG with content collections (experience, projects, blog as MDX). Three.js displacement shader runs as a React island (`client:idle`) on the home page only. GSAP ScrollTrigger drives scroll animations across all pages. Tailwind v4 with CSS-based `@theme` config. Deployed as static HTML to GitHub Pages via Actions.

**Tech Stack:** Astro 5, Tailwind v4, TypeScript, MDX, Three.js + GLSL, GSAP + ScrollTrigger, React (for Three.js island only)

**Spec:** `docs/superpowers/specs/2026-03-23-portfolio-migration-design.md`

**Reference repos (cloned to `.reference/`):**
- `.reference/hamishw-portfolio/` — shader hero, theme system
- `.reference/shubh73-devfolio/` — GSAP scroll patterns

---

## File Structure

```
src/
├── content.config.ts                    # Zod schemas for blog, projects, experience collections
├── layouts/
│   ├── BaseLayout.astro                 # HTML shell, meta tags, fonts, theme, skip-to-content
│   └── BlogLayout.astro                 # Blog post wrapper: ToC, reading time, prev/next
├── pages/
│   ├── index.astro                      # Hero + about snippet + featured projects + latest posts
│   ├── projects/
│   │   ├── index.astro                  # Filterable project grid
│   │   └── [...slug].astro             # Project detail pages
│   ├── experience.astro                 # Vertical timeline
│   ├── about.astro                      # Bio, skills, education, contact form
│   ├── blog/
│   │   ├── index.astro                  # Blog listing with tags
│   │   └── [...slug].astro             # Blog post pages
│   ├── rss.xml.ts                       # RSS feed
│   └── 404.astro                        # 404 page
├── components/
│   ├── Hero.astro                       # Hero container (text + shader island)
│   ├── DisplacementSphere.tsx           # Three.js + GLSL React component (client:idle)
│   ├── Nav.astro                        # Responsive nav with mobile hamburger
│   ├── Footer.astro                     # Social links, copyright
│   ├── ThemeToggle.astro                # Dark/light toggle with system detection
│   ├── ProjectCard.astro                # Project card for grid
│   ├── ExperienceTimeline.astro         # Timeline component
│   ├── SkillsGrid.astro                 # Skills by category with devicons
│   ├── ContactForm.astro                # Formspree form
│   ├── BlogPostCard.astro               # Blog post card
│   ├── ScrollReveal.astro               # Wrapper component for GSAP reveal animation
│   └── TableOfContents.astro            # Auto-generated ToC for blog posts
├── scripts/
│   └── gsap-init.ts                     # GSAP + ScrollTrigger registration and animation setup
├── shaders/
│   ├── displacement.vert                # Perlin noise vertex displacement
│   └── displacement.frag                # Fragment shader with iridescent coloring
├── data/
│   └── skills.ts                        # Skills data array with categories and icons
├── content/
│   ├── blog/
│   │   └── hello-world.mdx              # Placeholder blog post
│   ├── projects/
│   │   ├── rockreveal-ai.mdx
│   │   ├── alpr.mdx
│   │   ├── liveliness-detection.mdx
│   │   ├── covid-xray.mdx
│   │   ├── agentic-data-analysis.mdx
│   │   ├── pdf2podcast.mdx
│   │   └── other-ml-projects.mdx
│   └── experience/
│       ├── fractal.mdx
│       ├── hcl.mdx
│       ├── chugani.mdx
│       ├── yang.mdx
│       └── tcs-infosys.mdx
├── styles/
│   └── global.css                       # Tailwind v4 @theme + custom utilities
└── assets/                              # Migrated images, resume PDF
```

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json`, `package.json`, `src/styles/global.css`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/astro-migration
```

- [ ] **Step 2: Initialize Astro project**

```bash
cd /Users/udaylunawat/Downloads/udaylunawat.github.io
npm create astro@latest . -- --template minimal --typescript strict --install --git false
```

Accept overwriting only config files. Keep existing `src/` content (will be replaced file by file later).

- [ ] **Step 3: Install dependencies**

```bash
npm install @astrojs/mdx @astrojs/sitemap @astrojs/react @astrojs/rss
npm install react react-dom three gsap @types/three @tailwindcss/vite tailwindcss
npm install -D prettier prettier-plugin-astro
```

- [ ] **Step 4: Configure Astro**

Write `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://udaylunawat.github.io',
  integrations: [mdx(), sitemap(), react()],
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
    ssr: { noExternal: ['three'] },
  },
});
```

- [ ] **Step 5: Configure Tailwind v4 global styles**

Write `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a1a;
  --color-surface: #1a1a2e;
  --color-primary: #00d4ff;
  --color-secondary: #7c3aed;
  --color-text: #e2e8f0;
  --color-muted: #94a3b8;

  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

@layer base {
  html {
    scroll-behavior: smooth;
    color-scheme: dark;
  }
  body {
    font-family: var(--font-body);
    background-color: var(--color-bg);
    color: var(--color-text);
  }
  h1, h2, h3, h4 {
    font-family: var(--font-heading);
  }
  code, pre {
    font-family: var(--font-mono);
  }
}

[data-theme='light'] {
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-primary: #0284c7;
  --color-secondary: #6d28d9;
  --color-text: #1e293b;
  --color-muted: #64748b;
  color-scheme: light;
}

.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: var(--color-bg);
}
.skip-to-content:focus {
  left: 0.5rem;
  top: 0.5rem;
}
```

- [ ] **Step 6: Add TypeScript declarations for shader imports**

Write `src/env.d.ts`:

```typescript
/// <reference path="../.astro/types.d.ts" />

declare module '*.vert?raw' {
  const value: string;
  export default value;
}
declare module '*.frag?raw' {
  const value: string;
  export default value;
}
declare module '*.glsl?raw' {
  const value: string;
  export default value;
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Astro dev server starts on localhost:4321

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro 5 project with Tailwind v4, MDX, React, Three.js, GSAP"
```

---

### Task 2: BaseLayout, Nav, Footer, Theme Toggle

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`

- [ ] **Step 1: Create BaseLayout**

Write `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import { ClientRouter } from 'astro:transitions/ClientRouter';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description = 'Uday Lunawat — Senior ML Engineer', ogImage } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href={canonicalURL} />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
    <ClientRouter />
    <title>{title}</title>
  </head>
  <body>
    <a class="skip-to-content" href="#main-content">Skip to content</a>
    <Nav />
    <main id="main-content">
      <slot />
    </main>
    <Footer />
    <script>
      const theme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    </script>
  </body>
</html>
```

- [ ] **Step 2: Create Nav**

Write `src/components/Nav.astro`:

```astro
---
import ThemeToggle from './ThemeToggle.astro';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
];

const currentPath = Astro.url.pathname;
---

<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/80 border-b border-surface">
  <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" class="text-lg font-heading font-bold text-primary">UL</a>
    <div class="hidden md:flex items-center gap-6">
      {navLinks.map(link => (
        <a
          href={link.href}
          class:list={[
            'text-sm font-medium transition-colors hover:text-primary',
            currentPath === link.href ? 'text-primary' : 'text-muted',
          ]}
        >
          {link.label}
        </a>
      ))}
      <ThemeToggle />
    </div>
    <button id="mobile-menu-btn" class="md:hidden text-text" aria-label="Toggle menu">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
  <div id="mobile-menu" class="hidden md:hidden px-4 pb-4 space-y-2">
    {navLinks.map(link => (
      <a
        href={link.href}
        class:list={[
          'block py-2 text-sm font-medium transition-colors hover:text-primary',
          currentPath === link.href ? 'text-primary' : 'text-muted',
        ]}
      >
        {link.label}
      </a>
    ))}
    <ThemeToggle />
  </div>
</nav>

<script>
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });
</script>
```

- [ ] **Step 3: Create ThemeToggle**

Write `src/components/ThemeToggle.astro`:

```astro
<button id="theme-toggle" class="p-2 rounded-lg hover:bg-surface transition-colors" aria-label="Toggle theme">
  <svg id="sun-icon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
  <svg id="moon-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
</button>

<script>
  function updateToggle() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    document.getElementById('sun-icon')?.classList.toggle('hidden', isDark);
    document.getElementById('moon-icon')?.classList.toggle('hidden', !isDark);
  }

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateToggle();
  });

  updateToggle();
</script>
```

- [ ] **Step 4: Create Footer**

Write `src/components/Footer.astro`:

```astro
---
const socialLinks = [
  { href: 'https://github.com/udaylunawat', label: 'GitHub', icon: 'github' },
  { href: 'https://linkedin.com/in/uday-lunawat', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://twitter.com/udaylunawat', label: 'Twitter', icon: 'twitter' },
];
const year = new Date().getFullYear();
---

<footer class="border-t border-surface py-8 mt-20">
  <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
    <p class="text-sm text-muted">&copy; {year} Uday Lunawat</p>
    <div class="flex gap-4">
      {socialLinks.map(link => (
        <a href={link.href} target="_blank" rel="noopener noreferrer" class="text-muted hover:text-primary transition-colors" aria-label={link.label}>
          {link.label}
        </a>
      ))}
    </div>
  </div>
</footer>
```

- [ ] **Step 5: Create a placeholder index page and verify**

Write `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Uday Lunawat — Senior ML Engineer">
  <section class="pt-24 px-4 max-w-6xl mx-auto min-h-screen flex items-center">
    <h1 class="text-5xl font-heading font-bold">Coming soon</h1>
  </section>
</BaseLayout>
```

```bash
npm run dev
```

Expected: Page renders with nav, footer, dark theme, and theme toggle works.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/ src/components/Nav.astro src/components/Footer.astro src/components/ThemeToggle.astro src/pages/index.astro
git commit -m "feat: add BaseLayout, Nav, Footer, and ThemeToggle"
```

---

### Task 3: Content Collections & Data Migration

**Files:**
- Create: `src/content.config.ts`, `src/data/skills.ts`, all files in `src/content/experience/`, `src/content/projects/`, `src/content/blog/`
- Reference: `content.json`, `projects.json`, `experience/*.html`

- [ ] **Step 1: Define content collection schemas**

Write `src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const experience = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dates: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    badges: z.array(z.string()).default([]),
    logo: z.string(),
    order: z.number(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    icon: z.string().optional(),
    github: z.string().optional(),
    demo: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { experience, projects, blog };
```

- [ ] **Step 2: Migrate experience data**

Create MDX files for each experience entry. Example `src/content/experience/fractal.mdx`:

```mdx
---
company: "Fractal AI"
role: "Senior Machine Learning / SWE"
dates: "Nov 2024 – Present · Pune"
tags: ["LangGraph", "LangChain", "Multi-Agent", "Python"]
description: "Led engineering for Fractal AI (India's First AI Unicorn Company), a multi-agent orchestration platform."
badges: ["300+ agents onboarded", "11,000+ automated workflows"]
logo: "/images/fractal2.png"
order: 1
---

Led engineering for a multi-agent orchestration platform (LangGraph / LangChain). Owned tool onboarding and metadata lifecycle to productize agent behaviors for the largest US telecom's business use.
```

Repeat for `hcl.mdx` (order: 2), `chugani.mdx` (order: 3), `yang.mdx` (order: 4), `tcs-infosys.mdx` (order: 5) — pull content from `content.json` experience entries and the corresponding `experience/*.html` files.

- [ ] **Step 3: Migrate project data**

Create MDX files for each project. Example `src/content/projects/rockreveal-ai.mdx`:

```mdx
---
title: "RockReveal AI"
tags: ["Python", "Telegram Bot", "MLOps", "W&B"]
description: "Image classification deployed as a Telegram bot. Integrated Weights & Biases for experiment & artifact tracking."
featured: true
order: 1
---

Image classification deployed as a Telegram bot. Integrated Weights & Biases for experiment & artifact tracking and a simple MLOps workflow for continuous improvements.
```

Repeat for all 7 projects from `projects.json`. Mark 3-4 as `featured: true`.

- [ ] **Step 4: Create placeholder blog post**

Write `src/content/blog/hello-world.mdx`:

```mdx
---
title: "Hello World"
description: "First post on the new blog — what I'm building and why."
date: 2026-03-23
tags: ["meta", "portfolio"]
---

Welcome to my blog. I'll be writing about ML engineering, MLOps, and building production AI systems.

## What to expect

Posts about practical ML engineering — shipping models, building pipelines, and lessons learned.

```python
print("Hello, world!")
```
```

- [ ] **Step 5: Create skills data**

Write `src/data/skills.ts`:

```typescript
export interface Skill {
  name: string;
  icon: string;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    category: 'ML / AI',
    skills: [
      { name: 'TensorFlow', icon: 'devicon-tensorflow-original' },
      { name: 'PyTorch', icon: 'devicon-pytorch-original' },
      { name: 'scikit-learn', icon: 'devicon-scikitlearn-plain' },
      { name: 'LangChain', icon: 'devicon-python-plain' },
    ],
  },
  {
    category: 'Languages',
    skills: [
      { name: 'Python', icon: 'devicon-python-plain' },
      { name: 'TypeScript', icon: 'devicon-typescript-plain' },
      { name: 'SQL', icon: 'devicon-postgresql-plain' },
    ],
  },
  {
    category: 'Cloud & MLOps',
    skills: [
      { name: 'AWS', icon: 'devicon-amazonwebservices-original' },
      { name: 'GCP', icon: 'devicon-googlecloud-plain' },
      { name: 'Docker', icon: 'devicon-docker-plain' },
      { name: 'Kubernetes', icon: 'devicon-kubernetes-plain' },
      { name: 'MLflow', icon: 'devicon-python-plain' },
    ],
  },
  {
    category: 'Tools',
    skills: [
      { name: 'Git', icon: 'devicon-git-plain' },
      { name: 'Linux', icon: 'devicon-linux-plain' },
      { name: 'FastAPI', icon: 'devicon-fastapi-plain' },
      { name: 'Streamlit', icon: 'devicon-streamlit-plain' },
    ],
  },
];
```

- [ ] **Step 6: Copy images to public and assets**

```bash
mkdir -p public/images
cp src/img/fractal2.png src/img/hcltech.jpeg src/img/Infosys_logo.svg.png src/img/tcs.webp public/images/
cp src/img/*.svg public/images/
cp src/img/*.png public/images/
mkdir -p src/assets/images
cp src/Uday_Lunawat_Resume_Senior_ML_Engineer_V9.pdf public/Uday_Lunawat_Resume.pdf
```

Logo paths in experience/project frontmatter use absolute URLs like `/images/fractal2.png` which resolve from `public/`.

- [ ] **Step 7: Verify collections load**

```bash
npm run dev
```

Check console for content collection errors. Fix any schema mismatches.

- [ ] **Step 8: Commit**

```bash
git add src/content.config.ts src/data/ src/content/ src/assets/ public/Uday_Lunawat_Resume.pdf
git commit -m "feat: migrate content to Astro content collections"
```

---

### Task 4: Displacement Shader Hero

**Files:**
- Create: `src/shaders/displacement.vert`, `src/shaders/displacement.frag`, `src/components/DisplacementSphere.tsx`, `src/components/Hero.astro`
- Reference: `.reference/hamishw-portfolio/app/routes/home/displacement-sphere.jsx` and its GLSL files

- [ ] **Step 1: Write vertex shader**

Write `src/shaders/displacement.vert` — adapt from Hamish's `displacement-sphere-vertex.glsl`. This uses Perlin noise to displace sphere vertices:

```glsl
// Perlin noise functions (Stefan Gustavson)
// + turbulence function applying 10-octave noise
// Displaces vertices along normals based on noise(position + time)
// Passes noise value and UV to fragment shader
```

Copy the full shader from `.reference/hamishw-portfolio/app/routes/home/displacement-sphere-vertex.glsl` and adjust uniform names if needed.

- [ ] **Step 2: Write fragment shader**

Write `src/shaders/displacement.frag` — adapt from Hamish's `displacement-sphere-fragment.glsl`. Generates iridescent colors from UV + noise values using Three.js Phong lighting includes.

Copy from `.reference/hamishw-portfolio/app/routes/home/displacement-sphere-fragment.glsl`.

- [ ] **Step 3: Create DisplacementSphere React component**

Write `src/components/DisplacementSphere.tsx`:

```tsx
import { useEffect, useRef, useCallback } from 'react';
import {
  WebGLRenderer, Scene, PerspectiveCamera, SphereGeometry,
  MeshPhongMaterial, Mesh, DirectionalLight, AmbientLight,
  UniformsUtils, Color
} from 'three';
import vertexShader from '../shaders/displacement.vert?raw';
import fragmentShader from '../shaders/displacement.frag?raw';

export default function DisplacementSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const uniformsRef = useRef<any>(null);
  const startTime = useRef(Date.now());
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  // Adapted from .reference/hamishw-portfolio/app/routes/home/displacement-sphere.jsx
  // Key pattern: onBeforeCompile to inject custom shaders into MeshPhongMaterial
  // Mouse position drives sphere rotation via lerp
  // requestAnimationFrame loop updates time uniform for animation
  // Respects prefers-reduced-motion
  // Responsive sizing based on viewport

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    rendererRef.current = renderer;

    const scene = new Scene();
    const camera = new PerspectiveCamera(54, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 52;

    const dirLight = new DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(100, 100, 200);
    const ambientLight = new AmbientLight(0xffffff, 0.4);
    scene.add(dirLight, ambientLight);

    const geometry = new SphereGeometry(32, 128, 128);
    const material = new MeshPhongMaterial();
    material.onBeforeCompile = (shader) => {
      uniformsRef.current = UniformsUtils.merge([
        shader.uniforms,
        { time: { value: 0 } },
      ]);
      shader.uniforms = uniformsRef.current;
      shader.vertexShader = vertexShader;
      shader.fragmentShader = fragmentShader;
    };

    const sphere = new Mesh(geometry, material);
    sphere.position.set(22, 16, 0);
    scene.add(sphere);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Responsive sphere position
      if (window.innerWidth <= 480) sphere.position.set(14, 10, 0);
      else if (window.innerWidth <= 768) sphere.position.set(18, 14, 0);
      else sphere.position.set(22, 16, 0);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (uniformsRef.current) {
        uniformsRef.current.time.value = 0.00005 * (Date.now() - startTime.current);
      }
      if (!prefersReducedMotion) {
        sphere.rotation.z += 0.001;
        sphere.rotation.x += (mouseY.current * 0.3 - sphere.rotation.x) * 0.05;
        sphere.rotation.y += (mouseX.current * 0.3 - sphere.rotation.y) * 0.05;
      }
      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      renderer.render(scene, camera); // Single static render
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
```

- [ ] **Step 4: Create Hero container**

Write `src/components/Hero.astro`:

```astro
---
import DisplacementSphere from './DisplacementSphere.tsx';

const socialLinks = [
  { href: 'https://github.com/udaylunawat', label: 'GitHub' },
  { href: 'https://linkedin.com/in/uday-lunawat', label: 'LinkedIn' },
];
---

<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
  <div class="absolute inset-0 hidden md:block">
    <DisplacementSphere client:idle />
  </div>
  <div class="absolute inset-0 md:hidden bg-gradient-to-br from-bg via-surface to-bg" />

  <div class="relative z-10 max-w-4xl mx-auto px-4 text-center md:text-left">
    <p class="text-muted font-mono text-sm mb-4">&gt; hello world</p>
    <h1 class="text-5xl md:text-7xl font-heading font-bold mb-4">
      Uday Lunawat
    </h1>
    <p class="text-xl md:text-2xl text-primary font-mono mb-6">
      &gt; Senior ML Engineer<span class="animate-pulse">_</span>
    </p>
    <p class="text-lg text-muted max-w-2xl mb-8">
      Building scalable, production-ready AI systems across Computer Vision, NLP, and Agentic AI.
    </p>
    <div class="flex gap-4 justify-center md:justify-start">
      <a href="/projects" class="px-6 py-3 bg-primary text-bg font-medium rounded-lg hover:opacity-90 transition-opacity">
        View Projects
      </a>
      <a href="/blog" class="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
        Read Blog
      </a>
    </div>
    <div class="flex gap-4 mt-6 justify-center md:justify-start">
      {socialLinks.map(link => (
        <a href={link.href} target="_blank" rel="noopener noreferrer" class="text-muted hover:text-primary transition-colors text-sm">
          {link.label}
        </a>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Update index.astro to use Hero**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
---

<BaseLayout title="Uday Lunawat — Senior ML Engineer">
  <Hero />
</BaseLayout>
```

- [ ] **Step 6: Verify hero renders**

```bash
npm run dev
```

Expected: Hero section with displacement sphere on desktop, gradient fallback on mobile. Mouse movement affects sphere rotation.

- [ ] **Step 7: Commit**

```bash
git add src/shaders/ src/components/DisplacementSphere.tsx src/components/Hero.astro src/pages/index.astro
git commit -m "feat: add displacement shader hero with Three.js island"
```

---

### Task 5: Home Page Sections (About Snippet, Featured Projects, Latest Posts)

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/BlogPostCard.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create ProjectCard**

Write `src/components/ProjectCard.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  tags: string[];
  slug: string;
}
const { title, description, tags, slug } = Astro.props;
---

<a href={`/projects/${slug}`} class="group block p-6 rounded-xl bg-surface border border-surface hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
  <h3 class="text-lg font-heading font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
  <p class="text-muted text-sm mb-4 line-clamp-2">{description}</p>
  <div class="flex flex-wrap gap-2">
    {tags.map(tag => (
      <span class="text-xs px-2 py-1 rounded-full bg-bg text-muted">{tag}</span>
    ))}
  </div>
</a>
```

- [ ] **Step 2: Create BlogPostCard**

Write `src/components/BlogPostCard.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  date: Date;
  slug: string;
  tags: string[];
}
const { title, description, date, slug, tags } = Astro.props;
const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
---

<a href={`/blog/${slug}`} class="group block p-6 rounded-xl bg-surface border border-surface hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
  <time class="text-xs text-muted font-mono">{formattedDate}</time>
  <h3 class="text-lg font-heading font-semibold mt-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>
  <p class="text-muted text-sm line-clamp-2">{description}</p>
</a>
```

- [ ] **Step 3: Build full home page**

Update `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import ProjectCard from '../components/ProjectCard.astro';
import BlogPostCard from '../components/BlogPostCard.astro';
import { getCollection } from 'astro:content';

const featuredProjects = (await getCollection('projects'))
  .filter(p => p.data.featured)
  .sort((a, b) => a.data.order - b.data.order);

const recentPosts = (await getCollection('blog'))
  .filter(p => !p.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
---

<BaseLayout title="Uday Lunawat — Senior ML Engineer">
  <Hero />

  <section class="max-w-6xl mx-auto px-4 py-20">
    <h2 class="text-3xl font-heading font-bold mb-4">About</h2>
    <p class="text-muted max-w-3xl text-lg leading-relaxed">
      Senior Machine Learning Engineer with 6+ years delivering enterprise-grade AI solutions. I focus on moving models into production — reliable code, robust APIs, and repeatable deployment pipelines. My work spans Computer Vision, NLP, and agentic systems.
    </p>
  </section>

  {featuredProjects.length > 0 && (
    <section class="max-w-6xl mx-auto px-4 py-20">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-heading font-bold">Featured Projects</h2>
        <a href="/projects" class="text-primary text-sm hover:underline">View all &rarr;</a>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProjects.map(project => (
          <ProjectCard
            title={project.data.title}
            description={project.data.description}
            tags={project.data.tags}
            slug={project.slug}
          />
        ))}
      </div>
    </section>
  )}

  {recentPosts.length > 0 && (
    <section class="max-w-6xl mx-auto px-4 py-20">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-heading font-bold">Latest Posts</h2>
        <a href="/blog" class="text-primary text-sm hover:underline">View all &rarr;</a>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentPosts.map(post => (
          <BlogPostCard
            title={post.data.title}
            description={post.data.description}
            date={post.data.date}
            slug={post.slug}
            tags={post.data.tags}
          />
        ))}
      </div>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 4: Verify home page**

```bash
npm run dev
```

Expected: Full home page with hero, about, featured projects, and latest posts.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.astro src/components/BlogPostCard.astro src/pages/index.astro
git commit -m "feat: add home page with about, featured projects, and latest posts"
```

---

### Task 6: Experience Page

**Files:**
- Create: `src/components/ExperienceTimeline.astro`, `src/pages/experience.astro`

- [ ] **Step 1: Create ExperienceTimeline**

Write `src/components/ExperienceTimeline.astro`:

```astro
---
import { getCollection } from 'astro:content';

const experiences = (await getCollection('experience'))
  .sort((a, b) => a.data.order - b.data.order);

// Pre-render all content (async map doesn't work in Astro templates)
const rendered = await Promise.all(
  experiences.map(async (exp) => ({
    ...exp,
    Content: (await exp.render()).Content,
  }))
);
---

<div class="relative">
  <div class="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-surface" />

  {rendered.map(({ data, Content }) => (
    <div class="relative pl-12 md:pl-20 pb-12 last:pb-0">
      <div class="absolute left-2 md:left-6 top-1 w-4 h-4 rounded-full bg-primary border-4 border-bg" />
      <div class="p-6 rounded-xl bg-surface border border-surface">
        <div class="flex items-start gap-4 mb-3">
          {data.logo && (
            <img src={data.logo} alt={data.company} class="w-10 h-10 rounded object-contain" />
          )}
          <div>
            <h3 class="font-heading font-semibold text-lg">{data.role}</h3>
            <p class="text-primary text-sm">{data.company}</p>
            <p class="text-muted text-xs font-mono">{data.dates}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-3">
          {data.tags.map(tag => (
            <span class="text-xs px-2 py-0.5 rounded-full bg-bg text-muted">{tag}</span>
          ))}
        </div>
        {data.badges.length > 0 && (
          <div class="flex flex-wrap gap-2 mb-3">
            {data.badges.map(badge => (
              <span class="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{badge}</span>
            ))}
          </div>
        )}
        <div class="text-muted text-sm prose prose-invert max-w-none">
          <Content />
        </div>
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Create experience page**

Write `src/pages/experience.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ExperienceTimeline from '../components/ExperienceTimeline.astro';
---

<BaseLayout title="Experience — Uday Lunawat">
  <section class="pt-24 pb-20 max-w-4xl mx-auto px-4">
    <h1 class="text-4xl font-heading font-bold mb-12">Experience</h1>
    <ExperienceTimeline />
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
# Navigate to /experience
git add src/components/ExperienceTimeline.astro src/pages/experience.astro
git commit -m "feat: add experience page with timeline component"
```

---

### Task 7: About Page (Skills, Contact Form)

**Files:**
- Create: `src/components/SkillsGrid.astro`, `src/components/ContactForm.astro`, `src/pages/about.astro`

- [ ] **Step 1: Create SkillsGrid**

Write `src/components/SkillsGrid.astro`:

```astro
---
import { skillCategories } from '../data/skills';
---

<div class="grid md:grid-cols-2 gap-8">
  {skillCategories.map(cat => (
    <div class="p-6 rounded-xl bg-surface border border-surface">
      <h3 class="font-heading font-semibold text-lg mb-4 text-primary">{cat.category}</h3>
      <div class="flex flex-wrap gap-3">
        {cat.skills.map(skill => (
          <div class="flex items-center gap-2 text-sm text-text">
            <i class={`${skill.icon} text-lg`} />
            <span>{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Create ContactForm**

Write `src/components/ContactForm.astro`:

```astro
<form action="https://formspree.io/f/mvgbvdbq" method="POST" class="max-w-lg space-y-4">
  <div>
    <label for="name" class="block text-sm text-muted mb-1">Name</label>
    <input type="text" id="name" name="name" required
      class="w-full px-4 py-2 rounded-lg bg-surface border border-surface text-text focus:border-primary focus:outline-none transition-colors" />
  </div>
  <div>
    <label for="email" class="block text-sm text-muted mb-1">Email</label>
    <input type="email" id="email" name="_replyto" required
      class="w-full px-4 py-2 rounded-lg bg-surface border border-surface text-text focus:border-primary focus:outline-none transition-colors" />
  </div>
  <div>
    <label for="message" class="block text-sm text-muted mb-1">Message</label>
    <textarea id="message" name="message" rows="4" required
      class="w-full px-4 py-2 rounded-lg bg-surface border border-surface text-text focus:border-primary focus:outline-none transition-colors resize-none" />
  </div>
  <button type="submit" class="px-6 py-3 bg-primary text-bg font-medium rounded-lg hover:opacity-90 transition-opacity">
    Send Message
  </button>
</form>
```

- [ ] **Step 3: Create about page**

Write `src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SkillsGrid from '../components/SkillsGrid.astro';
import ContactForm from '../components/ContactForm.astro';
---

<BaseLayout title="About — Uday Lunawat">
  <section class="pt-24 pb-20 max-w-4xl mx-auto px-4">
    <h1 class="text-4xl font-heading font-bold mb-8">About</h1>

    <div class="prose prose-invert max-w-none mb-16">
      <p class="text-lg text-muted leading-relaxed">
        Senior Machine Learning Engineer and Software Engineer with over 7 years delivering enterprise-grade AI and software solutions. I focus on moving models into production — writing reliable model code, robust APIs, and repeatable deployment pipelines.
      </p>
      <p class="text-lg text-muted leading-relaxed">
        My work spans Computer Vision, NLP, and agentic systems that automate analytics and workflows. I prefer shipping maintainable code and building observability into ML systems from day one.
      </p>
    </div>

    <h2 class="text-3xl font-heading font-bold mb-8">Skills</h2>
    <div class="mb-16">
      <SkillsGrid />
    </div>

    <h2 class="text-3xl font-heading font-bold mb-8">Resume</h2>
    <a href="/Uday_Lunawat_Resume.pdf" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-surface rounded-lg text-primary hover:border-primary transition-colors mb-16">
      Download Resume (PDF)
    </a>

    <h2 class="text-3xl font-heading font-bold mb-8">Get in Touch</h2>
    <ContactForm />
  </section>
</BaseLayout>
```

- [ ] **Step 4: Verify and commit**

```bash
npm run dev
# Navigate to /about — verify skills grid, contact form, resume link
git add src/components/SkillsGrid.astro src/components/ContactForm.astro src/pages/about.astro
git commit -m "feat: add about page with skills grid, resume link, and contact form"
```

---

### Task 8: Projects Pages (Grid + Detail)

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[...slug].astro`

- [ ] **Step 1: Create projects listing page**

Write `src/pages/projects/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = (await getCollection('projects'))
  .sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout title="Projects — Uday Lunawat">
  <section class="pt-24 pb-20 max-w-6xl mx-auto px-4">
    <h1 class="text-4xl font-heading font-bold mb-12">Projects</h1>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard
          title={project.data.title}
          description={project.data.description}
          tags={project.data.tags}
          slug={project.slug}
        />
      ))}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create project detail page**

Write `src/pages/projects/[...slug].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map(project => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---

<BaseLayout title={`${project.data.title} — Uday Lunawat`} description={project.data.description}>
  <article class="pt-24 pb-20 max-w-4xl mx-auto px-4">
    <a href="/projects" class="text-muted hover:text-primary text-sm mb-8 inline-block">&larr; All Projects</a>
    <h1 class="text-4xl font-heading font-bold mb-4">{project.data.title}</h1>
    <div class="flex flex-wrap gap-2 mb-8">
      {project.data.tags.map(tag => (
        <span class="text-xs px-2 py-1 rounded-full bg-surface text-muted">{tag}</span>
      ))}
    </div>
    <div class="flex gap-4 mb-8">
      {project.data.github && (
        <a href={project.data.github} target="_blank" class="text-primary text-sm hover:underline">GitHub &rarr;</a>
      )}
      {project.data.demo && (
        <a href={project.data.demo} target="_blank" class="text-primary text-sm hover:underline">Live Demo &rarr;</a>
      )}
    </div>
    <div class="prose prose-invert max-w-none">
      <Content />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Verify and commit**

```bash
npm run dev
# Navigate to /projects and click into a project detail page
git add src/pages/projects/
git commit -m "feat: add projects listing and detail pages"
```

---

### Task 9: Blog Pages + RSS

**Files:**
- Create: `src/layouts/BlogLayout.astro`, `src/components/TableOfContents.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`, `src/pages/rss.xml.ts`

- [ ] **Step 1: Create BlogLayout**

Write `src/layouts/BlogLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description: string;
  date: Date;
  tags: string[];
}

const { title, description, date, tags } = Astro.props;
const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// Reading time estimate
const rawContent = await Astro.slots.render('default');
const wordCount = rawContent.split(/\s+/).length;
const readingTime = Math.ceil(wordCount / 200);
---

<BaseLayout title={`${title} — Uday Lunawat`} description={description}>
  <article class="pt-24 pb-20 max-w-3xl mx-auto px-4">
    <a href="/blog" class="text-muted hover:text-primary text-sm mb-8 inline-block">&larr; All Posts</a>
    <header class="mb-8">
      <time class="text-sm text-muted font-mono">{formattedDate}</time>
      <span class="text-muted text-sm"> &middot; {readingTime} min read</span>
      <h1 class="text-4xl font-heading font-bold mt-2 mb-4">{title}</h1>
      <div class="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span class="text-xs px-2 py-1 rounded-full bg-surface text-muted">{tag}</span>
        ))}
      </div>
    </header>
    <div class="prose prose-invert max-w-none">
      <slot />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Create blog listing page**

Write `src/pages/blog/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import BlogPostCard from '../../components/BlogPostCard.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog'))
  .filter(p => !p.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<BaseLayout title="Blog — Uday Lunawat">
  <section class="pt-24 pb-20 max-w-4xl mx-auto px-4">
    <div class="flex items-center justify-between mb-12">
      <h1 class="text-4xl font-heading font-bold">Blog</h1>
      <a href="/rss.xml" class="text-muted hover:text-primary text-sm">RSS Feed</a>
    </div>
    {posts.length === 0 ? (
      <p class="text-muted">No posts yet. Check back soon.</p>
    ) : (
      <div class="grid gap-6">
        {posts.map(post => (
          <BlogPostCard
            title={post.data.title}
            description={post.data.description}
            date={post.data.date}
            slug={post.slug}
            tags={post.data.tags}
          />
        ))}
      </div>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 3: Create blog post page**

Write `src/pages/blog/[...slug].astro`:

```astro
---
import BlogLayout from '../../layouts/BlogLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BlogLayout title={post.data.title} description={post.data.description} date={post.data.date} tags={post.data.tags}>
  <Content />
</BlogLayout>
```

- [ ] **Step 4: Create RSS feed**

Write `src/pages/rss.xml.ts`:

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog'))
    .filter(p => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Uday Lunawat — Blog',
    description: 'Posts about ML engineering, MLOps, and production AI systems.',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.slug}/`,
    })),
  });
}
```

- [ ] **Step 5: Verify and commit**

```bash
npm run dev
# Navigate to /blog, click into the hello-world post, verify /rss.xml
git add src/layouts/BlogLayout.astro src/pages/blog/ src/pages/rss.xml.ts
git commit -m "feat: add blog listing, post pages, and RSS feed"
```

---

### Task 10: GSAP Scroll Animations

**Files:**
- Create: `src/scripts/gsap-init.ts`, `src/components/ScrollReveal.astro`
- Modify: `src/layouts/BaseLayout.astro` (add GSAP script)
- Reference: `.reference/shubh73-devfolio/components/Work/Work.js` for ScrollTrigger patterns

- [ ] **Step 1: Create ScrollReveal wrapper component**

Write `src/components/ScrollReveal.astro`:

```astro
---
interface Props {
  animation?: 'fade-up' | 'fade-in' | 'scale-up' | 'stagger';
  delay?: number;
  class?: string;
}
const { animation = 'fade-up', delay = 0, class: className = '' } = Astro.props;
---

<div class={`scroll-reveal ${className}`} data-animation={animation} data-delay={delay}>
  <slot />
</div>
```

- [ ] **Step 2: Create GSAP initialization script**

Write `src/scripts/gsap-init.ts`:

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Fade up animation (default)
  gsap.utils.toArray<HTMLElement>('[data-animation="fade-up"]').forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: parseFloat(el.dataset.delay || '0'),
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Fade in animation
  gsap.utils.toArray<HTMLElement>('[data-animation="fade-in"]').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      duration: 0.6,
      delay: parseFloat(el.dataset.delay || '0'),
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Scale up animation
  gsap.utils.toArray<HTMLElement>('[data-animation="scale-up"]').forEach(el => {
    gsap.from(el, {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      delay: parseFloat(el.dataset.delay || '0'),
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Stagger children animation
  gsap.utils.toArray<HTMLElement>('[data-animation="stagger"]').forEach(el => {
    gsap.from(el.children, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}
```

- [ ] **Step 3: Add GSAP script to BaseLayout**

Add before closing `</body>` in `src/layouts/BaseLayout.astro`:

```html
<script>
  import '../scripts/gsap-init';
</script>
```

- [ ] **Step 4: Add ScrollReveal to home page sections**

Wrap the about, projects, and posts sections in `index.astro` with `<ScrollReveal>` components. Use `animation="fade-up"` for section headings, `animation="stagger"` for grids.

- [ ] **Step 5: Add ScrollReveal to experience timeline**

Wrap each timeline item in `ExperienceTimeline.astro` with `data-animation="fade-up"` and incrementing `data-delay`.

- [ ] **Step 6: Add ScrollReveal to about page sections**

Wrap skills grid with `animation="stagger"`, bio with `animation="fade-up"`.

- [ ] **Step 7: Verify animations**

```bash
npm run dev
```

Expected: Elements animate in as you scroll down each page. Animations disabled when `prefers-reduced-motion` is set.

- [ ] **Step 8: Commit**

```bash
git add src/scripts/gsap-init.ts src/components/ScrollReveal.astro src/layouts/BaseLayout.astro src/pages/ src/components/ExperienceTimeline.astro
git commit -m "feat: add GSAP ScrollTrigger scroll animations"
```

---

### Task 11: 404 Page + Polish

**Files:**
- Create: `src/pages/404.astro`
- Modify: various pages for View Transitions, reduced-motion

- [ ] **Step 1: Create 404 page**

Write `src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="404 — Uday Lunawat">
  <section class="pt-24 min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-heading font-bold text-primary mb-4">404</h1>
      <p class="text-muted text-lg mb-8">Page not found.</p>
      <a href="/" class="px-6 py-3 bg-primary text-bg font-medium rounded-lg hover:opacity-90 transition-opacity">
        Go Home
      </a>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Add reduced-motion CSS fallback**

Add to `src/styles/global.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
npm run preview
```

Expected: Static build succeeds, preview server works, all pages render.

- [ ] **Step 4: Commit**

```bash
git add src/pages/404.astro src/styles/global.css
git commit -m "feat: add 404 page and reduced-motion CSS fallback"
```

---

### Task 12: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/CNAME` (if custom domain)

- [ ] **Step 1: Create deploy workflow**

Write `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify build locally**

```bash
npm run check
npm run build
```

Expected: Both commands succeed with no errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deployment workflow"
```

---

### Task 13: Final Verification & Cleanup

- [ ] **Step 1: Run full verification checklist**

```bash
npm run dev          # All pages render
npm run check        # TypeScript + Astro checks pass
npm run build        # Static build succeeds
npm run preview      # Preview server works
```

- [ ] **Step 2: Manual testing checklist**

1. Home: hero shader renders, mouse movement works, CTA links work
2. About: skills grid, resume download, contact form submit
3. Experience: timeline renders all 5 entries
4. Projects: grid shows all 7, detail pages work
5. Blog: listing shows hello-world post, post page renders with code highlighting
6. Nav: all links work, mobile menu toggles, theme toggle works
7. 404: navigate to `/nonexistent`, see 404 page
8. RSS: `/rss.xml` returns valid XML
9. Responsive: check at 320px, 768px, 1280px
10. Reduced motion: enable in OS, verify animations disabled

- [ ] **Step 3: Remove old vanilla JS files**

```bash
rm -rf src/modals.js src/particles-controls.js src/github-stars.js src/background.js src/matrix-effect.js src/brainSkills.deep.js src/brain-gestures.js src/scroll-animations.js src/content-loader.js src/particles-config.js src/navigation.js src/utils.js src/style.css
rm -f loader.html valkyrie.html
```

Keep `content.json`, `projects.json`, and `experience/` as reference until migration is confirmed.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: remove old vanilla JS files after migration"
```

- [ ] **Step 5: Build one final time**

```bash
npm run build
```

Expected: Clean build with no errors or warnings.
