import config from "@/cms.config";
import { RootLayout, metadata as payloadMetadata } from "@payloadcms/next/layouts";

import { importMap } from "./admin/importMap";
import { payloadAdminServerFunction } from "./serverFunction";

const configPromise = Promise.resolve(config);

export const metadata = payloadMetadata;

export default function PayloadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction: payloadAdminServerFunction,
  });
}
