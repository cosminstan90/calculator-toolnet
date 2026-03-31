import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const copyIfExists = async (sourceRelativePath, destinationRelativePath) => {
  const sourcePath = path.join(rootDir, sourceRelativePath);
  const destinationPath = path.join(rootDir, destinationRelativePath);

  try {
    await fs.access(sourcePath);
  } catch {
    return false;
  }

  await fs.rm(destinationPath, { force: true, recursive: true });
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.cp(sourcePath, destinationPath, { recursive: true });
  return true;
};

const copiedStatic = await copyIfExists(".next/static", ".next/standalone/.next/static");
const copiedPublic = await copyIfExists("public", ".next/standalone/public");

console.log(
  JSON.stringify(
    {
      ok: true,
      action: "prepare-standalone",
      copiedPublic,
      copiedStatic,
    },
    null,
    2,
  ),
);
