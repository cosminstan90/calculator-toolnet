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

const force = process.argv.includes("--force");
const mode = process.env.BOOTSTRAP_MODE ?? "auto";
const baseURL =
  process.env.BOOTSTRAP_BASE_URL ??
  process.env.NEXT_PUBLIC_SERVER_URL ??
  "http://127.0.0.1:3015";
const token = process.env.BOOTSTRAP_TOKEN;

const runHttpBootstrap = async () => {
  if (!token) {
    throw new Error("Missing BOOTSTRAP_TOKEN for HTTP bootstrap.");
  }

  const response = await fetch(new URL("/api/internal/bootstrap/cms", baseURL), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-bootstrap-token": token,
    },
    body: JSON.stringify({ force }),
  });

  const payload = await response.text();

  if (!response.ok) {
    throw new Error(
      `Bootstrap HTTP request failed with status ${response.status}. Body: ${payload}`,
    );
  }

  return payload ? JSON.parse(payload) : {};
};

const runDirectBootstrap = async () => {
  const configPath = process.env.PAYLOAD_CONFIG_PATH
    ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
    : path.join(rootDir, "src", "cms.config.ts");
  const bootstrapPath = path.join(rootDir, "src", "lib", "bootstrap.ts");

  console.log(`[bootstrap] Running direct bootstrap using ${configPath}`);

  const importedConfig = await import(pathToFileURL(configPath).href);
  const config = await (importedConfig.default ?? importedConfig);
  config.telemetry = false;

  const importedBootstrap = await import(pathToFileURL(bootstrapPath).href);
  const { bootstrapCms } = importedBootstrap;
  const { getPayload } = await import("payload");

  const payload = await getPayload({ config });

  try {
    const result = await bootstrapCms(payload, { force });

    return {
      ok: true,
      force,
      mode: "direct",
      ...result,
    };
  } finally {
    await payload.destroy();
  }
};

try {
  if (mode === "http") {
    const result = await runHttpBootstrap();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (mode === "direct") {
    const result = await runDirectBootstrap();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  try {
    const result = await runHttpBootstrap();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (httpError) {
    console.warn("[bootstrap] HTTP bootstrap failed, switching to direct mode.");
    console.warn(httpError instanceof Error ? httpError.message : httpError);
  }

  const result = await runDirectBootstrap();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Bootstrap failed with an unknown error.",
  );
  process.exit(1);
}
