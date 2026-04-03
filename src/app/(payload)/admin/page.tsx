import config from "@/cms.config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import "@payloadcms/next/css";

import { importMap } from "./importMap";

type SearchParams = Promise<{
  [key: string]: string | string[];
}>;

const configPromise = Promise.resolve(config);

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  return generatePageMetadata({
    config: configPromise,
    params: Promise.resolve({
      segments: [],
    }),
    searchParams,
  });
};

export default function PayloadAdminIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return RootPage({
    config: configPromise,
    importMap,
    params: Promise.resolve({
      segments: [],
    }),
    searchParams,
  });
}
