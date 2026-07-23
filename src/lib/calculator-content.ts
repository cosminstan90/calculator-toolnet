import { getCalculatorDefinition, type CalculatorKey } from "./calculator-registry.ts";
import { pick } from "./content-variation.ts";

type FAQItem = {
  question: string;
  answer: string;
};

const cleanText = (value: string) => value.trim().replace(/\s+/g, " ");

const howQuestionPool = [
  (title: string) => `Cum functioneaza ${title.toLowerCase()}?`,
  (title: string) => `Ce calculeaza de fapt ${title.toLowerCase()}?`,
  (title: string) => `Pe ce se bazeaza rezultatul de la ${title.toLowerCase()}?`,
];

const interpretationAnswerPool = [
  (inputList: string) =>
    `Rezultatul e corect matematic pornind de la ${inputList} pe care le-ai introdus, dar sensul lui depinde de contextul tau real - nu il citi izolat de restul situatiei.`,
  (inputList: string) =>
    `Matematic, calculul e exact pentru ${inputList} completate. Ce faci mai departe cu numarul respectiv depinde insa de obiectivul tau concret.`,
  (inputList: string) =>
    `Formula proceseaza corect ${inputList}, insa rezultatul e un punct de plecare, nu un verdict - il interpretezi in functie de ce vrei sa decizi.`,
  (inputList: string) =>
    `Cifra afisata reflecta fidel ${inputList} pe care le-ai completat. Utilitatea ei reala apare cand o compari cu un reper sau cu un scenariu anterior.`,
];

const redoAnswerPool = [
  (title: string) =>
    `Refa calculul de fiecare data cand se schimba una dintre valorile de intrare - altfel ${title.toLowerCase()} iti arata un rezultat vechi, nu situatia actuala.`,
  (title: string) =>
    `Cel mai simplu reper: daca datele din formular nu mai reflecta realitatea, rezultatul lui ${title.toLowerCase()} nu mai e de incredere pana nu il actualizezi.`,
  (title: string) =>
    `Merita sa repeti calculul periodic, mai ales daca il folosesti pentru o decizie care se intinde pe mai mult timp - o singura rulare nu ramane valabila la nesfarsit.`,
  (title: string) =>
    `Nu exista un interval fix, dar orice schimbare relevanta in datele tale e un motiv bun sa rulezi din nou ${title.toLowerCase()} inainte sa te bazezi pe cifra veche.`,
];

const redoQuestionPool = [
  "Cand merita sa refac calculul?",
  "Rezultatul ramane valabil in timp?",
  "Trebuie sa recalculez des?",
];

const interpretationQuestionPool = [
  "Cum interpretez rezultatul?",
  "Ce inseamna, practic, cifra afisata?",
  "Pot sa ma bazez direct pe rezultat?",
];

const toInputList = (definition: ReturnType<typeof getCalculatorDefinition>) => {
  const labels = definition.inputs.map((input) => input.label.toLowerCase());

  if (labels.length === 0) {
    return "valorile completate";
  }

  if (labels.length === 1) {
    return labels[0];
  }

  return `${labels.slice(0, -1).join(", ")} si ${labels[labels.length - 1]}`;
};

export const buildDefaultCalculatorFaq = (
  key: CalculatorKey
): FAQItem[] => {
  const definition = getCalculatorDefinition(key);
  const inputList = toInputList(definition);

  return [
    {
      question: pick(key, howQuestionPool)(definition.title),
      answer: cleanText(definition.formulaDescription),
    },
    {
      question: pick(`${key}-interpret`, interpretationQuestionPool),
      answer: cleanText(pick(`${key}-interpret-a`, interpretationAnswerPool)(inputList)),
    },
    {
      question: pick(`${key}-redo`, redoQuestionPool),
      answer: cleanText(pick(`${key}-redo-a`, redoAnswerPool)(definition.title)),
    },
  ];
};

export const ensureCalculatorFaq = (
  key: CalculatorKey,
  faq: FAQItem[] | undefined
): FAQItem[] => {
  const normalized = (faq ?? [])
    .map((item) => ({
      question: typeof item.question === "string" ? cleanText(item.question) : "",
      answer: typeof item.answer === "string" ? cleanText(item.answer) : "",
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0);

  const seenQuestions = new Set(normalized.map((item) => item.question.toLowerCase()));

  for (const item of buildDefaultCalculatorFaq(key)) {
    if (seenQuestions.has(item.question.toLowerCase())) {
      continue;
    }

    normalized.push(item);
    seenQuestions.add(item.question.toLowerCase());
  }

  return normalized.slice(0, 5);
};
