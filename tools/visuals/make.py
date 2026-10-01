"""
tharshan.ai image pipeline: one observer for every subject.

    pip install pillow numpy playwright        (dev-only; never runs on Cloudflare)
    python3 tools/visuals/make.py              (rebuilds every canonical asset)

Two stages, identical for every image:
  1. treat()   source photo -> 16:9 crop -> source-noise floor -> monochrome -> exposure
               normalised to one median -> S-curve -> mapped from #0d0f10 to warm off-white
               -> house grain -> soft vignette
  2. compose() the observation layer: frame corners, edge rulers, ONE green acquisition
               bracket, metadata at fixed positions, and one faint subject trace.

Outputs go to src/assets/subjects/ (key, fragment, artwork) and are optimised by Astro.
Rules and rationale: docs/visual-system.md. Sources and licences: tools/visuals/SOURCES.md.
"""
import asyncio, os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'tools/visuals/sources')
OUT = os.path.join(ROOT, 'src/assets/subjects')
TMP = os.path.join(ROOT, 'tools/visuals/.build')
FONT = os.path.join(ROOT, 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')
W, H = 1600, 900
DARK = np.array([13, 15, 16], float)        # --bg
LIGHT = np.array([226, 221, 210], float)    # a warm off-white just below --text
SIGNAL, INK = '#8fbf8f', '#e8e3d9'

# --------------------------------------------------------------------------- subjects
# box = the one observed object, in 1600x900 frame pixels. label = what the bracket says.
SUBJECTS = {
    'economics': dict(
        src='economics-metering.jpg', crop=(0, 125, 2400, 1475), denoise=0,
        n='01', title='ai economics', observed='metering',
        box=(1047, 467, 1233, 660), label='meter / value metric', trace='index',
        artwork=(60, 40)),
    'infrastructure': dict(
        src='infrastructure-substation.jpg', crop=(760, 262, 2400, 1184), denoise=3,
        n='02', title='ai infrastructure', observed='physical capacity',
        box=(1013, 490, 1200, 627), label='bay / load path', trace='span',
        artwork=(380, 250)),
    'human-wrapped-ai': dict(
        src='human-wrapped-tables.jpg', crop=(0, 0, 2400, 1350), denoise=0,
        n='03', title='human-wrapped ai', observed='judgement',
        box=(580, 320, 890, 530), label='group 04 / decision', trace='links',
        others=[(170, 20, 420, 320), (605, 0, 810, 200), (200, 360, 520, 590)],
        artwork=(1060, 80)),
}

# Article covers: same fields as SUBJECTS; written to src/content/writing/images/<name>.jpg.
# Leave empty until an article genuinely needs one (docs/visual-system.md §2).
COVERS = {}

# --------------------------------------------------------------------------- stage 1
def treat(name, crop, denoise=0, target=0.36, seed=1):
    im = Image.open(os.path.join(SRC, name)).convert('RGB').crop(crop).resize((W, H), Image.LANCZOS)
    if denoise:  # bring a grainy source down to the common floor before the house grain
        im = im.filter(ImageFilter.MedianFilter(denoise)).filter(ImageFilter.GaussianBlur(0.5))
    a = np.asarray(im, float) / 255
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    lo, hi = np.percentile(L, 1), np.percentile(L, 99.3)
    L = np.clip((L - lo) / (hi - lo), 0, 1)
    L = L ** (np.log(target) / np.log(max(np.median(L), 1e-3)))      # same median for every image
    L = np.clip(0.5 + 0.5 * np.tanh((L - 0.5) * 2.1) / np.tanh(1.05), 0, 1)
    rgb = DARK + (LIGHT - DARK) * L[..., None]
    rgb += np.random.default_rng(seed).normal(0, 7.5, (H, W))[..., None]  # mono grain
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    rgb = DARK + (rgb - DARK) * (1 - 0.28 * np.clip(d - 0.55, 0, 1) ** 1.4)[..., None]
    return Image.fromarray(np.clip(rgb, 0, 255).astype('uint8'))

# --------------------------------------------------------------------------- stage 2
def corners(x0, y0, x1, y1, L, color, sw):
    return ''.join(f'<path d="M{x} {y + dy * L} L{x} {y} L{x + dx * L} {y}" stroke="{color}" stroke-width="{sw}" fill="none"/>'
                   for x, y, dx, dy in [(x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)])

def label(x, y, text, color=INK, anchor='start'):
    w = len(text) * 10.1 + 20
    rx = x - 10 if anchor == 'start' else x - w + 10
    return (f'<rect x="{rx}" y="{y - 18}" width="{w}" height="26" fill="#0d0f10" fill-opacity=".74"/>'
            f'<text x="{x}" y="{y}" class="t" fill="{color}" text-anchor="{anchor}">{text}</text>')

def overlay(s, rec='000'):
    m, o = 34, []
    x0, y0, x1, y1 = s['box']; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    o.append(corners(m, m, W - m, H - m, 26, INK, 1.5))
    for x in range(m + 40, W - m, 40):
        o.append(f'<line x1="{x}" y1="{m}" x2="{x}" y2="{m + (9 if (x - m) % 200 == 0 else 4)}" stroke="{INK}" stroke-opacity=".45"/>')
    for y in range(m + 40, H - m, 40):
        o.append(f'<line x1="{m}" y1="{y}" x2="{m + (9 if (y - m) % 200 == 0 else 4)}" y2="{y}" stroke="{INK}" stroke-opacity=".45"/>')
    if s['trace'] == 'index':      # economics: a ledger-like index along the edges
        for i, x in enumerate(range(m + 100, W - m - 220, 200)):
            o.append(f'<text x="{x}" y="{m + 26}" class="t sm" text-anchor="middle" opacity=".6">{"ABCDEFGH"[i]}</text>')
        for i, y in enumerate(range(m + 100, H - m, 200)):
            o.append(f'<text x="{m + 16}" y="{y + 4}" class="t sm" opacity=".6">{i + 1:02d}</text>')
    if s['trace'] == 'span':       # infrastructure: a measured span along the structure
        y, xa, xb = 300, 165, W - m - 20
        o.append(f'<line x1="{xa}" y1="{y}" x2="{xb}" y2="{y}" stroke="{INK}" stroke-opacity=".75" stroke-dasharray="2 5"/>')
        o += [f'<line x1="{x}" y1="{y - 8}" x2="{x}" y2="{y + 8}" stroke="{INK}" stroke-opacity=".9"/>' for x in (xa, xb)]
        o.append(f'<text x="{(xa + xb) / 2}" y="{y - 12}" class="t sm" text-anchor="middle">span</text>')
    if s['trace'] == 'links':      # human-wrapped: the relationships between groups
        pts = [((a + c) / 2, (b + d) / 2) for a, b, c, d in s.get('others', [])] + [(cx, cy)]
        for i in range(len(pts)):
            for j in range(i + 1, len(pts)):
                o.append(f'<line x1="{pts[i][0]}" y1="{pts[i][1]}" x2="{pts[j][0]}" y2="{pts[j][1]}" stroke="{INK}" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="2 5"/>')
        o += [f'<rect x="{px - 3}" y="{py - 3}" width="6" height="6" fill="{INK}" fill-opacity=".85"/>' for px, py in pts]
    pad = 6                        # the one acquisition
    o.append(corners(x0 - pad, y0 - pad, x1 + pad, y1 + pad, 20, SIGNAL, 2.5))
    ly = y0 - pad - 10 if y0 - pad - 10 > m + 40 else y1 + pad + 22
    o.append(label(x0 - pad + 8, ly, s['label'], SIGNAL))
    o.append(f'<rect x="{m + 12}" y="{m + 12}" width="{len(s["n"] + s["title"]) * 10.1 + 50}" height="26" fill="#0d0f10" fill-opacity=".74"/>')
    o.append(f'<text x="{m + 22}" y="{m + 30}" class="t"><tspan fill="{SIGNAL}">{s["n"]}</tspan> / {s["title"]}</text>')
    o.append(f'<text x="{W - m - 18}" y="{m + 30}" class="t" text-anchor="end" opacity=".85">rec {s["n"]}.{rec}</text>')
    o.append(label(m + 22, H - m - 20, f'observed / {s["observed"]}'))
    o.append(label(W - m - 22, H - m - 20, f'x {int(cx):04d} · y {int(cy):04d}', anchor='end'))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{"".join(o)}</svg>'

def page(base, svg):
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Mono;src:url(file://{FONT})}}
html,body{{margin:0;background:#0d0f10}}
.f{{position:relative;width:{W}px;height:{H}px;background:url(file://{base}) center/cover}}
.f::after{{content:"";position:absolute;inset:0;background:rgba(13,15,16,.10)}}
svg{{position:absolute;inset:0;z-index:2}}
.t{{font-family:Mono;font-size:15px;letter-spacing:.06em;fill:{INK};text-transform:uppercase}}
.sm{{font-size:12px}}
</style></head><body><div class="f">{svg}</div></body></html>'''

async def render(jobs):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': W, 'height': H})
        for html, out in jobs:
            path = out + '.html'; open(path, 'w').write(html)
            await pg.goto('file://' + path); await pg.wait_for_timeout(150)
            await pg.screenshot(path=out); os.remove(path)
        await b.close()

def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    jobs, meta = [], {}
    for key, s in SUBJECTS.items():
        base = treat(s['src'], s['crop'], s['denoise'])
        bp = os.path.join(TMP, f'{key}-base.png'); base.save(bp)
        jobs.append((page(bp, overlay(s)), os.path.join(TMP, f'{key}-key.png')))
        meta[key] = (base, s)
    asyncio.run(render(jobs))
    for key, (base, s) in meta.items():
        key_img = Image.open(os.path.join(TMP, f'{key}-key.png')).convert('RGB')
        key_img.save(os.path.join(OUT, f'{key}.jpg'), quality=86, optimize=True, progressive=True)
        # fragment: the observed object and its bracket, for small viewports
        x0, y0, x1, y1 = s['box']; cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        fw, fh = 880, 495; fx = min(max(cx - fw // 2, 0), W - fw); fy = min(max(cy - fh // 2, 0), H - fh)
        key_img.crop((fx, fy, fx + fw, fy + fh)).resize((800, 450), Image.LANCZOS).save(os.path.join(OUT, f'{key}-fragment.jpg'), quality=86, optimize=True)
        # artwork: the treated photograph only, no overlay, for video records
        ax, ay = s['artwork']
        base.crop((ax, ay, ax + 640, ay + 360)).resize((960, 540), Image.LANCZOS).save(os.path.join(OUT, f'{key}-artwork.jpg'), quality=86, optimize=True)
        print('built', key)
    if COVERS:
        cjobs = []
        for key, s in COVERS.items():
            bp = os.path.join(TMP, f'cover-{key}-base.png'); treat(s['src'], s['crop'], s.get('denoise', 0)).save(bp)
            cjobs.append((page(bp, overlay(s, s.get('rec', '000'))), os.path.join(TMP, f'cover-{key}.png')))
        asyncio.run(render(cjobs))
        for key in COVERS:
            Image.open(os.path.join(TMP, f'cover-{key}.png')).convert('RGB').save(os.path.join(ROOT, 'src/content/writing/images', f'{key}.jpg'), quality=86, optimize=True, progressive=True)
            print('built cover', key)

if __name__ == '__main__':
    main()
