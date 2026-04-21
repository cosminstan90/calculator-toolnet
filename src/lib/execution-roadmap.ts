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
    goal: "Publicam si deblocam paginile tier-1 din cele 3 clustere principale.",
    focusesOn: ["credite-si-economii", "energie-pentru-casa", "imobiliare"],
    completionRule: [
      "paginile tier-1 existente sunt publicate sau ready-now",
      "fiecare cluster are hub bun, minim 2 calculatoare puternice si 1 articol puternic",
    ],
  },
  {
    id: "sprint-2",
    title: "Internal Linking + Cluster Strength",
    goal: "Legam hub-urile, articolele si calculatoarele intr-un traseu editorial complet.",
    focusesOn: ["hub-uri", "articole tier-1", "calculatoare complementare"],
    completionRule: [
      "fiecare pagina tier-1 are link spre hub, calculator principal si calculator complementar",
      "exista cel putin un content gap real recuperat",
    ],
  },
  {
    id: "sprint-3",
    title: "Content Expansion Tier-2",
    goal: "Completam nucleul clusterelor cu pagini tier-2 care cresc autoritatea tematica.",
    focusesOn: ["calculatoare tier-2", "articole tier-2", "subtopicuri lipsa"],
    completionRule: [
      "fiecare cluster are 4-6 pagini puternice live",
      "missing core pages scad semnificativ in fiecare cluster",
    ],
  },
  {
    id: "sprint-4",
    title: "Monetization Readiness",
    goal: "Separam paginile de trafic de cele cu intentie comerciala si pregatim monetizarea.",
    focusesOn: ["high-intent pages", "support pages", "monetization candidates"],
    completionRule: [
      "exista lista clara de money pages si support pages",
      "tracking-ul si maparea CTA-urilor sunt pregatite",
    ],
  },
];

