import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SPRINT_4_CTA_SURFACES,
  SPRINT_4_MONEY_PAGE_PATTERNS,
  SPRINT_4_SUPPORT_PAGE_PATTERNS,
} from "../src/lib/sprint-4.ts";

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

const [opsReportRaw, sprintBRaw] = await Promise.all([
  runNodeCommand({ label: "ops-report", args: ["--import", "tsx", "scripts/ops-report.mjs"] }),
  runNodeCommand({ label: "sprint-b", args: ["--import", "tsx", "scripts/sprint-b.mjs", "--limit=30"] }),
]);

const report = extractLastJson(opsReportRaw);
const sprintB = extractLastJson(sprintBRaw);

const pages = (sprintB.roadmap ?? []).filter((page) => page.kind !== "hub");

const classifyPage = (page) => {
  const haystack = `${page.slug} ${page.title} ${page.intent} ${page.reason}`.toLowerCase();

  if (SPRINT_4_MONEY_PAGE_PATTERNS.some((pattern) => haystack.includes(pattern))) {
    return "money-page-candidate";
  }

  if (SPRINT_4_SUPPORT_PAGE_PATTERNS.some((pattern) => haystack.includes(pattern))) {
    return "support-page";
  }

  return "traffic-page";
};

const classifiedPages = pages.map((page) => ({
  cluster: page.cluster,
  kind: page.kind,
  slug: page.slug,
  title: page.title,
  status: page.status,
  classification: classifyPage(page),
}));

const moneyCandidates = classifiedPages.filter((page) => page.classification === "money-page-candidate");
const supportPages = classifiedPages.filter((page) => page.classification === "support-page");
const trafficPages = classifiedPages.filter((page) => page.classification === "traffic-page");

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "monetization-readiness",
      checkedAt: new Date().toISOString(),
      summary: {
        moneyCandidates: moneyCandidates.length,
        supportPages: supportPages.length,
        trafficPages: trafficPages.length,
        affiliateClicksLast7Days: report.affiliateClicks?.last7Days ?? 0,
      },
      ctaSurfaces: SPRINT_4_CTA_SURFACES,
      moneyCandidates: moneyCandidates.slice(0, 12),
      supportPages: supportPages.slice(0, 12),
      trafficPages: trafficPages.slice(0, 12),
      nextMoves: [
        ...moneyCandidates.slice(0, 5).map((page) => `pregateste CTA map pentru ${page.slug}`),
        ...supportPages.slice(0, 3).map((page) => `pastreaza ${page.slug} ca pagina de suport, fara CTA agresiv`),
      ].slice(0, 8),
    },
    null,
    2,
  ),
);
