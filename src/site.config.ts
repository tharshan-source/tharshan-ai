/**
 * Basic site information. Edit this file to change the name, description,
 * navigation or LinkedIn link used across the whole site.
 */
export const SITE = {
  url: 'https://tharshan.ai',
  /** Short name used in titles and metadata. */
  name: 'Tharshan',
  /** Full name, used for author metadata, citations and search engines. */
  fullName: 'Tharshan Thavaharan',
  /** Homepage title (browser tab, search results). */
  homeTitle: 'Tharshan | AI is human-wrapped.',
  /** Default description for search engines and link previews (= homepage descriptor). */
  description: 'Musings on AI’s impact on economics, governance, and infrastructure, informed by lived experiences.',
  /** One line shown in the footer. */
  footerLine: 'AI is human-wrapped.',
  locale: 'en_GB',
  lang: 'en-GB',
  /** Where "Contact" points. */
  linkedin: 'https://www.linkedin.com/in/tharshant/',
  /**
   * Optional author photograph for the About page, e.g. '/images/tharshan.jpg' (put the file in public/images/).
   * Leave undefined and the About page shows no image. It is never shown on the homepage.
   */
  authorPhoto: undefined as string | undefined,
};

/**
 * Primary navigation, in this order. Subjects first, then research.
 * "Contact" (→ LinkedIn) and the theme toggle are added by the header.
 */
export const NAV = [
  { label: 'AI Economics', href: '/ai-economics' },
  { label: 'AI Infrastructure', href: '/ai-infrastructure' },
  { label: 'Human-Wrapped AI', href: '/human-wrapped-ai' },
  { label: 'Research', href: '/research' },
];
