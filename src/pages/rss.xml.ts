import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWriting, getResearch, slugOf } from '../lib/content';
import { SITE } from '../site.config';
import { topicTitle } from '../lib/topics';

export async function GET(context: APIContext) {
  const writing = (await getWriting()).filter((e) => !e.data.draft);
  const research = (await getResearch()).filter((e) => !e.data.draft);
  const items = [
    ...writing.map((e) => ({
      title: e.data.title,
      description: e.data.description,
      pubDate: e.data.date,
      link: `/writing/${slugOf(e)}`,
      categories: [topicTitle(e.data.topic), ...e.data.related.map(topicTitle), e.data.format],
    })),
    ...research.map((e) => ({
      title: e.data.title,
      description: e.data.description,
      pubDate: e.data.date,
      link: `/research/${slugOf(e)}`,
      categories: ['Research'],
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: `${SITE.name} — tharshan.ai`,
    description: SITE.footerLine,
    site: context.site ?? SITE.url,
    items,
    customData: `<language>${SITE.lang.toLowerCase()}</language>`,
    trailingSlash: false,
  });
}
