# Design notes

**tharshan.ai is a human editorial archive viewed through a quiet machine interface.**

The interface observes and classifies; the writing argues. The interface should never compete with the ideas, and it gets quieter once a reader is inside an article.

Imagery (subject images, covers, video artwork, share images, historical media) is documented separately in [`docs/visual-system.md`](docs/visual-system.md).

## Two voices

- **IBM Plex Mono is the system:** navigation, dates, record identifiers, taxonomy, format, status, labels, metadata.
- **IBM Plex Serif is the human:** titles, decks, arguments, prose. On the Human-Wrapped AI page the seven conditions are set in serif and their indices in mono, so the system and the human sit side by side.

Body text is about 19px with a 1.72 line height and a 40rem (~68 character) measure. Mono is lowercase in running metadata and uppercase only for small system labels. Fonts are self-hosted and the two main files are preloaded. The whole site is never set in mono.

## Colour

Dark is the default for every first-time visitor; the `dark / light` control switches theme and remembers the choice (`localStorage`, applied before first paint). Tokens are at the top of `src/styles/global.css`.

| Token | Dark (observer) | Light (clinical) | Use |
| --- | --- | --- | --- |
| `--bg` | `#0d0f10` | `#f4f4f1` | page |
| `--bg-2` | `#15181a` | `#eaeae6` | raised: record cards, callouts, code |
| `--text` | `#e8e3d9` | `#121415` | headings, primary text |
| `--prose` | `#ddd8ce` | `#1d2021` | long-form body |
| `--muted` | `#a8a39a` | `#4c4f50` | decks, secondary text |
| `--faint` | `#8a857c` | `#5f6263` | metadata (≥ 5:1 in both themes) |
| `--rule` / `--rule-2` | `#2a2f32` / `#3a4044` | `#d8d9d5` / `#b9bbb7` | hairlines, inactive corners |
| `--accent` | `#8fbf8f` | `#2e6a3a` | **the signal** |

**Green is a signal, never a surface.** It marks what is selected or current: the active navigation item, the acquisition bracket, the subject index, record links, hover. Body text is never green, and nothing has a green background. State never depends on colour alone: the active nav item is also framed by corner marks, and rows gain corners on hover and focus.

Light mode is the same publication, slightly more austere: cooler off-white, near-black ink, crisper rules. The subject images stay dark in both themes. They are observed frames, not decoration.

## The observation grammar (the complete list)

Use these, and only these:

1. **Acquisition corners** (`.acq` + `<i class="k …">`). Corner marks frame something selected: the current nav item, a hovered or focused subject row or archive row, the selected video record, the research record card, the model-capability box. They settle 3–6 px into place. Green when selected, otherwise hairline grey.
2. **Record identifiers.** `rec 01.004` = subject 01, the fourth record in that subject (oldest is 001), computed from the content at build time. Shown on archive rows, the selected video record and the article margin. Hidden on phones.
3. **Selected record.** The newest video on a topic page, with its subject artwork behind the title.
4. **Observed.** One plain term per subject (*metering*, *physical capacity*, *judgement*), shown at most once or twice on a page.
5. **Subject indices** `01 02 03` before the three subjects in the navigation and in the homepage rows.
6. Carried over: the `tharshan.ai_` wordmark (static underscore), dotted dates `2026.09.30`, `§ 1` above article sections, `■ end`, inverse-video focus and selection.

**Vocabulary ceiling.** Don't add terms beyond these, even where the grammar would support them. The site must be understandable without decoding the interface. Out of scope: typing or boot animations, glitch, scanlines, flicker, fake readouts, show references, terminal commands, dashboards.

## Layout

- Wide container (74rem) with a 10rem mono metadata column at desktop widths.
- Ruled rows, not card grids. The only boxed elements are the research record card, the model-capability box, callouts and code.
- **Homepage**: thesis → three subject rows (each with a small viewport onto its subject image on desktop) → one research line → a one-line context → footer.
- **Topic pages**: introduction beside the subject image (one column without an image) → selected record → archive rows with record identifiers → (Human-Wrapped AI only) the research lineage.
- **Human-Wrapped AI**: `MODEL CAPABILITY · 1 component of 8`, then the seven conditions "wrapped by the other 7". It is a reading list, not a dashboard.
- **Articles**: new interface around a historical document. An optional cover, a record block in the margin (`rec`, original-media count), then a quiet body: no rulers, no corners, no labels other than the `original media · unaltered` frame around historical images.
- **Research**: the formal archive. `doc 001`, peer-reviewed status and a ruled bibliographic card. No imagery, no further machine styling.

## Mobile: editorial first, system second

Priority: content, then hierarchy, navigation, identity and decorative detail, in that order. On phones:

- the navigation wraps onto two quiet lines (no indices, no sideways scrolling, tap targets ≥ 24px);
- the counts line, "observed" labels in subject rows, record identifiers, the article record block and secondary captions are hidden;
- subject images appear after the introduction, never before it;
- only one short metadata line comes before the first line of writing.

## Motion

Corner marks move a few pixels into place on hover and focus (≈160ms), and colours fade (≈120ms). Nothing loops, nothing scrolls the page, and nothing animates on load. `prefers-reduced-motion` turns all of it off.

## Accessibility

WCAG 2.2 AA: contrast ≥ 4.5:1 for text in both themes, visible inverse-video focus, a skip link, semantic headings, labelled theme toggle, decorative images with empty `alt`, subject images and covers with plain descriptions, and state shown by shape as well as colour. Checked with axe-core in both themes at desktop and phone widths.

## Components

`Header`, `Footer`, `SectionHead`, `FeedItem` (archive row with record id), `VideoFeature` + `VideoTile` (selected record, optional artwork), `ModelCapability`, `WritingItem`, `ResearchItem` (doc number + record card), `VideoItem`, `Callout`, `Citation`, `Abstract`, `Figure`, `WrapQuadrant`, `YouTube`, `TikTok`, `LinkedInEmbed`.

Libraries: `src/lib/topics.ts` (subjects, observed terms, optional visuals, record ids), `src/lib/artefacts.ts` (historical-media framing), `src/lib/og.ts` (share images).
