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
    `Rezultatul e corect matematic pornind de la ${inputList} pe care le-ai introdus, dar sensul lui depinde de contextul tau real. Doua persoane pot introduce date diferite si pot ajunge la aceeasi cifra, insa concluziile lor practice pot fi complet diferite - nu il citi izolat de restul situatiei tale.`,
  (inputList: string) =>
    `Matematic, calculul e exact pentru ${inputList} completate, asa ca poti avea incredere in cifra afisata ca atare. Ce faci mai departe cu acel numar depinde insa de obiectivul tau concret: aceeasi valoare poate fi un semnal bun pentru un scenariu si unul de atentie pentru altul.`,
  (inputList: string) =>
    `Formula proceseaza corect ${inputList}, insa rezultatul e un punct de plecare, nu un verdict final. Il interpretezi in functie de ce vrei sa decizi - o comparatie intre optiuni, o estimare pentru planificare sau doar o verificare rapida a unei presupuneri pe care o aveai deja.`,
  (inputList: string) =>
    `Cifra afisata reflecta fidel ${inputList} pe care le-ai completat, deci nu e nevoie sa te indoiesti de calculul in sine. Utilitatea ei reala apare insa cand o compari cu un reper cunoscut sau cu un scenariu anterior, nu cand o citesti izolat, fara niciun punct de comparatie.`,
];

const redoAnswerPool = [
  (title: string) =>
    `Refa calculul de fiecare data cand se schimba una dintre valorile de intrare - altfel ${title.toLowerCase()} iti arata un rezultat vechi, nu situatia actuala. Nu exista un interval fix de recalculare; conteaza doar cat de mult s-au schimbat datele reale fata de ultima rulare.`,
  (title: string) =>
    `Cel mai simplu reper: daca datele din formular nu mai reflecta realitatea - un pret nou, o greutate schimbata, un venit diferit - rezultatul lui ${title.toLowerCase()} nu mai e de incredere pana nu il actualizezi. Un calcul vechi cu date vechi poate induce in eroare mai mult decat lipsa oricarui calcul.`,
  (title: string) =>
    `Merita sa repeti calculul periodic, mai ales daca il folosesti pentru o decizie care se intinde pe mai mult timp - o singura rulare nu ramane valabila la nesfarsit. Pentru decizii mari, e util sa compari mai multe rulari facute la interval de cateva saptamani, nu doar una singura.`,
  (title: string) =>
    `Nu exista un interval fix, dar orice schimbare relevanta in datele tale e un motiv bun sa rulezi din nou ${title.toLowerCase()} inainte sa te bazezi pe cifra veche. Trateaza rezultatul ca pe o fotografie a momentului actual, nu ca pe o valoare fixa, valabila permanent.`,
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
