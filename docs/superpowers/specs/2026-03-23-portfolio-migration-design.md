# Portfolio Migration: Vanilla JS to Astro + Tailwind

## Context

The current site is a vanilla JavaScript single-page portfolio (~5K lines of CSS, ~3.8K lines of JS) with no build system, no component model, and no blog support. The goal is to migrate to a modern framework for better developer experience, performance, SEO, and a fresh visual design suited to an AI/ML engineering profile. The site deploys to GitHub Pages.

## Tech Stack

- **Astro 5** — static site generator, content collections, zero JS by default
- **Tailwind v4** — utility-first CSS (CSS-based config via `@theme`, no JS config file)
- **TypeScript** — type safety
- **MDX** — blog posts with embedded components
- **Three.js** — neural network hero animation (Astro island, `client:idle` with static fallback on mobile)
- **Shiki** — syntax highlighting in blog posts (built into Astro)

## Project Structure

```
/
├── astro.config.mjs
├── tsconfig.json
├── src/
│   ├── content.config.ts            # Content collection schemas (Zod) — Astro 5 location
│   ├── layouts/
│   │   ├── BaseLayout.astro          # HTML shell, meta, fonts, theme toggle
│   │   └── BlogLayout.astro          # Blog post wrapper with ToC, reading time
│   ├── pages/
│   │   ├── index.astro               # Hero + about + featured projects + latest posts
│   │   ├── projects/
│   │   │   ├── index.astro           # All projects grid with tag filters
│   │   │   └── [...slug].astro       # Individual project detail pages
│   │   ├── experience.astro          # Vertical timeline
│   │   ├── about.astro               # Extended bio + skills grid + contact
│   │   ├── blog/
│   │   │   ├── index.astro           # Blog listing with tag filter + search
│   │   │   └── [...slug].astro       # Dynamic blog post pages
│   │   ├── rss.xml.ts                # RSS feed endpoint
│   │   └── 404.astro
│   ├── components/
│   │   ├── Hero.astro                # Full-viewport hero with neural bg
│   │   ├── NeuralBackground.tsx      # Three.js island (client:idle), React for Three.js ergonomics
│   │   ├── ProjectCard.astro
│   │   ├── ExperienceTimeline.astro
│   │   ├── SkillsGrid.astro          # Grouped by category with devicon icons
│   │   ├── ContactForm.astro         # Formspree integration
│   │   ├── BlogPostCard.astro
│   │   ├── TagFilter.astro
│   │   ├── ThemeToggle.astro         # Dark/light with system detection
│   │   ├── Nav.astro                 # Responsive nav with mobile menu
│   │   └── Footer.astro              # Social links, copyright
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
| particles.js control panel | **Drop** | Over-engineered for a portfolio; neural background replaces it |
| Three.js shader background | **Replace** with neural network particle animation | Cleaner, more on-brand for AI/ML |
| Matrix rain effect | **Drop** | Doesn't fit the new clean aesthetic |
| 3D brain visualization (`brainSkills.deep.js`) | **Drop** | Replace with a clean skills grid |
| TagCloud.js 3D skills sphere | **Drop** | Replace with categorized grid + devicon icons |
| vanilla-tilt card effects | **Drop** | CSS hover effects are sufficient |
| Boot-sequence loader | **Drop** | Astro's static pages load fast enough; no loader needed |
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

### Typography (intentional change from current Montserrat/Oswald/Roboto Mono)

- **Headings:** Space Grotesk (geometric, techy)
- **Body:** Inter (clean readability)
- **Code:** JetBrains Mono

### Interactive Elements

- Three.js neural network particle animation on hero (subtle, `client:idle`, static gradient fallback on mobile)
- Card hover: lift + cyan glow border (CSS only)
- Astro View Transitions for smooth page navigation
- Scroll-triggered fade-in animations (CSS `@keyframes` + Intersection Observer, no JS library)
- Terminal-style hero tagline: `> Senior ML Engineer_` with blinking cursor

## Page Designs

### Home (`index.astro`)
1. **Hero** — full viewport, neural background, name, animated title, CTA buttons, social links (GitHub, LinkedIn, Twitter/X)
2. **About snippet** — brief intro paragraph with photo
3. **Featured projects** — 3-4 highlighted project cards
4. **Latest blog posts** — 2-3 recent posts

### Projects (`projects/index.astro`)
- Filterable grid of project cards
- Each card: thumbnail, title, tech tags, one-line description
- Click navigates to `projects/[slug]` detail page

### Experience (`experience.astro`)
- Vertical timeline with company logos
- Each entry: role, company, date range, key achievements as bullet points
- Content from current experience HTML modals converted to MDX (manual conversion, preserve key bullet points and descriptions)

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
- **Note:** Build blog infrastructure now with 1 placeholder post; real content added later

### Blog Post (`blog/[...slug].astro`)
- MDX rendered with syntax highlighting (Shiki)
- Table of contents (auto-generated from headings)
- Reading time
- Previous/next post navigation

## Data Migration

| Current Source | Target |
|---|---|
| `content.json` → `home` | Hero props in `index.astro` frontmatter |
| `content.json` → `experience` | `src/content/experience/*.mdx` with frontmatter (company, role, dates, logo, highlights) |
| `content.json` → `skills` | Data array in `about.astro` or `src/data/skills.ts` |
| `content.json` → `contact` | Props in `ContactForm.astro` + `about.astro` frontmatter |
| `projects.json` | `src/content/projects/*.mdx` with frontmatter (title, description, tags, image, links) |
| `experience/*.html` modals | Content manually converted into the body of each experience MDX file |
| `src/img/*` | `src/assets/` (only images referenced by new site; unused ones dropped) |
| Resume PDF | `public/Uday_Lunawat_Resume.pdf` |

## URL Migration

The current site is a SPA with hash routes (`#about`, `#projects`, `#experience`). The new site uses real paths (`/about`, `/projects`, `/experience`). Since hash routes are client-side only (never sent to server), there are no server-side redirects needed. The 404 page will guide lost visitors.

## Deployment

- **Output:** Static (Astro default)
- **CI/CD:** GitHub Actions workflow
  - Trigger: push to `master`
  - Steps: checkout, install, build, deploy to `gh-pages` branch
  - Use `withastro/action@v3` official action
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
- `<Image>` component for auto WebP/AVIF optimization
- View Transitions API for SPA-like navigation
- Link prefetching enabled
- Target: Lighthouse 95+ all categories

## Accessibility

- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)
- Dark/light mode toggle respecting `prefers-color-scheme`
- Skip-to-content link
- Focus-visible outlines
- Keyboard navigable menus and interactive elements

## Implementation Phases

1. **Scaffold** — `npm create astro`, install dependencies (Tailwind, MDX, sitemap, React for Three.js island)
2. **Layout & Nav** — `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, theme toggle, global styles
3. **Content migration** — Convert `content.json`, `projects.json`, and experience HTML into content collections
4. **Pages** — Build pages in order: home (hero), about (skills + contact), experience, projects
5. **Blog** — Blog layout, listing page, placeholder post, RSS feed
6. **Interactive** — Three.js neural background island with mobile fallback
7. **Polish** — View transitions, scroll animations, OG images, favicon
8. **Deploy** — GitHub Actions workflow, test deployment
9. **Cleanup** — Remove old vanilla JS files after successful deployment

## Verification Plan

1. `npm run dev` — local dev server works, all pages render
2. `npm run build` — static output generates successfully
3. `npm run check` — TypeScript and Astro checks pass
4. Lighthouse audit on built site (`npm run preview`)
5. Verify all content from current site is present in new site
6. Test dark/light theme toggle
7. Test responsive design at 320px, 768px, 1280px
8. Verify blog post rendering with MDX + code blocks
9. Test contact form submission (Formspree)
10. Test GitHub Pages deployment via Actions
