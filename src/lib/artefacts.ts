/**
 * Framing for historical article media, applied to the rendered article HTML at build time.
 *
 * Every image that is part of an article's own content (a Markdown image, or a raw <img> / <figure>)
 * is wrapped in a labelled frame:  original media · as published 2025.08.15 · unaltered
 * The <img> element itself is copied byte-for-byte: same src, same attributes, no filters, no crop.
 * See docs/visual-system.md → "Historical media".
 */
const wrap = (inner: string, date: string) =>
  `<div class="artefact"><p class="artefact-head sys"><span>original media · as published ${date}</span><span>unaltered</span></p><div class="artefact-body">${inner}</div></div>`;

export function frameArtefacts(html: string, date: string): { html: string; count: number } {
  let count = 0;
  const out = html
    // <figure> blocks that contain an image (component figures without <img>, e.g. diagrams, are left alone)
    .replace(/<figure\b[^>]*>(?:(?!<\/figure>)[\s\S])*?<img\b[\s\S]*?<\/figure>/g, (m) => { count++; return wrap(m, date); })
    // paragraphs that hold only an image
    .replace(/<p>\s*(<img\b[^>]*>)\s*<\/p>/g, (m) => { count++; return wrap(m, date); });
  return { html: out, count };
}
