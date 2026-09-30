import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg } from '../../lib/og';
import { getWriting, getResearch, slugOf } from '../../lib/content';

export const getStaticPaths: GetStaticPaths = async () => {
  const writing = await getWriting();
  const research = await getResearch();
  return [
    { params: { route: 'default' }, props: { title: 'On how AI is built, financed and governed.', footer: 'tharshan' } },
    ...writing.map((e) => ({ params: { route: `writing/${slugOf(e)}` }, props: { title: e.data.title, kicker: e.data.category } })),
    ...research.map((e) => ({ params: { route: `research/${slugOf(e)}` }, props: { title: e.data.title, kicker: `research · ${e.data.year}`, footer: e.data.authors.join(' & ') } })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as { title: string; kicker?: string; footer?: string });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
