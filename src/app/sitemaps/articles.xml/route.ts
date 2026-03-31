import { buildArticlePath, listAllArticlesForSitemap } from "@/lib/content";
import { asURLNode, wrapUrlset, xmlResponse } from "@/lib/sitemap";

export const revalidate = 900;

export async function GET() {
  const articles = await listAllArticlesForSitemap();
  const nodes = articles.map((article) => asURLNode(buildArticlePath(article.slug), article.publishedAt)).join("");
  return xmlResponse(wrapUrlset(nodes));
}
