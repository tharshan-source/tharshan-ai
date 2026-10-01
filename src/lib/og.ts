/**
 * Open Graph cards (1200×630 PNG), generated at build time.
 * Same grammar as the site: dark ground, frame corners, mono metadata, serif title, one green signal.
 * Articles and topic pages carry their subject's image (or the article's cover); research and the
 * default card stay typographic. See docs/visual-system.md → "Share images".
 */
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const font = (p: string) => readFileSync(require.resolve(p));
const fonts = [
  { name: 'Plex Serif', data: font('@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Plex Mono', data: font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Plex Mono', data: font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
];
const C = { bg: '#0d0f10', ink: '#e8e3d9', muted: '#a8a39a', faint: '#8a857c', rule: '#2a2f32', rule2: '#3a4044', signal: '#8fbf8f' };

/** The observed object in each 1600×900 subject image: share crops centre on it. */
const FOCUS: Record<string, { file: string; x: number; y: number }> = {
  'ai-economics': { file: 'economics.jpg', x: 1140, y: 563 },
  'ai-infrastructure': { file: 'infrastructure.jpg', x: 1106, y: 558 },
  'human-wrapped-ai': { file: 'human-wrapped-ai.jpg', x: 735, y: 425 },
};

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({ type, props: { style, children, ...extra } });

const corner = (pos: Record<string, number>, sides: string[]) =>
  h('div', { position: 'absolute', width: 26, height: 26, ...pos, ...Object.fromEntries(sides.map((s) => [`border${s}`, `1.5px solid ${C.ink}`])) });
const frame = () => [
  corner({ top: 28, left: 28 }, ['Top', 'Left']), corner({ top: 28, right: 28 }, ['Top', 'Right']),
  corner({ bottom: 28, left: 28 }, ['Bottom', 'Left']), corner({ bottom: 28, right: 28 }, ['Bottom', 'Right']),
];
const wordmark = () => h('div', { display: 'flex', fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 26, color: C.ink }, [h('span', {}, 'tharshan.ai'), h('span', { color: C.signal }, '_')]);

/** A JPEG data URI of the subject image (or a cover file), cropped to w×h around the focus point. */
async function crop(topic: string | undefined, w: number, h_: number, coverPath?: string) {
  let input: string, fx: number, fy: number, srcW: number, srcH: number;
  if (coverPath) {
    input = coverPath; const m = await sharp(input).metadata(); srcW = m.width!; srcH = m.height!; fx = srcW / 2; fy = srcH / 2;
  } else {
    const f = topic && FOCUS[topic]; if (!f) return undefined;
    input = resolve(process.cwd(), 'src/assets/subjects', f.file); srcW = 1600; srcH = 900; fx = f.x; fy = f.y;
  }
  const scale = Math.max(w / srcW, h_ / srcH);
  const sw = Math.round(srcW * scale), sh = Math.round(srcH * scale);
  const left = Math.min(Math.max(Math.round(fx * scale - w / 2), 0), sw - w);
  const top = Math.min(Math.max(Math.round(fy * scale - h_ / 2), 0), sh - h_);
  const buf = await sharp(input).resize(sw, sh).extract({ left, top, width: w, height: h_ }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

export interface OgInput extends Record<string, unknown> {
  kind: 'default' | 'topic' | 'article' | 'research';
  title: string;
  /** e.g. "01 / ai economics · analysis" */
  kicker?: string;
  /** bottom-left metadata, e.g. "rec 01.004 · 2025.08.15" */
  meta?: string;
  topic?: string;
  /** Absolute path to an article cover, if it has one */
  cover?: string;
  descriptor?: string;
}

export async function renderOg(o: OgInput) {
  const len = o.title.length;
  let tree: Node;
  {
    const sw = o.kind === 'topic' ? 500 : 360;
    const strip = o.kind === 'article' || o.kind === 'topic' ? await crop(o.topic, sw, 630, o.cover) : undefined;
    const textW = strip ? 1200 - sw : 1200;
    const size = strip
      ? (len > 80 ? 44 : len > 56 ? 52 : len > 32 ? 60 : 70)
      : (len > 90 ? 50 : len > 60 ? 58 : len > 34 ? 68 : 80);
    tree = h('div', { width: '100%', height: '100%', display: 'flex', position: 'relative', background: C.bg, color: C.ink }, [
      strip ? h('img', { position: 'absolute', top: 0, right: 0, width: sw, height: 630 }, undefined, { src: strip, width: sw, height: 630 }) : null,
      strip ? h('div', { position: 'absolute', top: 0, right: sw, width: 1, height: 630, background: C.rule2 }) : null,
      ...frame(),
      h('div', { position: 'absolute', top: 70, left: 80, width: textW - 80 - 60, bottom: 70, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', flexDirection: 'column' }, [
          wordmark(),
          o.kicker ? h('div', { fontFamily: 'Plex Mono', fontSize: 21, color: C.signal, marginTop: 26 }, o.kicker) : null,
        ]),
        h('div', { display: 'flex', flexDirection: 'column' }, [
          h('div', { fontFamily: 'Plex Serif', fontSize: o.kind === 'topic' ? 72 : size, lineHeight: 1.06, letterSpacing: -1.2 }, o.title),
          o.descriptor ? h('div', { fontFamily: 'Plex Serif', fontSize: 27, lineHeight: 1.35, color: C.muted, marginTop: 20 }, o.descriptor) : null,
        ]),
        h('div', { display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.rule}`, paddingTop: 22, fontFamily: 'Plex Mono', fontSize: 20, color: C.muted }, [
          h('span', {}, o.meta ?? 'tharshan'),
          h('span', {}, o.kind === 'default' ? 'economics · governance · infrastructure' : 'ai is human-wrapped.'),
        ]),
      ]),
    ]);
  }
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
