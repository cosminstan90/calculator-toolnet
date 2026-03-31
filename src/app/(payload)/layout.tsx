import config from "@/cms.config";
import { RootLayout, metadata as payloadMetadata, handleServerFunctions } from "@payloadcms/next/layouts";

import { importMap } from "./admin/importMap";

const configPromise = Promise.resolve(config);

export const metadata = payloadMetadata;

export default function PayloadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction: (args) =>
      handleServerFunctions({
        ...args,
        config: configPromise,
        importMap,
      }),
  });
}
