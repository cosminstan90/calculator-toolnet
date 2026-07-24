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
  imobiliare: "finance",
  afaceri: "business",
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

  return "pentru persoane și firme";
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
          ? "Compară ofertele relevante"
          : "Vezi oferta recomandată",
      href,
      title:
        args.kind === "category"
          ? "Dacă vrei să treci de la simulare la compararea ofertelor reale"
          : args.kind === "calculator"
          ? "Dacă vrei să mergi de la estimare la oferta concretă"
          : "Dacă vrei să compari și o ofertă concretă",
      body: `Pagina este construită ${audienceLabel(args.audience)}, iar după calcul poate fi util să compari și o ofertă reală din piață pentru credite, economii sau produse financiare.`,
      disclaimer:
        "Unele recomandări pot fi afiliate. Alege doar după ce compari condițiile reale, costurile și eligibilitatea.",
    };
  }

  if (offerKey === "business") {
    return {
      label: "Vezi soluția recomandată",
      href,
      title: "Dacă vrei să treci de la calcul la implementare",
      body:
        "După marjă, markup, ROI sau break-even, următorul pas natural este să compari și un instrument sau serviciu care te ajută să aplici decizia în operare.",
      disclaimer:
        "Recomandarea poate include link afiliat. Verifică potrivirea cu dimensiunea firmei, procesele și costurile tale reale.",
    };
  }

  if (offerKey === "energy") {
    return {
      label: "Compară opțiunile",
      href,
      title: "Dacă vrei să compari și produse sau servicii relevante",
      body:
        "După estimarea consumului sau a costului, poate fi util să vezi și o ofertă concretă pentru echipamente, soluții energetice sau furnizori relevanți.",
      disclaimer:
        "Unele recomandări pot fi afiliate. Verifică specificațiile tehnice și costul total înainte de alegere.",
    };
  }

  if (offerKey === "auto") {
    return {
      label: "Vezi recomandarea",
      href,
      title: "Dacă vrei să compari și o opțiune practică din piață",
      body:
        "Pe paginile auto, după estimarea costului sau a consumului, următorul pas firesc poate fi compararea unei oferte, a unui serviciu sau a unui produs relevant.",
      disclaimer:
        "Linkul poate fi afiliat. Compară prețul final, condițiile și disponibilitatea înainte să iei o decizie.",
    };
  }

  return {
    label: "Vezi ofertele utile",
    href,
    title: "Dacă vrei să mergi de la estimare la achiziție",
    body:
      "După ce ai o estimare de materiale sau cost, poate fi util să compari și produse sau servicii concrete legate de lucrarea ta.",
    disclaimer:
      "Linkul poate fi afiliat. Verifică acoperirea, consumul real și condițiile de livrare înainte de comandă.",
  };
};
