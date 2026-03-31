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
    // Environment variables can also be provided by shell.
  }
};

await loadEnvFile();

const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
if (!inputArg) {
  console.error("Missing --input=path-to-file");
  process.exit(1);
}

const inputPath = inputArg.split("=")[1];
const absolutePath = path.isAbsolute(inputPath) ? inputPath : path.join(rootDir, inputPath);
const raw = await fs.readFile(absolutePath, "utf8");
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://127.0.0.1:3015";
const token = process.env.CONTENT_IMPORT_TOKEN ?? process.env.BOOTSTRAP_TOKEN;

if (!token) {
  console.error("Missing CONTENT_IMPORT_TOKEN.");
  process.exit(1);
}

const extension = path.extname(absolutePath).replace(".", "").toLowerCase();
const response = await fetch(new URL("/api/internal/import/content", baseURL), {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-content-import-token": token,
  },
  body: JSON.stringify({
    format: extension,
    raw,
  }),
});

if (!response.ok) {
  console.error(`Import failed with status ${response.status}.`);
  console.error(await response.text());
  process.exit(1);
}

console.log(JSON.stringify(await response.json(), null, 2));
