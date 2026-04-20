import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { EXECUTION_SPRINTS } from "../src/lib/execution-roadmap.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const sprintFilter = getCliArg("sprint");

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
  {
    label: "sprint-b",
    args: ["--import", "tsx", "scripts/sprint-b.mjs", "--limit=30"],
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

const makeStatus = (done, total) => {
  if (total === 0) return "not-started";
  if (done === 0) return "not-started";
  if (done >= total) return "complete";
  return "in-progress";
};

const deriveExecutionPlan = ({ report, worklist, today, sprintB }) => {
  const clusterRoadmap = sprintB.roadmap ?? [];
  const tier1Pages = clusterRoadmap.filter((page) => page.priorityTier === "tier-1");
  const tier2Pages = clusterRoadmap.filter((page) => page.priorityTier === "tier-2");
  const tier1Ready = tier1Pages.filter((page) => page.status === "ready-now" || page.status === "published");
  const tier2Ready = tier2Pages.filter((page) => page.status === "ready-now" || page.status === "published");
  const blockedButClose = worklist.blockedButClose ?? [];
  const contentGaps = sprintB.globalContentGaps?.from404 ?? [];

  const sprint1 = {
    ...EXECUTION_SPRINTS.find((item) => item.id === "sprint-1"),
    status: makeStatus(tier1Ready.length, tier1Pages.length),
    summary: {
      totalTier1Pages: tier1Pages.length,
      doneTier1Pages: tier1Ready.length,
      readyNow: worklist.readyNow?.length ?? 0,
      blockedButClose: blockedButClose.length,
    },
    nextActions: [
      ...blockedButClose.slice(0, 5).map((item) => `${item.collection}: ${item.slug}`),
      ...(today.today?.morningArticle ? [`publica azi dimineata: ${today.today.morningArticle.slug ?? today.today.morningArticle.title}`] : []),
      ...(today.today?.morningCalculator ? [`publica azi dimineata: ${today.today.morningCalculator.slug ?? today.today.morningCalculator.title}`] : []),
    ],
  };

  const sprint2 = {
    ...EXECUTION_SPRINTS.find((item) => item.id === "sprint-2"),
    status: tier1Ready.length >= Math.max(6, Math.floor(tier1Pages.length / 2)) ? "in-progress" : "not-started",
    summary: {
      clustersTracked: sprintB.clusters?.length ?? 0,
      readyClusters: (sprintB.clusters ?? []).filter((cluster) => cluster.ready?.calculators || cluster.readyCount > 0).length,
      contentGaps: contentGaps.length,
      internalLinkingTargets: sprintB.internalLinkingPriorities?.length ?? 0,
    },
    nextActions: [
      "aplica internal-linking-map pe paginile tier-1 publicate",
      ...(contentGaps[0] ? [`recupereaza content gap: ${contentGaps[0].path}`] : []),
      "valideaza sectiunile de next step in hub-uri",
    ],
  };

  const sprint3 = {
    ...EXECUTION_SPRINTS.find((item) => item.id === "sprint-3"),
    status: tier2Ready.length > 0 ? "in-progress" : "not-started",
    summary: {
      totalTier2Pages: tier2Pages.length,
      doneTier2Pages: tier2Ready.length,
      missingCorePages:
        (sprintB.clusters ?? []).reduce((total, cluster) => total + (cluster.missingCorePages ?? 0), 0),
    },
    nextActions: tier2Pages
      .filter((page) => page.status === "blocked" || page.status === "missing")
      .slice(0, 5)
      .map((page) => `${page.kind}: ${page.slug}`),
  };

  const sprint4 = {
    ...EXECUTION_SPRINTS.find((item) => item.id === "sprint-4"),
    status:
      report.affiliateClicks?.last7Days > 0 || (report.affiliateClicks?.totalSampled ?? 0) > 0
        ? "in-progress"
        : "not-started",
    summary: {
      affiliateClicksLast7Days: report.affiliateClicks?.last7Days ?? 0,
      topAffiliateOffers: report.affiliateClicks?.topOffers?.length ?? 0,
      candidateMoneyPages: tier1Pages.filter((page) => page.kind !== "hub").length,
    },
    nextActions: [
      "separa traffic pages de money pages",
      "mapeaza CTA-uri comerciale pe paginile tier-1 dupa publicare",
      "verifica affiliate funnel dupa ce cluster-ele sunt consolidate",
    ],
  };

  return [sprint1, sprint2, sprint3, sprint4];
};

const results = [];
for (const command of commands) {
  results.push(await runNodeCommand(command));
}

const report = extractLastJson(results.find((entry) => entry.label === "ops-report").stdout);
const worklist = extractLastJson(results.find((entry) => entry.label === "queue-worklist").stdout);
const today = extractLastJson(results.find((entry) => entry.label === "queue-today").stdout);
const sprintB = extractLastJson(results.find((entry) => entry.label === "sprint-b").stdout);

const executionPlan = deriveExecutionPlan({ report, worklist, today, sprintB });
const filteredPlan = sprintFilter
  ? executionPlan.filter((item) => item.id === sprintFilter)
  : executionPlan;

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "roadmap-execution",
      checkedAt: new Date().toISOString(),
      executionPlan: filteredPlan,
      currentFocus: filteredPlan[0]?.id ?? "sprint-1",
      nextMoves: filteredPlan.flatMap((item) => item.nextActions.slice(0, 3)).slice(0, 8),
    },
    null,
    2,
  ),
);
