import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const commands = [
  {
    label: "ops-report",
    args: ["--import", "tsx", "scripts/ops-report.mjs"],
  },
  {
    label: "queue-worklist",
    args: ["--import", "tsx", "scripts/queue-worklist.mjs", "--limit=20"],
  },
  {
    label: "queue-today",
    args: ["--import", "tsx", "scripts/queue-today.mjs"],
  },
];

const runNodeCommand = (entry) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, entry.args, {
      cwd: rootDir,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${entry.label} failed with code ${code}\n${stderr}`));
        return;
      }

      resolve({
        label: entry.label,
        stdout: stdout.trim(),
      });
    });
  });

const extractLastJson = (raw) => {
  const lastBrace = raw.lastIndexOf("\n{");
  const jsonText = lastBrace >= 0 ? raw.slice(lastBrace + 1) : raw.slice(raw.indexOf("{"));
  return JSON.parse(jsonText);
};

const results = [];
for (const command of commands) {
  results.push(await runNodeCommand(command));
}

const report = extractLastJson(results.find((entry) => entry.label === "ops-report").stdout);
const worklist = extractLastJson(results.find((entry) => entry.label === "queue-worklist").stdout);
const today = extractLastJson(results.find((entry) => entry.label === "queue-today").stdout);

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "sprint-a",
      checkedAt: new Date().toISOString(),
      publishingQueue: report.publishingQueue,
      queueWorklist: worklist,
      today,
      nextActions: [
        "valideaza manual readyNow",
        "ruleaza queue-complete pentru documentele revizuite",
        "ia blockedButClose ca lotul urmator",
        "ia needsEditorialReview ca backlog pentru editor",
      ],
    },
    null,
    2,
  ),
);
