# tharshan.ai

Source for [tharshan.ai](https://tharshan.ai): research, writing and videos by Tharshan.

Built with [Astro](https://astro.build) (static site, TypeScript, Markdown/MDX) and hosted on Cloudflare Pages. There is no CMS: **this repository is the CMS.** Add or edit a Markdown file, push to `main`, and the site rebuilds and deploys itself.

---

## 1. Run the site locally

You need [Node.js](https://nodejs.org) 22.12 or newer.

```bash
npm install      # first time only
npm run dev      # starts the site at http://localhost:4321
```

The page reloads as you edit files. Drafts (`draft: true`) are visible locally but never published.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Builds, then serves it locally the way Cloudflare Pages will |
| `npm run check` | Checks types and content frontmatter for errors |

## 2. How the site is organised

The site is organised by **subject**, not by format. There are three subjects, and these exact values are the only ones allowed:

| Value | Page |
| --- | --- |
| `ai-economics` | /ai-economics |
| `ai-infrastructure` | /ai-infrastructure |
| `human-wrapped-ai` | /human-wrapped-ai |

Every article and every video has one primary `topic:` and optional `related:` topics. It appears on each of those topic pages automatically, but it only ever has one URL. Topic titles, intros and the homepage descriptors live in `src/lib/topics.ts`.

/research is for formal, academic research only. /writing and /videos still exist as plain archive pages, but they aren't in the navigation.

## 3. Add a new article

1. Copy `src/content/writing/_TEMPLATE.md` (blank) or `src/content/writing/example-article.mdx` (every formatting option, with explanations).
2. Rename it. **The file name becomes the URL**: `why-ai-costs-surprise-cfos.md` → `tharshan.ai/writing/why-ai-costs-surprise-cfos`.
3. Fill in the frontmatter:

   | Field | Required | Notes |
   | --- | --- | --- |
   | `title` | yes | |
   | `description` | yes | 1–2 sentences. Used in lists, Google and LinkedIn previews |
   | `date` | yes | `2026-10-01` |
   | `topic` | yes | `ai-economics`, `ai-infrastructure` or `human-wrapped-ai` |
   | `related` | no | extra topics, e.g. `[ai-infrastructure]` |
   | `format` | yes | `essay`, `note`, `analysis`, `research note` or `experiment` |
   | `draft` | no | `true` keeps it off the live site |
   | `featured`, `updated`, `slug`, `hero`, `references`, `tags`, `originallyPublished` | no | see the example article |

4. Write in Markdown below the frontmatter. Headings, quotes, lists, links, tables, footnotes (`[^1]`), images and code blocks all work.
5. Set `draft: false`, commit. It appears on its topic page(s), the writing archive, RSS and the sitemap, with its own share image.

Use `.mdx` instead of `.md` only if you want components such as `<Callout>`, `<YouTube>` or `<LinkedInEmbed>`.

## 4. Add a video

1. Copy `src/content/videos/_TEMPLATE.md` and rename it (e.g. `why-ai-adoption-hurts-margin.md`).
2. Fill in:

   ```yaml
   title: "Why AI adoption can hurt gross margin"
   description: "One or two sentences on what the video covers."
   date: 2026-10-01
   platform: "LinkedIn"            # LinkedIn | YouTube | TikTok
   url: "https://www.linkedin.com/feed/update/urn:li:activity:…/"
   topic: ai-economics
   related: [human-wrapped-ai]     # optional
   duration: "1:30"                # optional
   ```

   For LinkedIn, use **Copy link to post**, then open it and copy the address that contains `urn:li:activity:`.
3. Commit. That's it.

**What happens automatically:**

- The video appears on every topic page in `topic` and `related`, sorted newest first.
- On each topic page, **the newest video by `date` is featured at the top**, as an editorial preview with "watch on linkedin ↗". Nothing from LinkedIn loads on the site. (Inline play for LinkedIn is switched off because LinkedIn's embed renders as a white post card. See `LINKEDIN_INLINE_PLAY` in `src/lib/topics.ts`.)
- The featured video isn't repeated in the list below it.
- If a topic has no videos, the feature is simply left out.
- With no `thumbnail`, a typographic title tile is shown. To use a still, put an image next to the file and add `thumbnail: "./images/still.jpg"` and `thumbnailAlt`.
- YouTube: add `embedUrl: "https://www.youtube-nocookie.com/embed/VIDEO_ID"` and the featured video gets a "▶ play" button, which loads the player only when clicked.

## 5. Add research

1. Copy `src/content/research/_TEMPLATE.md` and rename it (file name = URL under `/research/`).
2. Fill in **only verified** publication details: authors, venue, year, DOI, citation.
3. Only set `pdf:` if you have the right to distribute that version. Put the file in `public/papers/`.

The Finance Research Letters paper (`female-representation-boards-carbon-emissions.mdx`) is the reference example. Its link from the Human-Wrapped AI page is written by hand in `src/pages/[topic].astro`, because it's framed as intellectual lineage, not as evidence about AI.

## 6. How deployment works

- The site is hosted on **Cloudflare Pages** (project `tharshan-ai`), connected to this GitHub repository.
- Every push to `main` → Cloudflare runs `npm run build` (Node 22) and publishes `dist/` to **https://tharshan.ai**. Usually under a minute.
- Pushes to any other branch get a **preview deployment** at `<branch>.tharshan-ai.pages.dev`, without touching the live site.
- `www.tharshan.ai` permanently redirects (301) to `https://tharshan.ai` via a Cloudflare Redirect Rule; all `http://` requests are upgraded to HTTPS.
- Cloudflare Web Analytics (cookie-free, no banner needed) is enabled in the Cloudflare dashboard, not in this code.
- Caching and security headers are set in `public/_headers`.

If a build fails (usually a typo in frontmatter), the live site stays on the previous version. The error is shown in Cloudflare → Workers & Pages → tharshan-ai → Deployments. Run `npm run check` locally to see the same error.

## 7. Update navigation and basic site information

Name, homepage title, default description, the Contact (LinkedIn) link and the navigation menu live in **`src/site.config.ts`**. Topic titles and intros live in **`src/lib/topics.ts`**. Change a value, commit, done.

Homepage wording is in `src/pages/index.astro`; topic pages are generated by `src/pages/[topic].astro`; the About page is `src/pages/about.astro` (linked from the footer).

---

## Project structure

```
src/
  content/
    writing/       ← articles (.md / .mdx), each tagged with topic(s)
    research/      ← formal research papers
    videos/        ← video entries, each tagged with topic(s)
  content.config.ts  ← the fields each content type accepts
  site.config.ts     ← name, links, navigation
  pages/           ← one file per route ([topic].astro builds the three topic pages)
  lib/topics.ts    ← the three subjects, their intros, and the latest-video logic
  layouts/         ← Base (head, SEO, header, footer) and Article
  components/      ← small reusable pieces (lists, callouts, citation, embeds)
  styles/global.css  ← the design system (colours, type, spacing)
public/            ← files served as-is (favicon, _headers)
DESIGN.md          ← why the site looks the way it does
```

Design decisions are documented in [`DESIGN.md`](DESIGN.md).
