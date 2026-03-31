import config from "@/cms.config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
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
  return RootPage({
    config: configPromise,
    importMap,
    params: params.then((resolved) => ({
      segments: resolved.segments ?? [],
    })),
    searchParams,
  });
}
