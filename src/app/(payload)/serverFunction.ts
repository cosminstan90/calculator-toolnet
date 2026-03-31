import config from "@/cms.config";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import type { ServerFunctionClientArgs } from "payload";

import { importMap } from "./admin/importMap";

const configPromise = Promise.resolve(config);

export async function payloadAdminServerFunction(args: ServerFunctionClientArgs) {
  "use server";

  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
}
