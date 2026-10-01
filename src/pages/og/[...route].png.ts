import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg, type OgInput } from '../../lib/og';
import { getWriting, getResearch, slugOf, dotDate } from '../../lib/content';
import { TOPIC_LIST, topicBySlug, recordIds, getTopicFeed } from '../../lib/topics';

export const getStaticPaths: GetStaticPaths = async () => {
  const writing = await getWriting();
  const research = await getResearch();
  const recs = Object.fromEntries(await Promise.all(TOPIC_LIST.map(async (t) => [t.slug, await recordIds(t.slug)] as const)));
  const paths: { params: { route: string }; props: OgInput & Record<string, unknown> }[] = [
    { params: { route: 'default' }, props: { kind: 'default', title: 'AI is human-wrapped.', meta: 'tharshan' } },
    ...(await Promise.all(TOPIC_LIST.map(async (t) => {
      const feed = await getTopicFeed(t.slug);
      return { params: { route: t.slug }, props: { kind: 'topic' as const, title: t.title, topic: t.visual ? t.slug : undefined, kicker: `${t.n} / observed: ${t.observed}`, descriptor: t.descriptor, meta: `${feed.length} records` } };
    }))),
    ...writing.map((e) => {
      const t = topicBySlug(e.data.topic)!;
      const rec = recs[e.data.topic].get(`writing:${e.id}`);
      const cover = (e.data.cover?.src as unknown as { fsPath?: string } | undefined)?.fsPath;
      return {
        params: { route: `writing/${slugOf(e)}` },
        props: { kind: 'article' as const, title: e.data.title, topic: t.visual ? e.data.topic : undefined, cover, kicker: `${t.n} / ${t.title.toLowerCase()} · ${e.data.format}`, meta: `${rec ? `rec ${rec} · ` : ''}${dotDate(e.data.date)}` },
      };
    }),
    ...research.map((e, i) => ({
      params: { route: `research/${slugOf(e)}` },
      props: { kind: 'research' as const, title: e.data.title, kicker: `research / doc ${String(i + 1).padStart(3, '0')} · ${e.data.venue.toLowerCase()} · ${e.data.year}`, meta: e.data.authors.join(' & ').toLowerCase() },
    })),
  ];
  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as OgInput);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
