import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

import { SPRINT_1_LINKING_EXPECTATIONS } from "../src/lib/sprint-1.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const asString = (value) => (typeof value === "string" ? value : "");
const asArray = (value) => (Array.isArray(value) ? value : []);

const getRelationSlugs = (items) =>
  asArray(items)
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") return asString(item.slug);
      return "";
    })
    .filter(Boolean);

const getRelationID = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "id" in value) {
    return String(value.id);
  }

  return "";
};

const loadEnvFile = async () => {
  const envPath = path.join(rootDir, ".env");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value.replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    // noop
  }
};

const patchPayloadLoadEnvInterop = async () => {
  const loadEnvModulePath = path.join(rootDir, "node_modules", "payload", "dist", "bin", "loadEnv.js");
  try {
    const source = await fs.readFile(loadEnvModulePath, "utf8");
    if (source.includes("nextEnvImportNs.loadEnvConfig")) return;
    const patchedSource = source
      .replace("import nextEnvImport from '@next/env';", "import * as nextEnvImportNs from '@next/env';")
      .replace(
        "const { loadEnvConfig } = nextEnvImport;",
        [
          "const loadEnvConfig =",
          "    nextEnvImportNs.loadEnvConfig ?? nextEnvImportNs.default?.loadEnvConfig;",
          "if (typeof loadEnvConfig !== 'function') {",
          '    throw new TypeError("Could not resolve loadEnvConfig from @next/env");',
          "}",
        ].join("\n"),
      );
    await fs.writeFile(loadEnvModulePath, patchedSource, "utf8");
  } catch {
    // noop
  }
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[internal-linking-audit] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const [categories, calculators, articles] = await Promise.all([
    payload.find({
      collection: "calculator-categories",
      draft: true,
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 100,
    }),
    payload.find({
      collection: "calculators",
      draft: true,
      depth: 1,
      overrideAccess: true,
      pagination: false,
      limit: 500,
    }),
    payload.find({
      collection: "articles",
      draft: true,
      depth: 1,
      overrideAccess: true,
      pagination: false,
      limit: 500,
    }),
  ]);

  const categorySlugByID = new Map(
    categories.docs.map((doc) => [String(doc.id), asString(doc.slug)]),
  );

  const docsBySlug = new Map([
    ...calculators.docs.map((doc) => [asString(doc.slug), { collection: "calculators", doc }]),
    ...articles.docs.map((doc) => [asString(doc.slug), { collection: "articles", doc }]),
  ]);

  const results = SPRINT_1_LINKING_EXPECTATIONS.map((expectation) => {
    const entry = docsBySlug.get(expectation.slug);
    if (!entry) {
      return {
        ...expectation,
        status: "missing",
        missingLinks: ["document inexistent"],
      };
    }

    const categorySlug =
      entry.collection === "calculators"
        ? categorySlugByID.get(getRelationID(entry.doc.category)) ?? asString(entry.doc.category?.slug)
        : categorySlugByID.get(getRelationID(entry.doc.relatedCategory)) ?? asString(entry.doc.relatedCategory?.slug);

    const relatedCalculatorSlugs =
      entry.collection === "calculators"
        ? getRelationSlugs(entry.doc.relatedCalculators)
        : getRelationSlugs(entry.doc.relatedCalculators);
    const relatedArticleSlugs =
      entry.collection === "calculators"
        ? getRelationSlugs(entry.doc.relatedArticles)
        : getRelationSlugs(entry.doc.relatedArticles);

    const missingLinks = [
      ...(expectation.expectedCategorySlug && categorySlug !== expectation.expectedCategorySlug
        ? [`categorie: ${expectation.expectedCategorySlug}`]
        : []),
      ...((expectation.expectedCalculatorLinks ?? []).filter((slug) => !relatedCalculatorSlugs.includes(slug)).map((slug) => `calculator: ${slug}`)),
      ...((expectation.expectedArticleLinks ?? []).filter((slug) => !relatedArticleSlugs.includes(slug)).map((slug) => `article: ${slug}`)),
    ];

    return {
      ...expectation,
      status: missingLinks.length === 0 ? "ok" : "missing-links",
      categorySlug,
      relatedCalculatorSlugs,
      relatedArticleSlugs,
      missingLinks,
    };
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "internal-linking-audit",
        checkedAt: new Date().toISOString(),
        summary: {
          total: results.length,
          ok: results.filter((item) => item.status === "ok").length,
          missing: results.filter((item) => item.status === "missing").length,
          missingLinks: results.filter((item) => item.status === "missing-links").length,
        },
        results,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
