# Design notes: "Terminal Editorial"

An independent editorial and research notebook with subtle old-computer DNA.
The principle: **the work is the brand.** Text is the primary visual material;
the computer influence comes from typography and small interface details and should be
noticed on a second look, not the first.

## Colour

Dark by default. A matching light palette is used automatically when the reader's device
is set to light mode (`prefers-color-scheme`). All tokens live at the top of
`src/styles/global.css`.

| Token | Dark | Light | Use | Contrast (dark / light) |
| --- | --- | --- | --- | --- |
| `--bg` | `#0d0f10` | `#f3f0e8` | page | |
| `--bg-2` | `#15181a` | `#e9e5da` | callouts, code | |
| `--text` | `#e8e3d9` | `#1a1c1d` | headings, primary | 15.0 / 15.0 |
| `--prose` | `#ddd8ce` | `#26292a` | long-form body (slightly softer to avoid glare) | 13.5 / 12.9 |
| `--muted` | `#a8a39a` | `#55534e` | decks, secondary | 7.7 / 6.7 |
| `--faint` | `#8a857c` | `#67645d` | metadata | 5.2 / 5.2 |
| `--rule` | `#2a2f32` | `#d6d1c5` | hairlines | decorative |
| `--accent` | `#8fbf8f` | `#336b3a` | the signal: links, markers, active states | 9.2 / 5.6 |
| `--accent-2` | `#a7d7a7` | `#24522a` | hover | 11.8 / 8.0 |

**Green is a signal, never a surface.** It is used for link underlines, section numbers,
the active nav bracket, category labels, footnote markers and hover states. Body text is
never green, and no element has a green background.

## Typography

Two voices from one family, so the pairing looks deliberate:

- **IBM Plex Serif** (400, 400 italic, 500, 600): thesis, titles, decks, all prose.
  Body is ~19px with a 1.72 line height and a 40rem (~68 character) measure.
- **IBM Plex Mono** (400, 500): wordmark, navigation, dates, categories, section markers,
  metadata, tables, footnote markers, labels, footer.

Mono text is lowercase by convention. Fonts are self-hosted and the two main files are preloaded.

## Old-computer details (the complete list; resist adding more)

- Wordmark `tharshan.ai_` with a static green underscore. It never blinks.
- Navigation brackets `[ writing ]` appear on the current page and on hover.
- Dotted ISO dates: `2026.09.30`.
- Numbered section markers: `01 / writing ─────── all →`.
- `§ 1` above article section headings; `//` before small labels.
- `>` marker slides in beside list titles and contents entries on hover.
- A block cursor appears after `read →` on hover.
- **Inverse-video** keyboard focus and text selection (light on dark, dark on light).
- Footnote references as `[1]`; articles end with `■ end`.

Explicitly out of scope: typing animations, boot sequences, prompts, glow, scanlines,
CRT effects, pixel fonts, ASCII art.

## Layout

- Wide container (74rem) with a 10rem mono metadata column on the left at desktop widths.
  Content sits in the right column, so the page reads as annotation + text.
- Ruled rows, not cards. The only boxed elements are callouts and code.
- The homepage leads with a thesis and writing. The biography comes last and stays small.
- Mobile is designed separately: the metadata column stacks above the content, the
  navigation wraps under the wordmark (no hamburger), tables scroll sideways, and type
  sizes are fluid.

## Articles

- A sticky mono contents list in the left column (desktop), built from `##` headings.
- Margin footnotes (sidenotes) on wide screens (≥84rem): a small script copies each
  footnote beside the paragraph that cites it. On smaller screens, in print and without
  JavaScript, footnotes stay as a list at the end.
- Blockquotes: italic serif with a single green hairline; citation in mono.
- Callouts: `// note` label; the `view` variant marks the author's own interpretation.

## Motion

Only ~120ms colour and opacity transitions. `prefers-reduced-motion` disables them.
There is no scroll-linked motion or loading animation. Page JavaScript is limited to the citation
copy button and the sidenotes script.

## Components

`Header`, `Footer`, `SectionHead` (numbered marker), `FeaturedWriting`, `WritingItem`,
`ResearchItem` (with optional mono spec block), `VideoItem`, `Callout`, `Citation`,
`Abstract`, `Figure`, `YouTube`, `TikTok`, `LinkedInEmbed`. Social share cards are
generated at build time by `src/lib/og.ts` in the same identity.
