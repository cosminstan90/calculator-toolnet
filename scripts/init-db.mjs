import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";
import prompts from "prompts";

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
    // Variables may also be provided by the shell / process manager.
  }
};

await loadEnvFile();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "payload.config.ts");

const runtimeEnv = process.env.PAYLOAD_INIT_NODE_ENV ?? "development";
const previousNodeEnv = process.env.NODE_ENV;

// Force a non-production init so the Postgres adapter can push the schema
// on first boot without going through the CLI migration path.
process.env.NODE_ENV = runtimeEnv;
process.env.PAYLOAD_MIGRATING = "false";
process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = "true";

// Drizzle / Payload can ask interactive questions during first schema push.
// Pre-accept them in this one-off operational script so it can run unattended on VPS.
prompts.inject([true, true, true, true, true]);

console.log(`[init-db] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

console.log(`[init-db] Initializing Payload with NODE_ENV=${runtimeEnv}`);

const payload = await getPayload({ config });

try {
  console.log("[init-db] Payload initialized. Schema push should now be complete.");
  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "init-db",
        nodeEnv: runtimeEnv,
        serverURL: payload.config.serverURL,
        collections: Object.keys(payload.collections),
        globals: Object.keys(payload.globals),
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();

  if (previousNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = previousNodeEnv;
  }
}
