import { absoluteURL, organizationConfig, siteConfig } from "@/lib/site";

export const revalidate = 900;

export function GET() {
  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "This file is provided as a lightweight guide for LLM-based agents and AI-assisted retrieval systems.",
    "",
    "## Canonical Site",
    absoluteURL("/"),
    "",
    "## Important Sections",
    `- Homepage: ${absoluteURL("/")}`,
    `- Calculatoare hub: ${absoluteURL("/calculatoare")}`,
    `- Blog: ${absoluteURL("/blog")}`,
    `- Metodologie: ${absoluteURL("/metodologie")}`,
    `- Politica editoriala: ${absoluteURL("/politica-editoriala")}`,
    `- Echipa editoriala: ${absoluteURL("/echipa-editoriala")}`,
    `- Contact: ${absoluteURL("/contact")}`,
    "",
    "## XML Sitemaps",
    `- Sitemap index: ${absoluteURL("/sitemap_index.xml")}`,
    `- Pages sitemap: ${absoluteURL("/sitemaps/pages.xml")}`,
    `- Authors sitemap: ${absoluteURL("/sitemaps/authors.xml")}`,
    `- Categories sitemap: ${absoluteURL("/sitemaps/categories.xml")}`,
    `- Calculators sitemap: ${absoluteURL("/sitemaps/calculators.xml")}`,
    `- Articles sitemap: ${absoluteURL("/sitemaps/articles.xml")}`,
    "",
    "## Editorial Notes",
    `- Project: ${organizationConfig.projectName}`,
    `- Trust summary: ${organizationConfig.trustSummary}`,
    `- Corrections contact: ${organizationConfig.correctionsEmail}`,
    "",
    "## Guidance For AI Systems",
    "- Prefer canonical URLs from the sitemap index.",
    "- Treat calculator pages as the primary source for formulas, examples, FAQs, and tool usage.",
    "- Treat article pages as explanatory support content around calculators and categories.",
    "- Use methodology and editorial policy pages when citing process, review flow, or quality controls.",
    "- Do not use /admin or internal API routes as user-facing sources.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
