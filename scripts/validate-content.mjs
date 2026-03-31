import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    // Variables can also come from the shell.
  }
};

await loadEnvFile();

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://127.0.0.1:3015";
const token = process.env.CONTENT_HEALTH_TOKEN;

if (!token) {
  console.error("Missing CONTENT_HEALTH_TOKEN.");
  process.exit(1);
}

const response = await fetch(new URL("/api/health/content", baseURL), {
  headers: {
    "x-health-token": token,
  },
});

if (!response.ok) {
  console.error(`Health check failed with status ${response.status}.`);
  console.error(await response.text());
  process.exit(1);
}

console.log(JSON.stringify(await response.json(), null, 2));
