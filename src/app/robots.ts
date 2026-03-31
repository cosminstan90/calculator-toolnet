import { absoluteURL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/internal"],
      },
    ],
    sitemap: absoluteURL("/sitemap_index.xml"),
  };
}
