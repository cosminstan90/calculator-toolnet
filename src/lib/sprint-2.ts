export const SPRINT_2_HUBS = [
  "/calculatoare/credite-si-economii",
  "/calculatoare/energie-pentru-casa",
  "/calculatoare/imobiliare",
] as const;

export const SPRINT_2_PRIORITY_ANCHORS = {
  "credite-si-economii": [
    "Vezi si costul total al creditului",
    "Compara rezultatul cu rata pe care o poti sustine",
    "Daca vrei scenariul complet, verifica si refinantarea",
  ],
  "energie-pentru-casa": [
    "Vezi cat inseamna asta in factura lunara",
    "Continua cu productia estimata",
    "Interpreteaza amortizarea intr-un ghid separat",
  ],
  imobiliare: [
    "Vezi costul total, nu doar pretul de lista",
    "Compara cu scenariul chirie versus cumparare",
    "Daca investesti, verifica si randamentul ramas dupa costuri",
  ],
} as const;

export const SPRINT_2_CONTENT_GAP_TARGETS = [
  {
    slug: "zile-libere-2026",
    title: "Zile libere 2026",
    targetPath: "/zile-libere-2026",
    reason: "Gap real din productie cu potential de trafic sezonier.",
  },
];
