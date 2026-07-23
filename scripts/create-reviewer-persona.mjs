import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const loadEnvFile = async () => {
  const envPath = path.join(rootDir, ".env");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value.replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    // Variables may also come from the shell / process manager.
  }
};

await loadEnvFile();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");
const bootstrapPath = path.join(rootDir, "src", "lib", "bootstrap.ts");
const registryPath = path.join(rootDir, "src", "lib", "calculator-registry.ts");

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const { getPayload } = await import("payload");
const { CALCULATOR_KEYS } = await import(pathToFileURL(registryPath).href);

const payload = await getPayload({ config });

const PERSONA = {
  name: "Andrei Popescu",
  email: "andrei.popescu@toolnet.ro",
  jobTitle: "Redactor calculatoare",
  bio: "Verifica formulele si claritatea explicatiilor pentru fiecare calculator publicat pe site, alaturi de echipa editoriala.",
  expertise: [{ label: "Verificare formule" }, { label: "Claritate continut" }],
};

try {
  const existing = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: { email: { equals: PERSONA.email } },
  });

  let userID = existing.docs[0]?.id;

  if (!userID) {
    const created = await payload.create({
      collection: "users",
      overrideAccess: true,
      data: {
        name: PERSONA.name,
        email: PERSONA.email,
        password: crypto.randomBytes(24).toString("hex"),
        jobTitle: PERSONA.jobTitle,
        bio: PERSONA.bio,
        expertise: PERSONA.expertise,
        roles: ["reviewer"],
      },
    });
    userID = created.id;
    console.log(`[persona] created user ${PERSONA.name} (id: ${userID})`);
  } else {
    console.log(`[persona] user already exists (id: ${userID})`);
  }

  const calculators = await payload.find({
    collection: "calculators",
    depth: 0,
    pagination: false,
    limit: 200,
    overrideAccess: true,
  });

  let updated = 0;
  let skipped = 0;

  for (const key of CALCULATOR_KEYS) {
    const doc = calculators.docs.find((entry) => entry.calculatorKey === key);
    if (!doc) {
      skipped += 1;
      continue;
    }

    await payload.update({
      collection: "calculators",
      id: doc.id,
      overrideAccess: true,
      draft: false,
      data: { reviewer: userID },
    });
    updated += 1;
  }

  console.log(`[persona] calculators updated: ${updated}, skipped: ${skipped}`);
} finally {
  await payload.destroy();
}
