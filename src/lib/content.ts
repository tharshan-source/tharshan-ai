import { getCollection, type CollectionEntry } from 'astro:content';

/** Drafts are visible when running locally (npm run dev) and hidden in production builds. */
const showDrafts = import.meta.env.DEV;
const visible = ({ data }: { data: { draft?: boolean } }) => showDrafts || !data.draft;

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();

export const slugOf = (entry: { id: string; data: { slug?: string } }) => entry.data.slug ?? entry.id;

export async function getWriting() {
  return (await getCollection('writing', visible)).sort(byDateDesc);
}

export async function getResearch() {
  return (await getCollection('research', visible)).sort(byDateDesc);
}

export async function getVideos() {
  return (await getCollection('videos', visible)).sort(byDateDesc);
}

/** Featured items first, then most recent, limited to `n`. */
export function pick<T extends { data: { featured?: boolean; date: Date } }>(items: T[], n: number) {
  return [...items].sort((a, b) => Number(!!b.data.featured) - Number(!!a.data.featured) || byDateDesc(a, b)).slice(0, n);
}

/** Rough reading time from the raw Markdown body (~230 words per minute). */
export function readingTime(body: string | undefined) {
  if (!body) return undefined;
  const text = body
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()!|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export const formatDate = (d: Date, style: 'long' | 'short' = 'long') =>
  d.toLocaleDateString('en-GB', style === 'long' ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } : { month: 'short', year: 'numeric', timeZone: 'UTC' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export type Writing = CollectionEntry<'writing'>;
export type Research = CollectionEntry<'research'>;
export type Video = CollectionEntry<'videos'>;
