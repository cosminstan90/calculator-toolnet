/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const loadDotEnv = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((accumulator, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return accumulator;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      accumulator[key] = value;
      return accumulator;
    }, {});
};

const envFromFile = loadDotEnv(path.join(__dirname, ".env"));
const readEnv = (key) => process.env[key] || envFromFile[key];
const appNodeEnv = readEnv("NODE_ENV") || "production";
const contentHealthToken = readEnv("CONTENT_HEALTH_TOKEN");
const opsHealthToken = readEnv("OPS_HEALTH_TOKEN") || contentHealthToken;

if (appNodeEnv === "production" && !contentHealthToken) {
  throw new Error(
    "CONTENT_HEALTH_TOKEN is required in production before starting PM2.",
  );
}

module.exports = {
  apps: [
    {
      name: "calculatoare-online",
      script: ".next/standalone/server.js",
      interpreter: "node",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3015",
        HOSTNAME: "127.0.0.1",
        CONTENT_HEALTH_TOKEN: contentHealthToken,
        OPS_HEALTH_TOKEN: opsHealthToken,
      },
    },
  ],
};
