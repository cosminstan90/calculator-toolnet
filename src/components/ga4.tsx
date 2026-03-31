"use client";

import Script from "next/script";

const measurementID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const GA4 = () => {
  if (!measurementID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementID}');
        `}
      </Script>
    </>
  );
};
