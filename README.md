# tharshan.ai

Source for [tharshan.ai](https://tharshan.ai): research, writing and videos by Tharshan.

Built with [Astro](https://astro.build) (static site, TypeScript, Markdown/MDX) and hosted on Cloudflare Workers. There is no CMS: **this repository is the CMS.** Add or edit a Markdown file, push to `main`, and the site rebuilds and deploys itself.

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
| `npm run preview` | Builds, then serves it exactly as Cloudflare will |
| `npm run check` | Checks types and content frontmatter for errors |

## 2. Add a new article

1. Copy `src/content/writing/_TEMPLATE.md` (blank) or `src/content/writing/example-article.mdx` (every formatting option, with explanations).
2. Rename it. **The file name becomes the URL**: `why-ai-costs-surprise-cfos.md` → `tharshan.ai/writing/why-ai-costs-surprise-cfos`.
3. Fill in the frontmatter (the block between the `---` lines):

   | Field | Required | Notes |
   | --- | --- | --- |
   | `title` | yes | |
   | `description` | yes | 1–2 sentences. Used in lists, Google and LinkedIn previews |
   | `date` | yes | `2026-10-01` |
   | `category` | yes | `Essay`, `Research note`, `Analysis`, `Notes` or `Experiment` |
   | `tags` | no | `['AI economics', 'Compute']` |
   | `featured` | no | `true` pins it to the top of the homepage |
   | `draft` | no | `true` keeps it off the live site |
   | `updated` | no | Date of a material revision |
   | `slug` | no | Override the URL |
   | `hero` | no | `src`, `alt`, `caption` for a top image |
   | `references` | no | List of `title` / `url` / `note` shown at the end |
   | `originallyPublished` | no | For pieces migrated from LinkedIn or AI Experimenter |

4. Write in Markdown below the frontmatter. Headings, quotes, lists, links, tables, footnotes (`[^1]`), images and code blocks all work.
5. Set `draft: false`, commit and push. The article appears on the homepage, `/writing`, the RSS feed and the sitemap, and gets its own share image, all automatically.

Use `.mdx` instead of `.md` only if you want components such as `<Callout>`, `<YouTube>`, `<LinkedInEmbed>` or `<TikTok>` (see the example article for the import lines).

Images: put them in `src/content/writing/images/` and reference them as `![Alt text](./images/file.jpg)`. They are resized and compressed automatically.

## 3. Add research

1. Copy `src/content/research/_TEMPLATE.md` and rename it (file name = URL under `/research/`).
2. Fill in **only verified** publication details: authors, venue, year, DOI, citation.
3. Only set `pdf:` if you have the right to distribute that version (e.g. an open-access paper, or an accepted manuscript your publisher allows you to post). Put the file in `public/papers/`.
4. Write the plain-English sections below the frontmatter.

The Finance Research Letters paper (`female-representation-boards-carbon-emissions.mdx`) is the reference example. It uses `.mdx` so it can place the official abstract with `<Abstract />`.

## 4. Add a video

Videos stay on LinkedIn / YouTube / TikTok; the site lists and links to them.

1. Copy `src/content/videos/_TEMPLATE.md` and rename it.
2. Set `title`, `description`, `date`, `platform` (`LinkedIn`, `YouTube` or `TikTok`) and `url`. For LinkedIn, copy the post link ("Copy link to post").
3. Optional: `duration`, a `thumbnail` image, `embedId` for YouTube/TikTok.

Without a thumbnail, the site draws a clean typographic tile.

## 5. How deployment works

- The site is a Cloudflare **Worker with static assets** (`wrangler.jsonc`), connected to this GitHub repository through **Cloudflare Workers Builds**.
- Every push to `main` → Cloudflare runs `npm run build` and deploys `dist/` to **https://tharshan.ai**. Takes about a minute.
- Pushes to any other branch create a **preview deployment** with its own URL (shown on the commit in GitHub and in the Cloudflare dashboard), without touching the live site.
- `www.tharshan.ai` permanently redirects to `https://tharshan.ai` (a Cloudflare Redirect Rule).
- Cloudflare Web Analytics (cookie-free, no banner needed) is enabled in the Cloudflare dashboard, not in this code.

If a build fails (usually a typo in frontmatter), the live site stays on the previous version. The error is shown in Cloudflare → Workers & Pages → tharshan-ai → Deployments. Run `npm run check` locally to see the same error.

## 6. Update navigation and basic site information

Everything lives in **`src/site.config.ts`**: name, full name, default description, footer line, LinkedIn URL and the navigation menu. Change a value, push, done.

Homepage wording is in `src/pages/index.astro`; the About page is `src/pages/about.astro`.

---

## Project structure

```
src/
  content/
    writing/       ← articles (.md / .mdx)
    research/      ← papers
    videos/        ← video entries
  content.config.ts  ← the fields each content type accepts
  site.config.ts     ← name, links, navigation
  pages/           ← one file per route (/, /writing, /research, /videos, /about, RSS, OG images)
  layouts/         ← Base (head, SEO, header, footer) and Article
  components/      ← small reusable pieces (lists, callouts, citation, embeds)
  styles/global.css  ← the design system (colours, type, spacing)
public/            ← files served as-is (favicon, _headers)
DESIGN.md          ← why the site looks the way it does
```

Design decisions are documented in [`DESIGN.md`](DESIGN.md).
