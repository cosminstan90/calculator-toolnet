export const siteConfig = {
  name: "Calculatoare Online",
  shortName: "calculatoare-online",
  description:
    "Calculatoare online pentru fitness, auto, energie si conversii, cu formule explicate, exemple practice si continut util pentru decizii rapide.",
  locale: "ro_RO",
};

export const organizationConfig = {
  legalName: "Toolnet",
  projectName: "Calculatoare Online",
  supportEmail: "hello@toolnet.ro",
  correctionsEmail: "hello@toolnet.ro",
  partnershipsEmail: "hello@toolnet.ro",
  editorialEmail: "hello@toolnet.ro",
  trustSummary:
    "Calculatoare Online este un proiect Toolnet, construit pentru raspunsuri rapide, continut clar si revizie editoriala continua.",
};

export const creatorConfig = {
  name: "Cosmin Stan",
  url: "https://stancosmin.com",
};

export const editorialTeamRoles = [
  {
    title: "Coordonare editoriala",
    responsibility:
      "Stabileste calendarul de publicare, criteriile minime de calitate si aprobarea finala pentru paginile care ies din draft.",
  },
  {
    title: "Documentare si verificare",
    responsibility:
      "Verifica formulele, limitele de utilizare si consistenta explicatiilor dintre calculatoare, articole si FAQ.",
  },
  {
    title: "Structura SEO si linking intern",
    responsibility:
      "Urmareste arhitectura hub-urilor, relationarea dintre pagini si claritatea metadata-ului si a rutelor canonice.",
  },
  {
    title: "Feedback si corectii",
    responsibility:
      "Preia sesizarile de la utilizatori, prioritizeaza erorile raportate si urmareste remedierea lor in fluxul editorial.",
  },
] as const;

export const getServerURL = (): string => {
  return process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3015";
};

export const absoluteURL = (path = "/"): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getServerURL()}${normalizedPath}`;
};
