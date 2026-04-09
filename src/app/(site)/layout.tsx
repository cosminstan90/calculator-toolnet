import { AdsToggle } from "@/components/ads-toggle";
import { absoluteURL, siteConfig } from "@/lib/site";
import { adsConfig } from "@/lib/ads";
import { GA4 } from "@/components/ga4";
import { GoogleAdSense } from "@/components/google-adsense";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listNavigationCategories } from "@/lib/content";
import type { Metadata } from "next";

import "../globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL(absoluteURL("/")),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? {
          "msvalidate.01": process.env.BING_SITE_VERIFICATION,
        }
      : undefined,
  },
};

const hasGaMeasurement = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
const hasAdSenseClient = Boolean(adsConfig.adsenseClient);
const shouldRenderAdsToggle = hasAdSenseClient && adsConfig.showToggle;

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await listNavigationCategories();

  return (
    <html lang="ro">
      <body className="editorial-shell min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader categories={categories} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          {hasGaMeasurement ? <GA4 /> : null}
          {hasAdSenseClient ? <GoogleAdSense /> : null}
          {shouldRenderAdsToggle ? <AdsToggle /> : null}
        </div>
      </body>
    </html>
  );
}
