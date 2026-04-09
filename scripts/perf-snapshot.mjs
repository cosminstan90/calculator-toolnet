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

const parseArgs = () => {
  const args = process.argv.slice(2);
  const config = {
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://127.0.0.1:3015",
    runs: 2,
  };

  for (const arg of args) {
    if (arg.startsWith("--base-url=")) {
      config.baseURL = arg.slice("--base-url=".length);
    } else if (arg.startsWith("--runs=")) {
      const parsed = Number(arg.slice("--runs=".length));
      if (Number.isFinite(parsed) && parsed > 0) {
        config.runs = parsed;
      }
    }
  }

  return config;
};

const defaultPaths = [
  "/",
  "/calculatoare",
  "/blog",
  "/despre-noi",
  "/contact",
];

const measure = async (url) => {
  const startedAt = performance.now();
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
  });
  const durationMs = Number((performance.now() - startedAt).toFixed(2));

  return {
    status: response.status,
    durationMs,
    cacheControl: response.headers.get("cache-control") ?? "",
    contentType: response.headers.get("content-type") ?? "",
  };
};

await loadEnvFile();

const { baseURL, runs } = parseArgs();
const results = [];

for (const pathname of defaultPaths) {
  const url = new URL(pathname, baseURL).toString();
  const runsForPath = [];

  for (let index = 0; index < runs; index += 1) {
    try {
      runsForPath.push(await measure(url));
    } catch (error) {
      runsForPath.push({
        status: 0,
        durationMs: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const successfulRuns = runsForPath.filter((entry) => entry.status >= 200 && entry.status < 400);
  const averageMs = successfulRuns.length
    ? Number(
        (
          successfulRuns.reduce((total, entry) => total + entry.durationMs, 0) /
          successfulRuns.length
        ).toFixed(2),
      )
    : 0;

  results.push({
    path: pathname,
    url,
    averageMs,
    runs: runsForPath,
  });
}

console.log(
  JSON.stringify(
    {
      ok: results.every((result) => result.runs.some((entry) => entry.status >= 200 && entry.status < 400)),
      action: "perf-snapshot",
      checkedAt: new Date().toISOString(),
      baseURL,
      runs,
      results,
    },
    null,
    2,
  ),
);
