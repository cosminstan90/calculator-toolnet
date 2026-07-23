import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

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
    // Variables may also come from the shell / process manager.
  }
};

await loadEnvFile();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");
const bootstrapPath = path.join(rootDir, "src", "lib", "bootstrap.ts");

console.log(`[regenerate-content] Using config at ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const importedBootstrap = await import(pathToFileURL(bootstrapPath).href);
const { regenerateCalculatorContent, regenerateArticleContent } = importedBootstrap;
const { getPayload } = await import("payload");

const payload = await getPayload({ config });

const stamp = () => new Date().toISOString().slice(11, 23);
const logProgress = (key, status) => {
  process.stdout.write(`[${stamp()}] ${status}: ${key}\n`);
};

try {
  console.log(`[${stamp()}] starting calculators...`);
  const calculators = await regenerateCalculatorContent(payload, logProgress);
  console.log("[regenerate-content] calculators:", JSON.stringify(calculators.created, null, 2), calculators.updated, calculators.skipped);

  console.log(`[${stamp()}] starting articles...`);
  const articles = await regenerateArticleContent(payload, logProgress);
  console.log("[regenerate-content] articles summary:", "updated:", articles.updated, "skipped:", articles.skipped);
} finally {
  await payload.destroy();
}
