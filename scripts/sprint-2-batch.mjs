import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SPRINT_2_HUBS } from "../src/lib/sprint-2.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const commands = [
  {
    label: "sprint-b",
    args: ["--import", "tsx", "scripts/sprint-b.mjs", "--limit=30"],
  },
  {
    label: "internal-linking-audit",
    args: ["--import", "tsx", "scripts/internal-linking-audit.mjs"],
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

const sprintB = extractLastJson(results.find((entry) => entry.label === "sprint-b").stdout);
const linkingAudit = extractLastJson(
  results.find((entry) => entry.label === "internal-linking-audit").stdout,
);

const tier1Pages = (sprintB.roadmap ?? []).filter((page) => page.priorityTier === "tier-1");
const blockedTier1 = tier1Pages.filter((page) => page.status === "blocked");
const readyTier1 = tier1Pages.filter((page) => page.status === "ready-now" || page.status === "published");
const missingLinks = (linkingAudit.results ?? []).filter((item) => item.status === "missing-links");
const missingDocs = (linkingAudit.results ?? []).filter((item) => item.status === "missing");

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "sprint-2-batch",
      checkedAt: new Date().toISOString(),
      hubs: SPRINT_2_HUBS,
      summary: {
        tier1ReadyOrPublished: readyTier1.length,
        tier1Blocked: blockedTier1.length,
        linkingMissing: missingLinks.length,
        missingDocs: missingDocs.length,
      },
      nextLinkingTasks: missingLinks.slice(0, 10).map((item) => ({
        slug: item.slug,
        kind: item.kind,
        cluster: item.cluster,
        missingLinks: item.missingLinks,
      })),
      nextHubTasks: (sprintB.clusters ?? []).map((cluster) => ({
        cluster: cluster.slug,
        nextReadyDocs: cluster.nextReadyDocs?.slice(0, 3) ?? [],
        blockedButClose: cluster.blockedButClose?.slice(0, 3) ?? [],
      })),
      nextMoves: [
        ...missingLinks.slice(0, 5).map((item) => `${item.kind}: adauga linking pentru ${item.slug}`),
        ...blockedTier1.slice(0, 5).map((item) => `${item.kind}: deblocheaza ${item.slug}`),
        ...missingDocs.slice(0, 2).map((item) => `${item.kind}: document lipsa ${item.slug}`),
      ].slice(0, 12),
    },
    null,
    2,
  ),
);
