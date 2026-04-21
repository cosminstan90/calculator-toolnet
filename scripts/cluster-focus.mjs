import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const clusterFilter = getCliArg("cluster");

const commands = [
  {
    label: "cluster-execution",
    args: ["--import", "tsx", "scripts/cluster-execution.mjs"],
  },
  {
    label: "page-execution",
    args: ["--import", "tsx", "scripts/page-execution.mjs"],
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

const clusterExecution = extractLastJson(
  results.find((entry) => entry.label === "cluster-execution").stdout,
);
const pageExecution = extractLastJson(
  results.find((entry) => entry.label === "page-execution").stdout,
);

const clusters = (clusterExecution.clusters ?? []).filter((cluster) =>
  clusterFilter ? cluster.cluster === clusterFilter : true,
);

const detailedClusters = clusters.map((cluster) => ({
  cluster: cluster.cluster,
  sprint1Ready: cluster.sprint1Ready,
  sprint1Blocked: cluster.sprint1Blocked,
  linkingTasks: cluster.sprint2LinkingTasks ?? [],
  tier2Targets: (cluster.sprint3PriorityTargets ?? []).filter(
    (item) => item.status === "blocked" || item.status === "missing",
  ),
  tier1Queue: (pageExecution.tier1Queue ?? []).filter((page) => page.cluster === cluster.cluster),
  tier2Queue: (pageExecution.tier2Queue ?? []).filter((page) => page.cluster === cluster.cluster),
  nextMoves: cluster.nextMoves ?? [],
}));

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "cluster-focus",
      checkedAt: new Date().toISOString(),
      cluster: clusterFilter ?? "all",
      summary: {
        clusters: detailedClusters.length,
        tier1Pages: detailedClusters.reduce((total, cluster) => total + cluster.tier1Queue.length, 0),
        tier2Pages: detailedClusters.reduce((total, cluster) => total + cluster.tier2Queue.length, 0),
        linkingTasks: detailedClusters.reduce((total, cluster) => total + cluster.linkingTasks.length, 0),
      },
      clusters: detailedClusters,
      nextMoves: detailedClusters.flatMap((cluster) => cluster.nextMoves).slice(0, 12),
    },
    null,
    2,
  ),
);
