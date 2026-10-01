/**
 * The three subjects tharshan.ai is organised around.
 * Edit titles and introductions here. The slugs must match TOPICS in content.config.ts.
 *
 * Everything else is automatic: a topic page lists every writing piece and video whose
 * `topic` or `related` field includes it, newest first, and features the newest video.
 */
import type { ImageMetadata } from 'astro';
import { getWriting, getVideos, type Writing, type Video } from './content';
import type { TOPICS } from '../content.config';
import econKey from '../assets/subjects/economics.jpg';
import econFrag from '../assets/subjects/economics-fragment.jpg';
import econArt from '../assets/subjects/economics-artwork.jpg';
import infraKey from '../assets/subjects/infrastructure.jpg';
import infraFrag from '../assets/subjects/infrastructure-fragment.jpg';
import infraArt from '../assets/subjects/infrastructure-artwork.jpg';
import hwaiKey from '../assets/subjects/human-wrapped-ai.jpg';
import hwaiFrag from '../assets/subjects/human-wrapped-ai-fragment.jpg';
import hwaiArt from '../assets/subjects/human-wrapped-ai-artwork.jpg';

export type TopicSlug = (typeof TOPICS)[number];

export interface Topic {
  slug: TopicSlug;
  n: string;
  title: string;
  /** One line used on the homepage and in search results. */
  descriptor: string;
  /** Short mono line of the subjects the page covers (leave empty for none). */
  covers: string[];
  /** What the system observes in this subject. One plain word or phrase, shown as "observed: …". */
  observed: string;
  /**
   * Optional subject image (see docs/visual-system.md). Remove it and every page falls back
   * to its typographic state: imagery is never structurally required.
   *   key: 16:9 master · fragment: crop around the observed object · artwork: treated photo, no overlay
   */
  visual?: { key: ImageMetadata; fragment: ImageMetadata; artwork: ImageMetadata; alt: string };
}

export const TOPIC_LIST: Topic[] = [
  {
    slug: 'ai-economics',
    n: '01',
    title: 'AI Economics',
    descriptor: 'What AI costs, how it makes money, and where the numbers stop matching the narrative.',
    covers: ['unit economics', 'pricing', 'margins', 'capital allocation'],
    observed: 'metering',
    visual: { key: econKey, fragment: econFrag, artwork: econArt, alt: 'A wall of identical electricity meters in monochrome, one meter marked as the observed unit.' },
  },
  {
    slug: 'ai-infrastructure',
    n: '02',
    title: 'AI Infrastructure',
    descriptor: 'The compute, cloud and physical economics underneath the models.',
    covers: ['compute', 'cloud', 'data', 'power', 'forecasting'],
    observed: 'physical capacity',
    visual: { key: infraKey, fragment: infraFrag, artwork: infraArt, alt: 'An electrical substation at ground level in monochrome, one equipment bay marked as observed.' },
  },
  {
    slug: 'human-wrapped-ai',
    n: '03',
    title: 'Human-Wrapped AI',
    descriptor: 'What happens when model capability meets people, incentives and governance.',
    covers: [],
    observed: 'judgement',
    visual: { key: hwaiKey, fragment: hwaiFrag, artwork: hwaiArt, alt: 'People working at tables seen from far above, in monochrome, one group marked as observed.' },
  },
];

export const topicBySlug = (slug: string) => TOPIC_LIST.find((t) => t.slug === slug);
export const topicTitle = (slug: string) => topicBySlug(slug)?.title ?? slug;

/** Record identifier: "01.004" = subject 01, fourth record in that subject's feed (oldest = 001). */
export async function recordIds(slug: TopicSlug): Promise<Map<string, string>> {
  const feed = await getTopicFeed(slug);
  const n = topicBySlug(slug)!.n;
  return new Map(feed.map((item, i) => [`${item.kind}:${item.entry.id}`, `${n}.${String(feed.length - i).padStart(3, '0')}`]));
}

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
