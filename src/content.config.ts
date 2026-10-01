/**
 * Content model for tharshan.ai
 *
 * Every piece of content is a Markdown (.md) or MDX (.mdx) file with a
 * frontmatter block at the top. The schemas below validate that frontmatter
 * at build time, so a typo in a date or a missing title fails the build
 * instead of shipping a broken page.
 *
 *   src/content/writing/   essays, research notes, analysis, experiments
 *   src/content/research/  published / substantive research (papers)
 *   src/content/videos/    video entries (LinkedIn, YouTube, TikTok)
 *
 * Files starting with an underscore are ignored (useful for templates).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * SUBJECTS: the site is organised around these three topics.
 * Every piece of writing and every video has one primary `topic`
 * and optional `related` topics, using exactly these values.
 * (Titles and intros for each topic live in src/lib/topics.ts.)
 */
export const TOPICS = ['ai-economics', 'ai-infrastructure', 'human-wrapped-ai'] as const;
const topic = z.enum(TOPICS);

/** FORMATS for writing (videos are their own format). Add to this list if needed. */
export const WRITING_FORMATS = ['essay', 'note', 'analysis', 'research note', 'experiment'] as const;

const reference = z.object({
  title: z.string(),
  url: z.url(),
  note: z.string().optional(),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writing' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Optional override for the URL. Defaults to the file name. */
      slug: z.string().optional(),
      description: z.string().max(260),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      /** Primary subject: ai-economics | ai-infrastructure | human-wrapped-ai */
      topic: topic,
      /** Optional additional subjects; the piece also appears on those topic pages. */
      related: z.array(topic).default([]),
      format: z.enum(WRITING_FORMATS),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      /** Drafts show up in local development only, never in production. */
      draft: z.boolean().default(false),
      hero: z
        .object({
          src: image(),
          alt: z.string(),
          caption: z.string().optional(),
        })
        .optional(),
      references: z.array(reference).default([]),
      /** Set when a piece was first published elsewhere (e.g. LinkedIn, the old AI Experimenter). */
      originallyPublished: z
        .object({ where: z.string(), url: z.url().optional(), date: z.coerce.date().optional() })
        .optional(),
    }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    /** One-sentence summary used in lists and search results. */
    description: z.string().max(300),
    authors: z.array(z.string()).min(1),
    /** e.g. "Journal article", "Working paper", "Dissertation chapter" */
    type: z.string().default('Journal article'),
    venue: z.string(),
    year: z.number().int(),
    date: z.coerce.date(),
    /** Print issue date as shown by the journal, e.g. 'October 2022' */
    issueDate: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    articleNumber: z.string().optional(),
    pages: z.string().optional(),
    doi: z.string().optional(),
    url: z.url().optional(),
    /** Only set if you have the right to distribute this file. Path under /public. */
    pdf: z.string().optional(),
    /** Official abstract, if reproduction is appropriate. */
    abstract: z.string().optional(),
    abstractSource: z.string().optional(),
    citation: z.object({ apa: z.string(), bibtex: z.string().optional() }),
    /** Optional one-line summaries shown in the research metadata block. */
    sample: z.string().optional(),
    method: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/videos' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(300),
      date: z.coerce.date(),
      platform: z.enum(['LinkedIn', 'YouTube', 'TikTok']),
      /** Link to the video on its platform. */
      url: z.url(),
      /** Primary subject: ai-economics | ai-infrastructure | human-wrapped-ai */
      topic: topic,
      /** Optional additional subjects; the video also appears on those topic pages. */
      related: z.array(topic).default([]),
      /**
       * Optional official embed URL, used only by the click-to-play option.
       * LinkedIn: worked out automatically from the post URL, so leave this out.
       * YouTube: https://www.youtube-nocookie.com/embed/VIDEO_ID
       */
      embedUrl: z.url().optional(),
      /** Optional thumbnail image (local file, relative to this .md file). */
      thumbnail: image().optional(),
      thumbnailAlt: z.string().optional(),
      /** e.g. "2:04" */
      duration: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { writing, research, videos };
