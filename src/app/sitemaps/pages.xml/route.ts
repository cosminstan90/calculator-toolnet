import { asURLNode, wrapUrlset, xmlResponse } from "@/lib/sitemap";

export const revalidate = 900;

export async function GET() {
  const nodes = [
    asURLNode("/"),
    asURLNode("/calculatoare"),
    asURLNode("/pentru-persoane"),
    asURLNode("/pentru-firme"),
    asURLNode("/blog"),
    asURLNode("/despre-noi"),
    asURLNode("/echipa-editoriala"),
    asURLNode("/contact"),
    asURLNode("/metodologie"),
    asURLNode("/politica-editoriala"),
  ].join("");

  return xmlResponse(wrapUrlset(nodes));
}
