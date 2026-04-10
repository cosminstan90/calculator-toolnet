import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { Articles } from "./cms/collections/Articles.ts";
import { AffiliateClickEvents } from "./cms/collections/AffiliateClickEvents.ts";
import { CalculatorCategories } from "./cms/collections/CalculatorCategories.ts";
import { Calculators } from "./cms/collections/Calculators.ts";
import { FormulaLibrary } from "./cms/collections/FormulaLibrary.ts";
import { NotFoundEvents } from "./cms/collections/NotFoundEvents.ts";
import { Redirects } from "./cms/collections/Redirects.ts";
import { Users } from "./cms/collections/Users.ts";
import { Homepage } from "./cms/globals/Homepage.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const isProduction = process.env.NODE_ENV === "production";

const databaseURL =
  process.env.DATABASE_URI ??
  "postgresql://postgres:postgres@127.0.0.1:5432/calculatoare_online";
const payloadSecret =
  process.env.PAYLOAD_SECRET ?? "replace-with-a-secure-production-secret";
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3015";
const isLocalServerURL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(serverURL);

if (
  isProduction &&
  !isLocalServerURL &&
  (!process.env.DATABASE_URI ||
    !process.env.PAYLOAD_SECRET ||
    process.env.PAYLOAD_SECRET === "replace-with-a-secure-production-secret")
) {
  throw new Error(
    "Production requires explicit DATABASE_URI and a strong PAYLOAD_SECRET."
  );
}

export default buildConfig({
  secret: payloadSecret,
  serverURL,
  cors: [serverURL],
  csrf: [serverURL],
  graphQL: {
    disablePlaygroundInProduction: true,
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: {
            path: "./app/(payload)/admin/DashboardHome.tsx",
            exportName: "DashboardHome",
          },
        },
      },
    },
    meta: {
      titleSuffix: " - Calculatoare CMS",
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    CalculatorCategories,
    FormulaLibrary,
    Calculators,
    Articles,
    AffiliateClickEvents,
    Redirects,
    NotFoundEvents,
  ],
  globals: [Homepage],
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
