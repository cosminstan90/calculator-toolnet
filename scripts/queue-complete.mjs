import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dryRun = process.argv.includes("--dry-run");

const asRecord = (value) => (value && typeof value === "object" ? value : {});
const asString = (value) => (typeof value === "string" ? value : "");

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const collection = getCliArg("collection");
const slugList = (getCliArg("slugs") ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (!["articles", "calculators"].includes(collection ?? "")) {
  console.error('Missing or invalid --collection. Use "articles" or "calculators".');
  process.exit(1);
}

if (slugList.length === 0) {
  console.error("Missing --slugs. Provide a comma-separated slug list.");
  process.exit(1);
}

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
  const loadEnvModulePath = path.join(
    rootDir,
    "node_modules",
    "payload",
    "dist",
    "bin",
    "loadEnv.js",
  );

  try {
    const source = await fs.readFile(loadEnvModulePath, "utf8");

    if (source.includes("nextEnvImportNs.loadEnvConfig")) {
      return;
    }

    const importLine = "import nextEnvImport from '@next/env';";
    const destructureLine = "const { loadEnvConfig } = nextEnvImport;";

    if (!source.includes(importLine) || !source.includes(destructureLine)) {
      return;
    }

    const patchedSource = source
      .replace(importLine, "import * as nextEnvImportNs from '@next/env';")
      .replace(
        destructureLine,
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

const buildChecklist = (doc) => {
  const checklist = asRecord(doc.editorialChecklist);

  return {
    ...checklist,
    schemaValidated: true,
    finalReviewDone: true,
    publishReady: true,
  };
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[queue-complete] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const docs = await payload.find({
    collection,
    depth: 0,
    draft: true,
    pagination: false,
    limit: 500,
    overrideAccess: true,
    where: {
      slug: {
        in: slugList,
      },
    },
  });

  const results = [];

  for (const doc of docs.docs) {
    const data =
      collection === "articles"
        ? {
            editorialStatus:
              ["approved", "scheduled", "published"].includes(asString(doc.editorialStatus))
                ? asString(doc.editorialStatus)
                : "scheduled",
            editorialChecklist: buildChecklist(doc),
            aiDraft: {
              ...asRecord(doc.aiDraft),
              reviewStatus: "reviewed",
            },
          }
        : {
            editorialStatus:
              ["approved", "scheduled", "published"].includes(asString(doc.editorialStatus))
                ? asString(doc.editorialStatus)
                : "scheduled",
            editorialChecklist: buildChecklist(doc),
          };

    if (!dryRun) {
      await payload.update({
        collection,
        id: doc.id,
        overrideAccess: true,
        draft: asString(doc._status) !== "published",
        data,
      });
    }

    results.push({
      status: dryRun ? "dry-run" : "completed",
      collection,
      title: asString(doc.title),
      slug: asString(doc.slug),
      editorialStatus: asString(data.editorialStatus),
      reviewStatus:
        collection === "articles" ? asString(asRecord(data.aiDraft).reviewStatus) : undefined,
      checklist: {
        schemaValidated: asRecord(data.editorialChecklist).schemaValidated === true,
        finalReviewDone: asRecord(data.editorialChecklist).finalReviewDone === true,
        publishReady: asRecord(data.editorialChecklist).publishReady === true,
      },
    });
  }

  const missing = slugList.filter(
    (slug) => !results.some((result) => result.slug === slug),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "queue-complete",
        dryRun,
        collection,
        requestedSlugs: slugList,
        completed: results,
        missing,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
