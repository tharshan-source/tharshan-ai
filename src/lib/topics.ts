/**
 * The three subjects tharshan.ai is organised around.
 * Edit titles and introductions here. The slugs must match TOPICS in content.config.ts.
 *
 * Everything else is automatic: a topic page lists every writing piece and video whose
 * `topic` or `related` field includes it, newest first, and features the newest video.
 */
import { getWriting, getVideos, type Writing, type Video } from './content';
import type { TOPICS } from '../content.config';

export type TopicSlug = (typeof TOPICS)[number];

export interface Topic {
  slug: TopicSlug;
  n: string;
  title: string;
  /** One line used on the homepage and in search results. */
  descriptor: string;
  /** Short mono line of the subjects the page covers (leave empty for none). */
  covers: string[];
}

export const TOPIC_LIST: Topic[] = [
  {
    slug: 'ai-economics',
    n: '01',
    title: 'AI Economics',
    descriptor: 'What AI costs, how it makes money, and where the numbers stop matching the narrative.',
    covers: ['unit economics', 'pricing', 'margins', 'capital allocation'],
  },
  {
    slug: 'ai-infrastructure',
    n: '02',
    title: 'AI Infrastructure',
    descriptor: 'The compute, cloud and physical economics underneath the models.',
    covers: ['compute', 'cloud', 'data', 'power', 'forecasting'],
  },
  {
    slug: 'human-wrapped-ai',
    n: '03',
    title: 'Human-Wrapped AI',
    descriptor: 'What happens when model capability meets people, incentives and governance.',
    covers: [],
  },
];

export const topicBySlug = (slug: string) => TOPIC_LIST.find((t) => t.slug === slug);
export const topicTitle = (slug: string) => topicBySlug(slug)?.title ?? slug;

export type FeedItem =
  | { kind: 'writing'; date: Date; entry: Writing }
  | { kind: 'video'; date: Date; entry: Video };

const covers = (data: { topic: string; related: string[] }, slug: string) =>
  data.topic === slug || data.related.includes(slug as TopicSlug);

/** Every piece tagged with this topic (primary or related), newest first. */
export async function getTopicFeed(slug: TopicSlug): Promise<FeedItem[]> {
  const writing = (await getWriting()).filter((e) => covers(e.data, slug));
  const videos = (await getVideos()).filter((e) => covers(e.data, slug));
  return [
    ...writing.map((entry) => ({ kind: 'writing' as const, date: entry.data.date, entry })),
    ...videos.map((entry) => ({ kind: 'video' as const, date: entry.data.date, entry })),
  ].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

/** The newest video for this topic, or undefined if there is none. */
export async function getLatestVideo(slug: TopicSlug): Promise<Video | undefined> {
  return (await getVideos()).filter((e) => covers(e.data, slug))[0]; // getVideos() is already newest-first
}

/**
 * Inline "▶ play" for LinkedIn is switched off: tested on 2026.10.01, LinkedIn's official
 * embed renders as a white post card with the video below its own scroll area, which
 * doesn't fit the site. LinkedIn videos therefore use the editorial preview + "watch on
 * linkedin ↗". Set to true to re-enable. YouTube (via `embedUrl`) is unaffected.
 */
const LINKEDIN_INLINE_PLAY = false;

/** The official embed URL for click-to-play, if one should be offered. */
export function embedUrlFor(video: Video): string | undefined {
  if (video.data.embedUrl) return video.data.embedUrl;
  if (LINKEDIN_INLINE_PLAY && video.data.platform === 'LinkedIn') {
    const m = video.data.url.match(/urn:li:(?:activity|ugcPost|share):\d+/);
    if (m) return `https://www.linkedin.com/embed/feed/update/${m[0]}`;
  }
  return undefined;
}
