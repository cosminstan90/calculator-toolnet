import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const commands = [
  {
    label: "sprint-1-batch",
    args: ["--import", "tsx", "scripts/sprint-1-batch.mjs"],
  },
  {
    label: "sprint-2-batch",
    args: ["--import", "tsx", "scripts/sprint-2-batch.mjs"],
  },
  {
    label: "sprint-3-batch",
    args: ["--import", "tsx", "scripts/sprint-3-batch.mjs"],
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

const sprint1 = extractLastJson(results.find((entry) => entry.label === "sprint-1-batch").stdout);
const sprint2 = extractLastJson(results.find((entry) => entry.label === "sprint-2-batch").stdout);
const sprint3 = extractLastJson(results.find((entry) => entry.label === "sprint-3-batch").stdout);

const clusterMap = new Map();

for (const cluster of sprint3.clusters ?? []) {
  clusterMap.set(cluster.cluster, {
    cluster: cluster.cluster,
    sprint1Ready: 0,
    sprint1Blocked: 0,
    sprint2LinkingTasks: [],
    sprint3PriorityTargets: cluster.priorityTargets ?? [],
    missingCoreCalculators: cluster.missingCoreCalculators ?? [],
    missingCoreArticles: cluster.missingCoreArticles ?? [],
  });
}

for (const item of sprint2.nextLinkingTasks ?? []) {
  const current = clusterMap.get(item.cluster) ?? {
    cluster: item.cluster,
    sprint1Ready: 0,
    sprint1Blocked: 0,
    sprint2LinkingTasks: [],
    sprint3PriorityTargets: [],
    missingCoreCalculators: [],
    missingCoreArticles: [],
  };
  current.sprint2LinkingTasks.push(item);
  clusterMap.set(item.cluster, current);
}

for (const entry of sprint1.readyNow ?? []) {
  const cluster = entry.cluster ?? "necunoscut";
  const current = clusterMap.get(cluster) ?? {
    cluster,
    sprint1Ready: 0,
    sprint1Blocked: 0,
    sprint2LinkingTasks: [],
    sprint3PriorityTargets: [],
    missingCoreCalculators: [],
    missingCoreArticles: [],
  };
  current.sprint1Ready += 1;
  clusterMap.set(cluster, current);
}

for (const entry of sprint1.blocked ?? []) {
  const cluster = entry.cluster ?? "necunoscut";
  const current = clusterMap.get(cluster) ?? {
    cluster,
    sprint1Ready: 0,
    sprint1Blocked: 0,
    sprint2LinkingTasks: [],
    sprint3PriorityTargets: [],
    missingCoreCalculators: [],
    missingCoreArticles: [],
  };
  current.sprint1Blocked += 1;
  clusterMap.set(cluster, current);
}

const clusters = Array.from(clusterMap.values()).map((cluster) => ({
  ...cluster,
  nextMoves: [
    ...cluster.sprint2LinkingTasks
      .slice(0, 2)
      .map((item) => `linking pentru ${item.slug}`),
    ...cluster.sprint3PriorityTargets
      .filter((item) => item.status === "blocked" || item.status === "missing")
      .slice(0, 2)
      .map((item) => `tier-2: ${item.slug}`),
  ].slice(0, 4),
}));

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "cluster-execution",
      checkedAt: new Date().toISOString(),
      summary: {
        clusters: clusters.length,
        withLinkingWork: clusters.filter((cluster) => cluster.sprint2LinkingTasks.length > 0).length,
        withTier2Work: clusters.filter((cluster) =>
          cluster.sprint3PriorityTargets.some((item) => item.status === "blocked" || item.status === "missing"),
        ).length,
      },
      clusters,
    },
    null,
    2,
  ),
);
