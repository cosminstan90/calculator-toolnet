import { buildCalculatorPath, listAllCalculatorsForSitemap } from "@/lib/content";
import { asURLNode, wrapUrlset, xmlResponse } from "@/lib/sitemap";

export const revalidate = 900;

export async function GET() {
  const calculators = await listAllCalculatorsForSitemap();
  const nodes = calculators
    .map((calculator) =>
      asURLNode(
        buildCalculatorPath(calculator),
        calculator.updatedAt ?? calculator.publishedAt,
      ),
    )
    .join("");
  return xmlResponse(wrapUrlset(nodes));
}
