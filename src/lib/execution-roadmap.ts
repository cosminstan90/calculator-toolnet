export type ExecutionSprint = {
  id: "sprint-1" | "sprint-2" | "sprint-3" | "sprint-4";
  title: string;
  goal: string;
  focusesOn: string[];
  completionRule: string[];
};

export const EXECUTION_SPRINTS: ExecutionSprint[] = [
  {
    id: "sprint-1",
    title: "Tier-1 Publishing",
    goal: "Publicăm și deblocăm paginile tier-1 din cele 3 clustere principale.",
    focusesOn: ["credite-si-economii", "energie-pentru-casa", "imobiliare"],
    completionRule: [
      "paginile tier-1 existente sunt publicate sau ready-now",
      "fiecare cluster are hub bun, minim 2 calculatoare puternice și 1 articol puternic",
    ],
  },
  {
    id: "sprint-2",
    title: "Internal Linking + Cluster Strength",
    goal: "Legăm hub-urile, articolele și calculatoarele într-un traseu editorial complet.",
    focusesOn: ["hub-uri", "articole tier-1", "calculatoare complementare"],
    completionRule: [
      "fiecare pagină tier-1 are link spre hub, calculator principal și calculator complementar",
      "există cel puțin un content gap real recuperat",
    ],
  },
  {
    id: "sprint-3",
    title: "Content Expansion Tier-2",
    goal: "Completăm nucleul clusterelor cu pagini tier-2 care cresc autoritatea tematică.",
    focusesOn: ["calculatoare tier-2", "articole tier-2", "subtopicuri lipsă"],
    completionRule: [
      "fiecare cluster are 4-6 pagini puternice live",
      "missing core pages scad semnificativ în fiecare cluster",
    ],
  },
  {
    id: "sprint-4",
    title: "Monetization Readiness",
    goal: "Separăm paginile de trafic de cele cu intenție comercială și pregătim monetizarea.",
    focusesOn: ["high-intent pages", "support pages", "monetization candidates"],
    completionRule: [
      "există listă clară de money pages și support pages",
      "tracking-ul și maparea CTA-urilor sunt pregătite",
    ],
  },
];

