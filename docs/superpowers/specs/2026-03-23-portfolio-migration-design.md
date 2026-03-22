# Portfolio Migration: Vanilla JS to Astro + Tailwind

## Context

The current site is a vanilla JavaScript single-page portfolio (~5K lines of CSS, ~3.8K lines of JS) with no build system, no component model, and no blog support. The goal is to migrate to a modern framework for better developer experience, performance, SEO, and a fresh visual design suited to an AI/ML engineering profile. The site deploys to GitHub Pages.

## Design Inspirations

- **Hamish Williams** ([hamishw.com](https://hamishw.com), [repo](https://github.com/HamishMW/portfolio)) — dark theme, custom WebGL displacement shaders, polished page transitions, component storybook
- **shubh73 devfolio** ([shubhporwal.me](https://shubhporwal.me), [repo](https://github.com/shubh73/devfolio)) — GSAP scroll-driven animations, editorial dark layout, smooth section transitions

**Target aesthetic:** Futuristic/cyberpunk dark theme with a WebGL shader hero and GSAP scroll animations throughout. Clean, functional content sections below the hero.

## Tech Stack

- **Astro 5** — static site generator, content collections, zero JS by default
- **Tailwind v4** — utility-first CSS (CSS-based config via `@theme`, no JS config file)
- **TypeScript** — type safety
- **MDX** — blog posts with embedded components
- **Three.js + GLSL** — WebGL displacement shader hero (Astro island, `client:idle`)
- **GSAP + ScrollTrigger** — scroll-driven animations on all sections
- **Shiki** — syntax highlighting (built into Astro)

## Project Structure

```
/
├── astro.config.mjs
├── tsconfig.json
├── src/
│   ├── content.config.ts            # Content collection schemas (Zod) — Astro 5 location
│   ├── layouts/
│   │   ├── BaseLayout.astro          # HTML shell, meta, fonts, theme toggle, GSAP init
│   │   └── BlogLayout.astro          # Blog post wrapper with ToC, reading time
│   ├── pages/
│   │   ├── index.astro               # Hero + about + featured projects + latest posts
│   │   ├── projects/
│   │   │   ├── index.astro           # All projects grid with tag filters
│   │   │   └── [...slug].astro       # Individual project detail pages
│   │   ├── experience.astro          # Vertical timeline
│   │   ├── about.astro               # Extended bio + skills grid + contact form
│   │   ├── blog/
│   │   │   ├── index.astro           # Blog listing with tag filter + search
│   │   │   └── [...slug].astro       # Dynamic blog post pages
│   │   ├── rss.xml.ts                # RSS feed endpoint
│   │   └── 404.astro
│   ├── components/
│   │   ├── Hero.astro                # Full-viewport hero container
│   │   ├── DisplacementHero.tsx      # Three.js + GLSL displacement shader (client:idle island)
│   │   ├── ProjectCard.astro
│   │   ├── ExperienceTimeline.astro
│   │   ├── SkillsGrid.astro          # Grouped by category with devicon icons
│   │   ├── ContactForm.astro         # Formspree integration
│   │   ├── BlogPostCard.astro
│   │   ├── TagFilter.astro
│   │   ├── ScrollAnimations.ts       # GSAP ScrollTrigger setup for all sections
│   │   ├── ThemeToggle.astro         # Dark/light with system detection
│   │   ├── Nav.astro                 # Responsive nav with mobile menu
│   │   └── Footer.astro              # Social links, copyright
│   ├── shaders/
│   │   ├── displacement.vert         # Vertex shader for hero
│   │   └── displacement.frag         # Fragment shader for hero
│   ├── content/
│   │   ├── blog/                     # MDX blog posts
│   │   ├── projects/                 # Project entries (MDX with frontmatter)
│   │   └── experience/               # Experience entries (MDX with frontmatter)
│   ├── styles/
│   │   └── global.css                # Tailwind v4 @theme config + custom utilities
│   └── assets/                       # Images, resume PDF, logos
├── public/                           # Favicons, OG images, CNAME
└── package.json
```

## Decisions on Current Features

| Current Feature | Decision | Rationale |
|---|---|---|
| particles.js control panel | **Drop** | Replaced by WebGL displacement hero |
| Three.js shader background | **Replace** with displacement shader hero (Hamish-style) | More refined, art-directed effect |
| Matrix rain effect | **Drop** | Doesn't fit the new editorial dark aesthetic |
| 3D brain visualization | **Drop** | Replace with clean skills grid |
| TagCloud.js 3D skills sphere | **Drop** | Replace with categorized grid + devicon icons |
| vanilla-tilt card effects | **Drop** | GSAP hover animations replace this |
| Boot-sequence loader | **Drop** | Astro static pages load fast; no loader needed |
| GitHub stats fetcher | **Keep** | Render at build time via GitHub API in Astro frontmatter |
| Formspree contact form | **Keep** | Move to `ContactForm.astro` on the about page |
| Social links | **Keep** | GitHub, LinkedIn, Twitter/X in footer and hero |

## Visual Design

### Color Palette (Dark-First)

| Token          | Dark Mode     | Light Mode    |
|----------------|---------------|---------------|
| Background     | `#0a0a1a`     | `#fafafa`     |
| Surface        | `#1a1a2e`     | `#ffffff`     |
| Primary        | `#00d4ff`     | `#0284c7`     |
| Secondary      | `#7c3aed`     | `#6d28d9`     |
| Text           | `#e2e8f0`     | `#1e293b`     |
| Muted          | `#94a3b8`     | `#64748b`     |

### Typography

- **Headings:** Space Grotesk (geometric, techy)
- **Body:** Inter (clean readability)
- **Code:** JetBrains Mono

### Interactive Elements

- **Hero:** Three.js displacement shader — fluid distortion effect reacting to mouse movement (like Hamish Williams). Static gradient fallback on mobile to save performance.
- **Scroll animations (GSAP):** Section headings slide up and fade in. Project cards stagger in on scroll. Experience timeline items reveal sequentially. Skills grid items scale up. Text paragraphs reveal line-by-line.
- **Page transitions:** Astro View Transitions API for smooth cross-page navigation
- **Card hover:** Lift + subtle cyan glow border (CSS + GSAP)
- **Terminal-style hero tagline:** `> Senior ML Engineer_` with blinking cursor CSS animation

## Page Designs

### Home (`index.astro`)
1. **Hero** — full viewport, displacement shader background, name, animated terminal tagline, CTA buttons, social links
2. **About snippet** — brief intro with photo, GSAP fade-in on scroll
3. **Featured projects** — 3-4 highlighted cards, GSAP stagger reveal
4. **Latest blog posts** — 2-3 recent posts, GSAP fade-in

### Projects (`projects/index.astro`)
- Filterable grid of project cards with GSAP stagger animations
- Each card: thumbnail, title, tech tags, one-line description
- Click navigates to `projects/[slug]` detail page

### Experience (`experience.astro`)
- Vertical timeline with company logos, GSAP sequential reveal
- Each entry: role, company, date range, key achievements as bullet points
- Content from current experience HTML modals converted to MDX

### About (`about.astro`)
- Extended bio with photo
- Skills grid grouped by category (ML/AI, Languages, Cloud/MLOps, Tools) with devicon icons
- Education
- Download resume button
- Contact form (Formspree) with name, email, message fields
- Social links

### Blog (`blog/index.astro`)
- Post cards with cover image, title, date, tags, reading time
- Tag filter and text search
- RSS feed link
- Build infrastructure now with 1 placeholder post; real content added later

### Blog Post (`blog/[...slug].astro`)
- MDX rendered with syntax highlighting (Shiki)
- Table of contents (auto-generated from headings)
- Reading time
- Previous/next post navigation

## Data Migration

| Current Source | Target |
|---|---|
| `content.json` → `home` | Hero props in `index.astro` frontmatter |
| `content.json` → `experience` | `src/content/experience/*.mdx` with frontmatter |
| `content.json` → `skills` | Data array in `src/data/skills.ts` |
| `content.json` → `contact` | Props in `ContactForm.astro` + `about.astro` |
| `projects.json` | `src/content/projects/*.mdx` with frontmatter |
| `experience/*.html` modals | Content manually converted into experience MDX files |
| `src/img/*` | `src/assets/` (only images referenced by new site) |
| Resume PDF | `public/Uday_Lunawat_Resume.pdf` |

## URL Migration

Current site uses hash routes (`#about`, `#projects`). New site uses real paths (`/about`, `/projects`). Hash routes are client-side only (never sent to server), so no server-side redirects needed. The 404 page guides lost visitors.

## Deployment

- **Output:** Static (Astro default)
- **CI/CD:** GitHub Actions workflow — push to `master`, build, deploy to `gh-pages` via `withastro/action@v3`
- **Custom domain:** CNAME file in `public/` (if applicable)
- **Branch strategy:** Build on `feat/astro-migration` branch, merge to `master` when complete
- **Rollback:** Current site preserved on `master` until migration branch is merged

## NPM Scripts

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check && tsc --noEmit",
  "format": "prettier --write ."
}
```

## SEO & Performance

- `@astrojs/sitemap` for auto-generated sitemap
- RSS feed via `@astrojs/rss`
- Open Graph + Twitter card meta tags in `BaseLayout.astro`
- Astro `<Image>` component for auto WebP/AVIF optimization
- View Transitions API for SPA-like navigation
- Link prefetching enabled
- GSAP loaded only on pages that need it (tree-shaken)
- Three.js loaded only on home page via `client:idle` island
- Target: Lighthouse 95+ all categories

## Accessibility

- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)
- Dark/light mode toggle respecting `prefers-color-scheme`
- Skip-to-content link
- Focus-visible outlines
- Keyboard navigable menus
- `prefers-reduced-motion` disables GSAP animations and shader effects

## Implementation Phases

1. **Scaffold** — `npm create astro`, install deps (Tailwind, MDX, sitemap, React, Three.js, GSAP)
2. **Layout & Nav** — `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, theme toggle, global styles
3. **Content migration** — Convert `content.json`, `projects.json`, and experience HTML into content collections
4. **Home page** — Hero with displacement shader island, about snippet, featured projects, latest posts
5. **Inner pages** — About (skills + contact form), experience (timeline), projects (grid + detail pages)
6. **GSAP scroll animations** — ScrollTrigger setup for all sections across all pages
7. **Blog** — Blog layout, listing page, placeholder post, RSS feed
8. **Polish** — View transitions, OG images, favicon, `prefers-reduced-motion` fallbacks
9. **Deploy** — GitHub Actions workflow, test deployment on `feat/astro-migration` branch
10. **Cleanup** — Remove old vanilla JS files after successful deployment and merge

## Verification Plan

1. `npm run dev` — local dev server works, all pages render
2. `npm run build` — static output generates successfully
3. `npm run check` — TypeScript and Astro checks pass
4. Lighthouse audit on built site (`npm run preview`)
5. Verify all content from current site is present
6. Test dark/light theme toggle
7. Test responsive design at 320px, 768px, 1280px
8. Verify displacement shader hero renders and responds to mouse
9. Verify GSAP scroll animations trigger correctly
10. Test `prefers-reduced-motion` disables animations
11. Verify blog post rendering with MDX + code blocks
12. Test contact form submission (Formspree)
13. Test GitHub Pages deployment via Actions
