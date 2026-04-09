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
  };

  for (const arg of args) {
    if (arg.startsWith("--base-url=")) {
      config.baseURL = arg.slice("--base-url=".length);
    }
  }

  return config;
};

const buildChecks = (baseURL) => {
  const contentHealthToken = process.env.CONTENT_HEALTH_TOKEN;
  const opsHealthToken = process.env.OPS_HEALTH_TOKEN ?? contentHealthToken;

  return [
    { name: "home", path: "/", expectedStatuses: [200] },
    { name: "calculators-hub", path: "/calculatoare", expectedStatuses: [200] },
    { name: "blog-hub", path: "/blog", expectedStatuses: [200] },
    { name: "admin", path: "/admin", expectedStatuses: [200, 302, 307, 308] },
    ...(contentHealthToken
      ? [
          {
            name: "content-health",
            path: "/api/health/content",
            expectedStatuses: [200],
            headers: { "x-health-token": contentHealthToken },
          },
        ]
      : []),
    ...(opsHealthToken
      ? [
          {
            name: "ops-health",
            path: "/api/health/ops",
            expectedStatuses: [200],
            headers: { "x-health-token": opsHealthToken },
          },
        ]
      : []),
  ].map((check) => ({
    ...check,
    url: new URL(check.path, baseURL).toString(),
  }));
};

const runCheck = async (check) => {
  const startedAt = performance.now();
  const response = await fetch(check.url, {
    method: "GET",
    headers: check.headers,
    redirect: "manual",
  });
  const durationMs = Number((performance.now() - startedAt).toFixed(2));

  return {
    name: check.name,
    url: check.url,
    status: response.status,
    ok: check.expectedStatuses.includes(response.status),
    durationMs,
    contentType: response.headers.get("content-type") ?? "",
    cacheControl: response.headers.get("cache-control") ?? "",
    location: response.headers.get("location") ?? "",
  };
};

await loadEnvFile();

const { baseURL } = parseArgs();
const checks = buildChecks(baseURL);
const results = [];

for (const check of checks) {
  try {
    results.push(await runCheck(check));
  } catch (error) {
    results.push({
      name: check.name,
      url: check.url,
      ok: false,
      status: 0,
      durationMs: 0,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const failed = results.filter((result) => !result.ok);
const report = {
  ok: failed.length === 0,
  action: "smoke-check",
  checkedAt: new Date().toISOString(),
  baseURL,
  results,
};

console.log(JSON.stringify(report, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
