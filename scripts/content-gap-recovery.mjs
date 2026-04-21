import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SPRINT_B_GLOBAL_GAPS } from "../src/lib/seo-roadmap.ts";
import { SPRINT_2_CONTENT_GAP_TARGETS } from "../src/lib/sprint-2.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const runNodeCommand = (args, label) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
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
        reject(new Error(`${label} failed with code ${code}\n${stderr}`));
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
  ["--import", "tsx", "scripts/sprint-b.mjs", "--limit=30"],
  "sprint-b",
);
const sprintB = extractLastJson(sprintBRaw);

const from404 = sprintB.globalContentGaps?.from404 ?? [];
const strategicGaps = [...SPRINT_B_GLOBAL_GAPS, ...SPRINT_2_CONTENT_GAP_TARGETS];

const plannedGapSlugs = new Set(strategicGaps.map((gap) => gap.slug));
const recoveryBacklog = from404.map((gap) => ({
  path: gap.path,
  hits: gap.hits,
  lastSeenAt: gap.lastSeenAt,
  alreadyPlanned: plannedGapSlugs.has(String(gap.path).replace(/^\//, "")),
}));

const plannedTargets = strategicGaps.map((gap) => {
  const matching404 = recoveryBacklog.find(
    (entry) => entry.path === gap.targetPath || entry.path === `/${gap.slug}`,
  );

  return {
    slug: gap.slug,
    title: gap.title,
    targetPath: gap.targetPath ?? `/${gap.slug}`,
    reason: gap.reason,
    seenIn404: Boolean(matching404),
    hits: matching404?.hits ?? 0,
    recoveryPriority: matching404 ? "recover-now" : "planned",
  };
});

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "content-gap-recovery",
      checkedAt: new Date().toISOString(),
      summary: {
        top404ContentGaps: recoveryBacklog.length,
        plannedTargets: plannedTargets.length,
        recoverNow: plannedTargets.filter((gap) => gap.recoveryPriority === "recover-now").length,
      },
      plannedTargets,
      from404: recoveryBacklog,
      nextMoves: [
        ...plannedTargets
          .filter((gap) => gap.recoveryPriority === "recover-now")
          .map((gap) => `creeaza sau redirectioneaza ${gap.targetPath}`),
        ...recoveryBacklog
          .filter((gap) => !gap.alreadyPlanned)
          .slice(0, 3)
          .map((gap) => `evalueaza gap-ul ${gap.path}`),
      ].slice(0, 8),
    },
    null,
    2,
  ),
);
