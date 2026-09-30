# Design notes

The principle: **the work is the brand.** The design should get out of the way of research, writing and evidence.

## Identity

- **Wordmark:** "Tharshan.ai" set in the text serif, with ".ai" in a muted tone. No logo mark, no photography required.
- **Two surfaces.** A near-black *ink* masthead carries identity (header, homepage introduction, share cards, video tiles). A warm *paper* surface carries everything that is read. Long-form text is never set light-on-dark.
- **One accent.** Oxide (`#9c3d1c` on paper, `#e0886a` on ink) marks interaction and small signals: link hover, focus rings, category labels, the "my view" callout. It is never used for large areas.

## Typography

- **Newsreader** (variable, with optical sizing) for headings and body. It was designed for on-screen reading and adjusts its letterforms between display and text sizes, so one family covers both.
- **Inter** for small UI text only: navigation, labels, metadata, tables.
- Body text is ~18–20px with a ~68-character measure (`--measure: 40rem`) and 1.65 line height.
- Fonts are self-hosted (no Google Fonts request) and the main serif file is preloaded.

## Layout

- Left-aligned editorial column, not centred cards. Lists are ruled rows (date/type on the left, title and deck on the right) rather than boxes.
- Section headings are small uppercase labels under a hairline rule, like a magazine contents page.
- Mobile is designed rather than shrunk: the navigation wraps to a second row (no hamburger menu for five links), list rows stack, tables scroll sideways, and the type scale is fluid (`clamp()`).

## Restraint

- No animation beyond ~120ms colour transitions; `prefers-reduced-motion` disables them.
- JavaScript on the page: about 1 KB, only to power the citation "Copy" button.
- No third-party scripts. Analytics is Cloudflare Web Analytics, injected at the edge, cookie-free.
- Video thumbnails are typographic tiles by default, which avoids hotlinking or scraping platform images.

## Tokens

All colours, sizes and spacing are CSS custom properties at the top of `src/styles/global.css`. Change them there, not in individual components.

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#131211` | masthead, primary text |
| `--paper` | `#f6f3ed` | reading surface |
| `--text-muted` | `#5f5b54` | decks, secondary text (6.1:1) |
| `--text-faint` | `#6e6961` | metadata (4.9:1) |
| `--rule` | `#dcd6cb` | hairlines |
| `--accent` | `#9c3d1c` | hover, focus, labels (6.1:1) |

## Components

`Header`, `Footer`, `SectionHead`, `WritingItem`, `ResearchItem`, `VideoItem`, `Callout` (default and `view`), `Citation`, `Abstract`, `Figure`, `YouTube`, `TikTok`, `LinkedInEmbed`. Social share cards are generated at build time by `src/lib/og.ts`.
