import { getCalculatorDefinition, type CalculatorKey } from "@/lib/calculator-registry";

type FAQItem = {
  question: string;
  answer: string;
};

const cleanText = (value: string) => value.trim().replace(/\s+/g, " ");

export const buildDefaultCalculatorFaq = (
  key: CalculatorKey
): FAQItem[] => {
  const definition = getCalculatorDefinition(key);

  return [
    {
      question: `Cum functioneaza ${definition.title.toLowerCase()}?`,
      answer: cleanText(definition.formulaDescription),
    },
    {
      question: "Cum interpretez rezultatul?",
      answer:
        "Rezultatul este corect matematic pe baza valorilor introduse, dar trebuie interpretat in contextul concret al utilizatorului si al scopului pentru care foloseste calculatorul.",
    },
    {
      question: "Cand merita sa refac calculul?",
      answer:
        "Refa calculul atunci cand se schimba datele de intrare, obiectivul sau contextul practic. Pentru decizii importante, compara mai multe scenarii si verifica daca datele introduse sunt corecte.",
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
