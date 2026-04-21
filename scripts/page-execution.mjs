import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const commands = [
  {
    label: "sprint-b",
    args: ["--import", "tsx", "scripts/sprint-b.mjs", "--limit=30"],
  },
  {
    label: "sprint-2-batch",
    args: ["--import", "tsx", "scripts/sprint-2-batch.mjs"],
  },
  {
    label: "sprint-3-batch",
    args: ["--import", "tsx", "scripts/sprint-3-batch.mjs"],
  },
  {
    label: "monetization-readiness",
    args: ["--import", "tsx", "scripts/monetization-readiness.mjs"],
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
const sprint2 = extractLastJson(results.find((entry) => entry.label === "sprint-2-batch").stdout);
const sprint3 = extractLastJson(results.find((entry) => entry.label === "sprint-3-batch").stdout);
const monetization = extractLastJson(
  results.find((entry) => entry.label === "monetization-readiness").stdout,
);

const tier1Queue = (sprintB.roadmap ?? [])
  .filter((page) => page.priorityTier === "tier-1" && page.kind !== "hub")
  .map((page) => ({
    cluster: page.cluster,
    slug: page.slug,
    title: page.title,
    kind: page.kind,
    status: page.status,
    executionFocus:
      page.status === "blocked"
        ? "deblocare editoriala"
        : page.status === "ready-now"
          ? "publicare"
          : page.status === "published"
            ? "linking si consolidare"
            : "creare pagina",
  }));

const tier2Queue = (sprint3.clusters ?? []).flatMap((cluster) =>
  (cluster.priorityTargets ?? []).map((target) => ({
    cluster: cluster.cluster,
    slug: target.slug,
    kind: target.kind,
    status: target.status,
  })),
);

const linkingQueue = (sprint2.nextLinkingTasks ?? []).map((item) => ({
  cluster: item.cluster,
  slug: item.slug,
  kind: item.kind,
  missingLinks: item.missingLinks,
}));

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "page-execution",
      checkedAt: new Date().toISOString(),
      summary: {
        tier1Pages: tier1Queue.length,
        tier1NeedsWork: tier1Queue.filter((page) => page.status !== "published").length,
        tier2PriorityTargets: tier2Queue.length,
        linkingQueue: linkingQueue.length,
        moneyCandidates: monetization.moneyCandidates?.length ?? 0,
      },
      tier1Queue: tier1Queue.slice(0, 15),
      tier2Queue: tier2Queue.slice(0, 15),
      linkingQueue: linkingQueue.slice(0, 15),
      monetizationCandidates: monetization.moneyCandidates?.slice(0, 10) ?? [],
      nextMoves: [
        ...tier1Queue
          .filter((page) => page.status === "ready-now" || page.status === "blocked")
          .slice(0, 5)
          .map((page) => `${page.cluster}: ${page.executionFocus} pentru ${page.slug}`),
        ...linkingQueue
          .slice(0, 3)
          .map((page) => `${page.cluster}: completeaza linking pentru ${page.slug}`),
      ].slice(0, 10),
    },
    null,
    2,
  ),
);
