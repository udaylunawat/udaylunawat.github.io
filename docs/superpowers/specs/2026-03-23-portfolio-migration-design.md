# Portfolio Migration: Vanilla JS to Astro + Tailwind

## Context

The current site is a vanilla JavaScript single-page portfolio (~5K lines of CSS, ~3.8K lines of JS) with no build system, no component model, and no blog support. The goal is to migrate to a modern framework for better developer experience, performance, SEO, and a fresh visual design suited to an AI/ML engineering profile. The site deploys to GitHub Pages.

## Tech Stack

- **Astro 5** — static site generator, content collections, zero JS by default
- **Tailwind v4** — utility-first CSS
- **TypeScript** — type safety
- **MDX** — blog posts with embedded components
- **Three.js** — neural network hero animation (Astro island, `client:visible`)
- **Shiki** — syntax highlighting in blog posts

## Project Structure

```
/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro        # HTML shell, meta, fonts, theme toggle
│   │   └── BlogLayout.astro        # Blog post wrapper with ToC, reading time
│   ├── pages/
│   │   ├── index.astro             # Hero + about + featured projects
│   │   ├── projects.astro          # All projects grid with tag filters
│   │   ├── experience.astro        # Vertical timeline
│   │   ├── about.astro             # Extended bio + skills grid
│   │   ├── blog/
│   │   │   ├── index.astro         # Blog listing with tag filter + search
│   │   │   └── [...slug].astro     # Dynamic blog post pages
│   │   └── 404.astro
│   ├── components/
│   │   ├── Hero.astro              # Full-viewport hero with neural bg
│   │   ├── NeuralBackground.astro  # Three.js island (client:visible)
│   │   ├── ProjectCard.astro       # Card with image, tags, description
│   │   ├── ExperienceTimeline.astro
│   │   ├── SkillsGrid.astro        # Grouped by category
│   │   ├── BlogPostCard.astro
│   │   ├── TagFilter.astro
│   │   ├── ThemeToggle.astro       # Dark/light with system detection
│   │   ├── Nav.astro               # Responsive nav with mobile menu
│   │   └── Footer.astro
│   ├── content/
│   │   ├── config.ts              # Content collection schemas (Zod)
│   │   ├── blog/                  # MDX blog posts
│   │   ├── projects/              # Project entries (MDX with frontmatter)
│   │   └── experience/            # Experience entries (MDX with frontmatter)
│   ├── styles/
│   │   └── global.css             # Tailwind directives + custom utilities
│   └── assets/                    # Images, resume PDF, logos
├── public/                        # Favicons, OG images, CNAME
└── package.json
```

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

- Three.js neural network particle animation on hero (subtle, performant)
- Card hover: lift + cyan glow border
- Astro View Transitions for smooth page navigation
- Scroll-triggered fade-in animations (CSS `@keyframes` + Intersection Observer, no JS library)
- Terminal-style hero tagline: `> Senior ML Engineer_` with blinking cursor

## Page Designs

### Home (`index.astro`)
1. **Hero** — full viewport, neural background, name, animated title, CTA buttons, social links
2. **About snippet** — brief intro paragraph with photo
3. **Featured projects** — 3-4 highlighted project cards
4. **Latest blog posts** — 2-3 recent posts

### Projects (`projects.astro`)
- Filterable grid of project cards
- Each card: thumbnail, title, tech tags, one-line description
- Click navigates to full project detail page (generated from content collection)

### Experience (`experience.astro`)
- Vertical timeline with company logos
- Each entry: role, company, date range, key achievements as bullet points

### About (`about.astro`)
- Extended bio
- Skills grid grouped by category (ML/AI, Languages, Cloud/MLOps, Tools)
- Education
- Download resume link

### Blog (`blog/index.astro`)
- Post cards with cover image, title, date, tags, reading time
- Tag filter and text search
- RSS feed link

### Blog Post (`blog/[...slug].astro`)
- MDX rendered with syntax highlighting (Shiki)
- Table of contents (auto-generated from headings)
- Reading time
- Previous/next post navigation
- Share links

## Data Migration

| Current Source | Target |
|---|---|
| `content.json` (experience) | `src/content/experience/*.mdx` files with frontmatter |
| `content.json` (skills) | `src/content/config.ts` or `about.astro` data |
| `projects.json` | `src/content/projects/*.mdx` files with frontmatter |
| `experience/*.html` modals | Content absorbed into experience MDX entries |
| `src/img/*` | `src/assets/` (Astro image optimization) |
| Resume PDF | `public/` or `src/assets/` |

## Deployment

- **Output:** Static (Astro default)
- **CI/CD:** GitHub Actions workflow
  - Trigger: push to `master`
  - Steps: checkout, install, build, deploy to `gh-pages` branch
  - Use `withastro/action@v3` official action
- **Custom domain:** CNAME file in `public/`

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

## Verification Plan

1. `npm run dev` — local dev server works, all pages render
2. `npm run build` — static output generates successfully
3. Lighthouse audit on built site (serve with `npx serve dist/`)
4. Verify all content from current site is present in new site
5. Test dark/light theme toggle
6. Test responsive design at 320px, 768px, 1280px
7. Verify blog post rendering with MDX + code blocks
8. Test GitHub Pages deployment via Actions
