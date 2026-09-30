import { SITE } from '../site.config';
export const GET = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain' } });
