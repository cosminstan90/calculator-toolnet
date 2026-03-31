import { absoluteURL } from "@/lib/site";

export const xmlResponse = (xml: string): Response => {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
};

export const withXMLHeader = (content: string): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>${content}`;
};

export const toISO = (date?: string): string => {
  if (!date) {
    return new Date().toISOString();
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

export const wrapUrlset = (inner: string): string => {
  return withXMLHeader(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${inner}</urlset>`
  );
};

export const wrapImageUrlset = (inner: string): string => {
  return withXMLHeader(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${inner}</urlset>`
  );
};

export const wrapSitemapIndex = (inner: string): string => {
  return withXMLHeader(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${inner}</sitemapindex>`
  );
};

export const asSitemapNode = (path: string, lastmod?: string): string => {
  return `<sitemap><loc>${absoluteURL(path)}</loc><lastmod>${toISO(lastmod)}</lastmod></sitemap>`;
};

export const asURLNode = (path: string, lastmod?: string): string => {
  return `<url><loc>${absoluteURL(path)}</loc><lastmod>${toISO(lastmod)}</lastmod></url>`;
};
