import type { Audience } from "@/lib/content";

export type CommercialCta = {
  label: string;
  href: string;
  title: string;
  body: string;
  disclaimer?: string;
};

type OfferKey = "finance" | "business" | "energy" | "auto" | "construction";

const affiliateDestinations: Record<OfferKey, string> = {
  finance:
    process.env.AFFILIATE_FINANCE_URL ??
    process.env.NEXT_PUBLIC_AFFILIATE_FINANCE_URL ??
    "",
  business:
    process.env.AFFILIATE_BUSINESS_URL ??
    process.env.NEXT_PUBLIC_AFFILIATE_BUSINESS_URL ??
    "",
  energy:
    process.env.AFFILIATE_ENERGY_URL ??
    process.env.NEXT_PUBLIC_AFFILIATE_ENERGY_URL ??
    "",
  auto:
    process.env.AFFILIATE_AUTO_URL ??
    process.env.NEXT_PUBLIC_AFFILIATE_AUTO_URL ??
    "",
  construction:
    process.env.AFFILIATE_CONSTRUCTION_URL ??
    process.env.NEXT_PUBLIC_AFFILIATE_CONSTRUCTION_URL ??
    "",
} as const;

const categoryOfferMap: Partial<Record<string, OfferKey>> = {
  finante: "finance",
  "salarii-si-taxe": "finance",
  "credite-si-economii": "finance",
  business: "business",
  energie: "energy",
  "energie-pentru-casa": "energy",
  auto: "auto",
  constructii: "construction",
};

const audienceLabel = (audience: Audience) => {
  if (audience === "consumer") {
    return "pentru persoane";
  }

  if (audience === "business") {
    return "pentru firme";
  }

  return "pentru persoane si firme";
};

export const getAffiliateDestination = (offerKey: string) => {
  if (!(offerKey in affiliateDestinations)) {
    return "";
  }

  return affiliateDestinations[offerKey as OfferKey];
};

const buildTrackingHref = (args: {
  offerKey: OfferKey;
  sourcePath: string;
  sourceType: "calculator" | "article" | "category";
  audience: Audience;
  categorySlug?: string;
}) => {
  const params = new URLSearchParams({
    source: args.sourcePath,
    kind: args.sourceType,
    audience: args.audience,
  });

  if (args.categorySlug) {
    params.set("category", args.categorySlug);
  }

  return `/go/${args.offerKey}?${params.toString()}`;
};

export const getCommercialCta = (args: {
  categorySlug?: string;
  audience: Audience;
  kind: "calculator" | "article" | "category";
  sourcePath: string;
}): CommercialCta | null => {
  const offerKey = args.categorySlug ? categoryOfferMap[args.categorySlug] : undefined;

  if (!offerKey || !getAffiliateDestination(offerKey)) {
    return null;
  }

  const href = buildTrackingHref({
    offerKey,
    sourcePath: args.sourcePath,
    sourceType: args.kind,
    audience: args.audience,
    categorySlug: args.categorySlug,
  });

  if (offerKey === "finance") {
    return {
      label:
        args.kind === "category"
          ? "Compara ofertele relevante"
          : "Vezi oferta recomandata",
      href,
      title:
        args.kind === "category"
          ? "Daca vrei sa treci de la simulare la compararea ofertelor reale"
          : args.kind === "calculator"
          ? "Daca vrei sa mergi de la estimare la oferta concreta"
          : "Daca vrei sa compari si o oferta concreta",
      body: `Pagina este construita ${audienceLabel(args.audience)}, iar dupa calcul poate fi util sa compari si o oferta reala din piata pentru credite, economii sau produse financiare.`,
      disclaimer:
        "Unele recomandari pot fi afiliate. Alege doar dupa ce compari conditiile reale, costurile si eligibilitatea.",
    };
  }

  if (offerKey === "business") {
    return {
      label: "Vezi solutia recomandata",
      href,
      title: "Daca vrei sa treci de la calcul la implementare",
      body:
        "Dupa marja, markup, ROI sau break-even, urmatorul pas natural este sa compari si un instrument sau serviciu care te ajuta sa aplici decizia in operare.",
      disclaimer:
        "Recomandarea poate include link afiliat. Verifica potrivirea cu dimensiunea firmei, procesele si costurile tale reale.",
    };
  }

  if (offerKey === "energy") {
    return {
      label: "Compara optiunile",
      href,
      title: "Daca vrei sa compari si produse sau servicii relevante",
      body:
        "Dupa estimarea consumului sau a costului, poate fi util sa vezi si o oferta concreta pentru echipamente, solutii energetice sau furnizori relevanti.",
      disclaimer:
        "Unele recomandari pot fi afiliate. Verifica specificatiile tehnice si costul total inainte de alegere.",
    };
  }

  if (offerKey === "auto") {
    return {
      label: "Vezi recomandarea",
      href,
      title: "Daca vrei sa compari si o optiune practica din piata",
      body:
        "Pe paginile auto, dupa estimarea costului sau a consumului, urmatorul pas firesc poate fi compararea unei oferte, a unui serviciu sau a unui produs relevant.",
      disclaimer:
        "Linkul poate fi afiliat. Compara pretul final, conditiile si disponibilitatea inainte sa iei o decizie.",
    };
  }

  return {
    label: "Vezi ofertele utile",
    href,
    title: "Daca vrei sa mergi de la estimare la achizitie",
    body:
      "Dupa ce ai o estimare de materiale sau cost, poate fi util sa compari si produse sau servicii concrete legate de lucrarea ta.",
    disclaimer:
      "Linkul poate fi afiliat. Verifica acoperirea, consumul real si conditiile de livrare inainte de comanda.",
  };
};
