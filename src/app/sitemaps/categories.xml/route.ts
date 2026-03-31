import { listAllCategoriesForSitemap } from "@/lib/content";
import { asURLNode, wrapUrlset, xmlResponse } from "@/lib/sitemap";

export const revalidate = 900;

export async function GET() {
  const categories = await listAllCategoriesForSitemap();
  const nodes = categories.map((category) => asURLNode(`/calculatoare/${category.slug}`)).join("");
  return xmlResponse(wrapUrlset(nodes));
}
