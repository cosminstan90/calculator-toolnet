import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SPRINT_3_CONTENT_RULES, SPRINT_3_PRIORITY_CLUSTERS, SPRINT_3_TIER_2_TARGETS } from "../src/lib/sprint-3.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

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

      resolve(stdout.trim());
    });
  });

const extractLastJson = (raw) => {
  const lastBrace = raw.lastIndexOf("\n{");
  const jsonText = lastBrace >= 0 ? raw.slice(lastBrace + 1) : raw.slice(raw.indexOf("{"));
  return JSON.parse(jsonText);
};

const sprintBRaw = await runNodeCommand(
  { label: "sprint-b", args: ["--import", "tsx", "scripts/sprint-b.mjs", "--limit=30"] },
);
const sprintB = extractLastJson(sprintBRaw);

const roadmap = sprintB.roadmap ?? [];
const tier2Pages = roadmap.filter((page) => page.priorityTier === "tier-2");
const clusters = sprintB.clusters ?? [];

const clusterTargets = SPRINT_3_PRIORITY_CLUSTERS.map((clusterSlug) => {
  const clusterPages = tier2Pages.filter((page) => page.cluster === clusterSlug);
  const preferred = new Set(SPRINT_3_TIER_2_TARGETS[clusterSlug] ?? []);
  const clusterSummary = clusters.find((cluster) => cluster.slug === clusterSlug);

  const priorityTargets = clusterPages
    .filter((page) => preferred.has(page.slug))
    .map((page) => ({
      slug: page.slug,
      kind: page.kind,
      status: page.status,
      blockers: page.blockers ?? [],
    }));

  return {
    cluster: clusterSlug,
    missingCoreCalculators: clusterSummary?.missingCoreCalculators ?? [],
    missingCoreArticles: clusterSummary?.missingCoreArticles ?? [],
    priorityTargets,
  };
});

const blockedTargets = clusterTargets.flatMap((cluster) =>
  cluster.priorityTargets
    .filter((page) => page.status === "blocked" || page.status === "missing")
    .map((page) => ({
      cluster: cluster.cluster,
      ...page,
    })),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "sprint-3-batch",
      checkedAt: new Date().toISOString(),
      summary: {
        tier2Pages: tier2Pages.length,
        readyOrPublished: tier2Pages.filter((page) => page.status === "ready-now" || page.status === "published").length,
        blockedOrMissing: blockedTargets.length,
      },
      clusters: clusterTargets,
      contentRules: SPRINT_3_CONTENT_RULES,
      nextMoves: blockedTargets.slice(0, 8).map((page) => `${page.cluster}: ${page.kind} ${page.slug}`),
    },
    null,
    2,
  ),
);
