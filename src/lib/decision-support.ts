import type { Audience, CalculatorDoc } from "@/lib/content";

type DecisionSupportSection = {
  title: string;
  body: string;
};

export type DecisionSupportData = {
  eyebrow: string;
  title: string;
  summary: string;
  checks: string[];
  nextSteps: string[];
  sections: DecisionSupportSection[];
};

type CategoryGuidance = {
  summary: string;
  checks: string[];
  nextSteps: string[];
  sections: DecisionSupportSection[];
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

const defaultGuidance: CategoryGuidance = {
  summary:
    "Rezultatul ar trebui folosit ca punct de pornire pentru o decizie mai buna, nu ca raspuns final rupt de context.",
  checks: [
    "Verifica unitatile introduse si ordinea marimilor din formular.",
    "Refa calculul cu un scenariu conservator si cu unul optimist.",
    "Compara rezultatul cu cel putin un calculator sau articol conex.",
  ],
  nextSteps: [
    "Vezi cum se schimba rezultatul daca modifici valorile principale din formular.",
    "Continua cu un calculator sau ghid conex pentru validare suplimentara.",
    "Foloseste rezultatul intr-o decizie concreta, nu doar ca informatie izolata.",
  ],
  sections: [
    {
      title: "Cand merita sa folosesti pagina",
      body:
        "Pagina este utila atunci cand vrei un raspuns rapid, dar si suficient context cat sa poti transforma rezultatul intr-un pas practic.",
    },
    {
      title: "Cum citesti rezultatul",
      body:
        "Cifra finala are valoare doar daca este comparata cu scenariul real, cu limitele formulei si cu alternativele pe care le ai la indemana.",
    },
  ],
};

const categoryGuidance: Record<string, CategoryGuidance> = {
  fitness: {
    summary:
      "In fitness, rezultatul te ajuta sa calibrezi aportul, ritmul sau asteptarile, dar merita mereu citit impreuna cu contextul tau real.",
    checks: [
      "Verifica daca datele introduse sunt actuale: greutate, inaltime, varsta, nivel de activitate.",
      "Nu interpreta rezultatul izolat daca obiectivul tau este performanta, recompozitie sau sanatate metabolica.",
      "Compara cifra obtinuta cu alte repere apropiate, nu doar cu o singura eticheta.",
    ],
    nextSteps: [
      "Continua cu un calculator complementar din nutritie sau compozitie corporala.",
      "Foloseste rezultatul pentru a seta un interval, nu un target rigid.",
      "Revino si recalculeaza dupa schimbari de greutate, rutina sau obiectiv.",
    ],
    sections: [
      {
        title: "Ce decizie sustine",
        body:
          "Te ajuta sa alegi mai bine intre mentinere, deficit, surplus sau ajustari ale planului de antrenament si alimentatie.",
      },
      {
        title: "Ce sa nu fortezi",
        body:
          "Un rezultat matematic util nu inseamna automat recomandare medicala sau nutritionala completa. Pastreaza-l ca reper, nu ca verdict.",
      },
    ],
  },
  auto: {
    summary:
      "In zona auto, calculatorul trebuie sa clarifice costul sau timpul real al drumului, nu doar sa afiseze o valoare frumoasa pe hartie.",
    checks: [
      "Introdu valori cat mai apropiate de consumul tau real, nu doar de specificatia producatorului.",
      "Ia in calcul traficul, incarcare masinii, traseul si preturile diferite la combustibil.",
      "Verifica daca decizia depinde de cost total, cost pe kilometru sau timp estimat.",
    ],
    nextSteps: [
      "Compara doua scenarii de drum sau doua valori de consum.",
      "Deschide un calculator conex pentru cost total, consum sau timp.",
      "Foloseste rezultatul ca baza pentru buget, nu ca valoare garantata.",
    ],
    sections: [
      {
        title: "Ce decizie sustine",
        body:
          "Te ajuta sa alegi ruta, bugetul sau scenariul de cost mai realist inainte sa pleci la drum sau sa compari masini.",
      },
      {
        title: "Ce sa verifici dupa calcul",
        body:
          "Fa o comparatie rapida intre consum estimat si consum observat in practica. Diferenta dintre ele este deseori mai importanta decat cifra initiala.",
      },
    ],
  },
  energie: {
    summary:
      "La energie si conversii tehnice, valoarea corecta este importanta, dar si contextul in care o folosesti schimba semnificativ decizia.",
    checks: [
      "Verifica unitatile si daca lucrezi cu putere, energie sau cost.",
      "Nu confunda consumul teoretic cu consumul real pe durata folosirii aparatului.",
      "Daca decizia implica bani, compara si durata de utilizare sau tariful folosit.",
    ],
    nextSteps: [
      "Continua cu un calculator de cost sau consum complementar.",
      "Testeaza mai multe valori pentru ore de utilizare sau putere nominala.",
      "Pastreaza rezultatul ca reper tehnic si completeaza-l cu datele de factura sau specificatie reala.",
    ],
    sections: [
      {
        title: "Ce decizie sustine",
        body:
          "Este util pentru estimari de cost, comparatii intre aparate, alegerea unei solutii sau clarificarea unei conversii tehnice.",
      },
      {
        title: "Ce sa nu pierzi din vedere",
        body:
          "Randamentul, variatia de consum si modul efectiv de utilizare pot schimba rezultatul final fata de scenariul idealizat.",
      },
    ],
  },
  conversii: {
    summary:
      "La conversii, miza nu este doar formula, ci sa folosesti rapid raspunsul corect in contextul potrivit.",
    checks: [
      "Verifica daca sensul conversiei este corect si daca unitatea finala este cea de care ai nevoie.",
      "Cand valoarea urmeaza sa fie folosita in alt calcul, reia rapid pasul pentru confirmare.",
      "Daca rezultatul pare neobisnuit, verifica punctul zecimal si unitatile introduse.",
    ],
    nextSteps: [
      "Continua cu alta conversie apropiata daca lucrezi cu mai multe unitati.",
      "Foloseste rezultatul imediat intr-un calculator care depinde de aceasta unitate.",
      "Pastreaza pagina ca punct de verificare rapida pentru taskuri recurente.",
    ],
    sections: [
      {
        title: "Ce decizie sustine",
        body:
          "Iti economiseste timp cand vrei sa confirmi rapid o valoare inainte de un calcul mai mare, o comanda sau o comparatie tehnica.",
      },
      {
        title: "Unde apar erorile frecvent",
        body:
          "Cele mai comune greseli vin din schimbarea directiei conversiei sau din copierea unei valori fara unitate clara.",
      },
    ],
  },
  constructii: {
    summary:
      "In constructii si amenajari, calculatorul te ajuta sa estimezi mai bine, dar decizia buna apare abia dupa ce adaugi pierderi si context real de santier.",
    checks: [
      "Masoara din nou suprafetele sau volumele inainte sa folosesti rezultatul pentru achizitie.",
      "Adauga marja pentru pierderi, taieturi, rosturi sau neregularitati.",
      "Verifica daca produsul ales are randament sau acoperire diferita fata de scenariul standard.",
    ],
    nextSteps: [
      "Compara necesarul brut cu necesarul plus pierderi.",
      "Continua cu un calculator complementar de materiale sau suprafata.",
      "Foloseste rezultatul intr-un deviz orientativ, nu ca unic reper de aprovizionare.",
    ],
    sections: [
      {
        title: "Ce decizie sustine",
        body:
          "Te ajuta sa estimezi materiale, costuri si volum de lucru mai realist pentru renovari, finisaje sau lucrari simple.",
      },
      {
        title: "Ce sa nu fortezi",
        body:
          "Nu trata rezultatul ca necesar final de achizitie daca santierul are suprafete neregulate sau specificatii diferite de cele standard.",
      },
    ],
  },
  business: {
    summary:
      "Pentru firme, un calculator bun trebuie sa scurteze drumul spre decizie: pret, marja, rentabilitate sau scenariu de operare.",
    checks: [
      "Verifica daca in calcul intra toate costurile relevante, nu doar costul direct evident.",
      "Compara minim doua scenarii: conservator si optimist.",
      "Nu lua decizia finala fara sa vezi si efectul taxelor, discounturilor sau comisioanelor.",
    ],
    nextSteps: [
      "Deschide un calculator conex pentru marja, markup, break-even sau ROI.",
      "Foloseste rezultatul intr-un scenariu de ofertare, buget sau pricing.",
      "Salveaza logica deciziei si compara rezultatul cu datele reale dupa implementare.",
    ],
    sections: [
      {
        title: "Ce decizie sustine",
        body:
          "Pagina este gandita pentru discutii rapide despre pret, profitabilitate, eficienta sau prag de rentabilitate.",
      },
      {
        title: "Ce trebuie validat separat",
        body:
          "Formula ofera viteza, dar decizia de business are nevoie si de context comercial, fiscal si operational.",
      },
    ],
  },
  finante: {
    summary:
      "In finante, rezultatul conteaza doar daca stii exact ce compari: procent, baza de calcul, TVA, dobanda sau cost total.",
    checks: [
      "Verifica daca pleci de la valoare neta, bruta, fara TVA sau cu TVA.",
      "Testeaza un scenariu suplimentar cu comisioane, dobanda sau costuri recurente.",
      "Nu interpreta un singur calcul fara sa verifici si impactul asupra cash-flow-ului sau bugetului.",
    ],
    nextSteps: [
      "Continua cu un calculator financiar complementar pentru validare.",
      "Compara rezultatul cu varianta inversa sau cu un scenariu alternativ.",
      "Foloseste cifra obtinuta intr-o decizie de buget, economisire, pret sau creditare.",
    ],
    sections: [
      {
        title: "Ce decizie sustine",
        body:
          "Ajuta la evaluarea rapida a preturilor, ratelor, economiilor, taxelor sau comparatiilor procentuale.",
      },
      {
        title: "Unde apare cea mai mare confuzie",
        body:
          "Cele mai multe erori apar cand se amesteca procentele cu valorile absolute sau cand baza de calcul nu este clar definita.",
      },
    ],
  },
};

export const buildDecisionSupport = (calculator: Pick<
  CalculatorDoc,
  "title" | "audience" | "category" | "relatedArticles" | "relatedCalculators"
>): DecisionSupportData => {
  const categorySlug = calculator.category?.slug ?? "";
  const guidance = categoryGuidance[categorySlug] ?? defaultGuidance;
  const relatedCount =
    calculator.relatedArticles.length + calculator.relatedCalculators.length;

  const dynamicStep =
    relatedCount > 0
      ? `Continua cu una dintre cele ${relatedCount} pagini conexe recomandate pentru a valida sau aprofunda rezultatul.`
      : "Continua cu hub-ul categoriei pentru a compara rezultatul cu alte scenarii apropiate.";

  return {
    eyebrow: `Decision support ${audienceLabel(calculator.audience)}`,
    title: `Cum folosesti ${calculator.title.toLowerCase()} intr-o decizie reala`,
    summary: guidance.summary,
    checks: guidance.checks,
    nextSteps: [...guidance.nextSteps, dynamicStep],
    sections: guidance.sections,
  };
};
