import {
  asSitemapNode,
  wrapSitemapIndex,
  xmlResponse,
} from "@/lib/sitemap";

export const revalidate = 900;

export function GET() {
  const now = new Date().toISOString();
  const xml = wrapSitemapIndex(
    [
      asSitemapNode("/sitemaps/pages.xml", now),
      asSitemapNode("/sitemaps/authors.xml", now),
      asSitemapNode("/sitemaps/categories.xml", now),
      asSitemapNode("/sitemaps/calculators.xml", now),
      asSitemapNode("/sitemaps/articles.xml", now),
    ].join("")
  );

  return xmlResponse(xml);
}
