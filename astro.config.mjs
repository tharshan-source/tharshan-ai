// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tharshan.ai',
  // Clean URLs: /writing/my-post (no trailing slash, no .html)
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/og/') }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: false },
  },
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
