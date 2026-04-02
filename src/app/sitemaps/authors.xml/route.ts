import { buildAuthorPath, listAllPublicAuthorsForSitemap } from "@/lib/content";
import { asURLNode, wrapUrlset, xmlResponse } from "@/lib/sitemap";

export const revalidate = 900;

export async function GET() {
  const authors = await listAllPublicAuthorsForSitemap();
  const nodes = authors.map((author) => asURLNode(buildAuthorPath(author))).join("");
  return xmlResponse(wrapUrlset(nodes));
}
