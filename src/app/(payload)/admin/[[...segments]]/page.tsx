import config from "@/cms.config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { redirect } from "next/navigation";
import "@payloadcms/next/css";

import { importMap } from "../importMap";

type Params = Promise<{
  segments?: string[];
}>;

type SearchParams = Promise<{
  [key: string]: string | string[];
}>;

const configPromise = Promise.resolve(config);

export const generateMetadata = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  return generatePageMetadata({
    config: configPromise,
    params: params.then((resolved) => ({
      segments: resolved.segments ?? [],
    })),
    searchParams,
  });
};

export default async function PayloadAdminPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const segments = resolvedParams.segments ?? [];

  if (segments.length === 0) {
    const resolvedConfig = await configPromise;
    const adminRoute =
      resolvedConfig.routes.admin === "/" ? "" : resolvedConfig.routes.admin.replace(/\/$/, "");

    redirect(`${adminRoute}/collections/calculators`);
  }

  return RootPage({
    config: configPromise,
    importMap,
    params: Promise.resolve({
      segments,
    }),
    searchParams,
  });
}
