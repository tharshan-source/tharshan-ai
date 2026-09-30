/**
 * Open Graph card renderer (1200×630 PNG), generated at build time.
 * Plain typography on the site's ink colour; no decorative graphics.
 */
import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const font = (p: string) => readFileSync(require.resolve(p));
const fonts = [
  { name: 'Plex Serif', data: font('@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Plex Mono', data: font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Plex Mono', data: font('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
];

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export async function renderOg({ title, kicker, footer }: { title: string; kicker?: string; footer?: string }) {
  const size = title.length > 90 ? 50 : title.length > 60 ? 58 : title.length > 34 ? 68 : 80;
  const tree = h(
    'div',
    { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0d0f10', color: '#e8e3d9', padding: '70px 80px' },
    [
      h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'Plex Mono', fontSize: 28 }, [
        h('div', { display: 'flex', fontWeight: 500 }, [h('span', {}, 'tharshan.ai'), h('span', { color: '#8fbf8f' }, '_')]),
        kicker ? h('span', { fontSize: 22, color: '#8fbf8f' }, `[ ${kicker.toLowerCase()} ]`) : null,
      ]),
      h('div', { fontFamily: 'Plex Serif', fontWeight: 400, fontSize: size, lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 1000 }, title),
      h('div', { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2f32', paddingTop: 24, fontFamily: 'Plex Mono', fontSize: 22, color: '#a8a39a' }, [
        h('span', {}, (footer ?? 'tharshan').toLowerCase()),
        h('span', {}, 'research · writing · notes'),
      ]),
    ],
  );
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
