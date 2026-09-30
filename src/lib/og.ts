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
  { name: 'Newsreader', data: font('@fontsource/newsreader/files/newsreader-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Newsreader', data: font('@fontsource/newsreader/files/newsreader-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Inter', data: font('@fontsource/inter/files/inter-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Inter', data: font('@fontsource/inter/files/inter-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
];

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

export async function renderOg({ title, kicker, footer }: { title: string; kicker?: string; footer?: string }) {
  const size = title.length > 90 ? 52 : title.length > 60 ? 60 : title.length > 34 ? 70 : 84;
  const tree = h(
    'div',
    { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#131211', color: '#f1ede6', padding: '72px 80px' },
    [
      h('div', { display: 'flex', alignItems: 'baseline', fontFamily: 'Newsreader', fontSize: 38, fontWeight: 500 }, [
        h('span', {}, 'Tharshan'),
        h('span', { color: '#a9a399', fontWeight: 400 }, '.ai'),
      ]),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        kicker
          ? h('div', { display: 'flex', alignItems: 'center', fontFamily: 'Inter', fontWeight: 600, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: '#a9a399', marginBottom: 26 }, [
              h('div', { width: 12, height: 12, background: '#e0886a', marginRight: 16 }),
              h('span', {}, kicker),
            ])
          : null,
        h('div', { fontFamily: 'Newsreader', fontWeight: 400, fontSize: size, lineHeight: 1.08, letterSpacing: -1.2, maxWidth: 1000 }, title),
      ]),
      h('div', { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #34322e', paddingTop: 26, fontFamily: 'Inter', fontWeight: 500, fontSize: 22, color: '#a9a399' }, [
        h('span', {}, footer ?? 'Tharshan'),
        h('span', {}, 'tharshan.ai'),
      ]),
    ],
  );
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
