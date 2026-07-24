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
  mistakes: string[];
  nextSteps: string[];
  sections: DecisionSupportSection[];
};

type CategoryGuidance = {
  summary: string;
  checks: string[];
  mistakes: string[];
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

  return "pentru persoane și firme";
};

const defaultGuidance: CategoryGuidance = {
  summary:
    "Rezultatul ar trebui folosit ca punct de pornire pentru o decizie mai bună, nu ca răspuns final rupt de context.",
  checks: [
    "Verifică unitățile introduse și ordinea mărimilor din formular.",
    "Refă calculul cu un scenariu conservator și cu unul optimist.",
    "Compară rezultatul cu cel puțin un calculator sau articol conex.",
  ],
  mistakes: [
    "Să tratezi cifra obținută ca verdict final, nu ca punct de pornire.",
    "Să compari rezultate din scenarii construite pe unități sau ipoteze diferite.",
    "Să ignori limitările formulei atunci când decizia are miză mare.",
  ],
  nextSteps: [
    "Vezi cum se schimbă rezultatul dacă modifici valorile principale din formular.",
    "Continuă cu un calculator sau ghid conex pentru validare suplimentară.",
    "Folosește rezultatul într-o decizie concretă, nu doar ca informație izolată.",
  ],
  sections: [
    {
      title: "Când merită să folosești pagina",
      body:
        "Pagina este utilă atunci când vrei un răspuns rapid, dar și suficient context cât să poți transforma rezultatul într-un pas practic.",
    },
    {
      title: "Cum citești rezultatul",
      body:
        "Cifra finală are valoare doar dacă este comparată cu scenariul real, cu limitele formulei și cu alternativele pe care le ai la îndemână.",
    },
  ],
};

const categoryGuidance: Record<string, CategoryGuidance> = {
  "nutritie-si-antrenament": {
    summary:
      "În nutriție și antrenament, rezultatul te ajută să calibrezi aportul, ritmul sau așteptările, dar merită mereu citit împreună cu contextul tău real.",
    checks: [
      "Verifică dacă datele introduse sunt actuale: greutate, înălțime, vârstă, nivel de activitate.",
      "Nu interpreta rezultatul izolat dacă obiectivul tău este performanță, recompoziție sau sănătate metabolică.",
      "Compară cifra obținută cu alte repere apropiate, nu doar cu o singură etichetă.",
    ],
    mistakes: [
      "Să interpretezi rezultatul ca diagnostic medical sau nutrițional complet.",
      "Să alegi un target fix fără să îl verifici în evoluția reală de câteva săptămâni.",
      "Să ignori contextul personal: antrenament, masă musculară, istoric metabolic.",
    ],
    nextSteps: [
      "Continuă cu un calculator complementar din nutriție sau compoziție corporală.",
      "Folosește rezultatul pentru a seta un interval, nu un target rigid.",
      "Revino și recalculează după schimbări de greutate, rutină sau obiectiv.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Te ajută să alegi mai bine între menținere, deficit, surplus sau ajustări ale planului de antrenament și alimentație.",
      },
      {
        title: "Ce să nu forțezi",
        body:
          "Un rezultat matematic util nu înseamnă automat recomandare medicală sau nutrițională completă. Păstrează-l ca reper, nu ca verdict.",
      },
    ],
  },
  auto: {
    summary:
      "În zona auto, calculatorul trebuie să clarifice costul sau timpul real al drumului, nu doar să afișeze o valoare frumoasă pe hârtie.",
    checks: [
      "Introdu valori cât mai apropiate de consumul tău real, nu doar de specificația producătorului.",
      "Ia în calcul traficul, încărcarea mașinii, traseul și prețurile diferite la combustibil.",
      "Verifică dacă decizia depinde de cost total, cost pe kilometru sau timp estimat.",
    ],
    mistakes: [
      "Să folosești consumul idealizat din fabrică în locul unei valori apropiate de practică.",
      "Să compari drumuri foarte diferite ca și cum ar fi același scenariu.",
      "Să iei costul estimat ca valoare garantată, nu ca interval orientativ.",
    ],
    nextSteps: [
      "Compară două scenarii de drum sau două valori de consum.",
      "Deschide un calculator conex pentru cost total, consum sau timp.",
      "Folosește rezultatul ca bază pentru buget, nu ca valoare garantată.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Te ajută să alegi ruta, bugetul sau scenariul de cost mai realist înainte să pleci la drum sau să compari mașini.",
      },
      {
        title: "Ce să verifici după calcul",
        body:
          "Fă o comparație rapidă între consum estimat și consum observat în practică. Diferența dintre ele este deseori mai importantă decât cifra inițială.",
      },
    ],
  },
  energie: {
    summary:
      "La energie și conversii tehnice, valoarea corectă este importantă, dar și contextul în care o folosești schimbă semnificativ decizia.",
    checks: [
      "Verifică unitățile și dacă lucrezi cu putere, energie sau cost.",
      "Nu confunda consumul teoretic cu consumul real pe durata folosirii aparatului.",
      "Dacă decizia implică bani, compară și durata de utilizare sau tariful folosit.",
    ],
    mistakes: [
      "Să amesteci wați, kWh și costul final în același pas.",
      "Să tratezi puterea nominală ca și cum ar fi consum constant în orice scenariu.",
      "Să uiți de timpul real de utilizare când calculezi costul.",
    ],
    nextSteps: [
      "Continuă cu un calculator de cost sau consum complementar.",
      "Testează mai multe valori pentru ore de utilizare sau putere nominală.",
      "Păstrează rezultatul ca reper tehnic și completează-l cu datele de factură sau specificație reală.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Este util pentru estimări de cost, comparații între aparate, alegerea unei soluții sau clarificarea unei conversii tehnice.",
      },
      {
        title: "Ce să nu pierzi din vedere",
        body:
          "Randamentul, variația de consum și modul efectiv de utilizare pot schimba rezultatul final față de scenariul idealizat.",
      },
    ],
  },
  "energie-pentru-casa": {
    summary:
      "În energia pentru casă, calculatorul este util când te ajută să legi consumul, costul și alegerea echipamentului de scenariul real din locuință.",
    checks: [
      "Verifică dacă folosești tariful, consumul și numărul de ore apropiate de situația ta reală.",
      "Pentru panouri, compară măcar un scenariu prudent și unul optimist de producție.",
      "Pentru climatizare sau încălzire, validează volumul, izolația și condițiile reale ale casei.",
    ],
    mistakes: [
      "Să folosești consumul teoretic al aparatelor ca și cum ar fi consum garantat în orice zi.",
      "Să tratezi producția fotovoltaică ca promisiune fixă, fără să ții cont de orientare, umbrire sau autoconsum.",
      "Să alegi echipamente doar după puterea afișată, fără să legi rezultatul de costul și scenariul real de utilizare.",
    ],
    nextSteps: [
      "Compară costul actual cu un scenariu de reducere a consumului sau cu investiția în panouri.",
      "Leagă calculul de un al doilea tool din aceeași categorie: producție, amortizare, BTU sau necesar de căldură.",
      "Folosește ghidul editorial când decizia implică achiziție de echipamente sau comparații între soluții.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Te ajută să compari factura actuală cu scenarii de eficiență, panouri fotovoltaice, climatizare sau dimensionare a echipamentelor din casă.",
      },
      {
        title: "Ce trebuie verificat separat",
        body:
          "Tarifele reale, condițiile locuinței, orientarea acoperișului, randamentul echipamentelor și montajul pot schimba semnificativ rezultatul final.",
      },
    ],
  },
  conversii: {
    summary:
      "La conversii, miza nu este doar formula, ci să folosești rapid răspunsul corect în contextul potrivit.",
    checks: [
      "Verifică dacă sensul conversiei este corect și dacă unitatea finală este cea de care ai nevoie.",
      "Când valoarea urmează să fie folosită în alt calcul, reia rapid pasul pentru confirmare.",
      "Dacă rezultatul pare neobișnuit, verifică punctul zecimal și unitățile introduse.",
    ],
    mistakes: [
      "Să inversezi direcția conversiei fără să observi.",
      "Să copiezi o valoare fără unitatea finală atașată clar.",
      "Să folosești o conversie aproximativă într-un calcul care are nevoie de precizie mai bună.",
    ],
    nextSteps: [
      "Continuă cu altă conversie apropiată dacă lucrezi cu mai multe unități.",
      "Folosește rezultatul imediat într-un calculator care depinde de această unitate.",
      "Păstrează pagina ca punct de verificare rapidă pentru taskuri recurente.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Îți economisește timp când vrei să confirmi rapid o valoare înainte de un calcul mai mare, o comandă sau o comparație tehnică.",
      },
      {
        title: "Unde apar erorile frecvent",
        body:
          "Cele mai comune greșeli vin din schimbarea direcției conversiei sau din copierea unei valori fără unitate clară.",
      },
    ],
  },
  constructii: {
    summary:
      "În construcții și amenajări, calculatorul te ajută să estimezi mai bine, dar decizia bună apare abia după ce adaugi pierderi și context real de șantier.",
    checks: [
      "Măsoară din nou suprafețele sau volumele înainte să folosești rezultatul pentru achiziție.",
      "Adaugă marjă pentru pierderi, tăieturi, rosturi sau neregularități.",
      "Verifică dacă produsul ales are randament sau acoperire diferită față de scenariul standard.",
    ],
    mistakes: [
      "Să cumperi fix cantitatea teoretică fără marjă de pierdere.",
      "Să aplici randamentul unui produs pe alt material cu specificații diferite.",
      "Să tratezi estimarea ca deviz final fără verificare pe lucrare.",
    ],
    nextSteps: [
      "Compară necesarul brut cu necesarul plus pierderi.",
      "Continuă cu un calculator complementar de materiale sau suprafață.",
      "Folosește rezultatul într-un deviz orientativ, nu ca unic reper de aprovizionare.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Te ajută să estimezi materiale, costuri și volum de lucru mai realist pentru renovări, finisaje sau lucrări simple.",
      },
      {
        title: "Ce să nu forțezi",
        body:
          "Nu trata rezultatul ca necesar final de achiziție dacă șantierul are suprafețe neregulate sau specificații diferite de cele standard.",
      },
    ],
  },
  afaceri: {
    summary:
      "Pentru afaceri, un calculator bun trebuie să scurteze drumul spre decizie: preț, marjă, rentabilitate sau scenariu de operare.",
    checks: [
      "Verifică dacă în calcul intră toate costurile relevante, nu doar costul direct evident.",
      "Compară minim două scenarii: conservator și optimist.",
      "Nu lua decizia finală fără să vezi și efectul taxelor, discounturilor sau comisioanelor.",
    ],
    mistakes: [
      "Să ignori costurile indirecte și să rămâi doar la costul de bază.",
      "Să compari scenarii comerciale diferite cu ipoteze inegale.",
      "Să folosești formula ca verdict final fără context fiscal sau operațional.",
    ],
    nextSteps: [
      "Deschide un calculator conex pentru marjă, markup, break-even sau ROI.",
      "Folosește rezultatul într-un scenariu de ofertare, buget sau pricing.",
      "Salvează logica deciziei și compară rezultatul cu datele reale după implementare.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Pagina este gândită pentru discuții rapide despre preț, profitabilitate, eficiență sau prag de rentabilitate.",
      },
      {
        title: "Ce trebuie validat separat",
        body:
          "Formula oferă viteză, dar decizia de business are nevoie și de context comercial, fiscal și operațional.",
      },
    ],
  },
  finante: {
    summary:
      "În finanțe, rezultatul contează doar dacă știi exact ce compari: procent, bază de calcul, TVA, dobândă sau cost total.",
    checks: [
      "Verifică dacă pleci de la valoare netă, brută, fără TVA sau cu TVA.",
      "Testează un scenariu suplimentar cu comisioane, dobândă sau costuri recurente.",
      "Nu interpreta un singur calcul fără să verifici și impactul asupra cash-flow-ului sau bugetului.",
    ],
    mistakes: [
      "Să amesteci procentele cu valorile absolute fără bază de calcul clară.",
      "Să compari TVA, discount sau dobândă pe sume exprimate diferit.",
      "Să folosești un singur scenariu când decizia depinde de mai multe ipoteze financiare.",
    ],
    nextSteps: [
      "Continuă cu un calculator financiar complementar pentru validare.",
      "Compară rezultatul cu varianta inversă sau cu un scenariu alternativ.",
      "Folosește cifra obținută într-o decizie de buget, economisire, preț sau creditare.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Ajută la evaluarea rapidă a prețurilor, ratelor, economiilor, taxelor sau comparațiilor procentuale.",
      },
      {
        title: "Unde apare cea mai mare confuzie",
        body:
          "Cele mai multe erori apar când se amestecă procentele cu valorile absolute sau când baza de calcul nu este clar definită.",
      },
    ],
  },
  "salarii-si-taxe": {
    summary:
      "În salarii și taxare efectivă, calculatorul este util ca reper rapid, dar rezultatul trebuie citit împreună cu orele lucrate, structura pachetului și contextul concret al ofertei.",
    checks: [
      "Clarifică dacă lucrezi cu net, brut, venit lunar, bonusuri sau scenarii mixte.",
      "Verifică dacă baza de comparație este aceeași pentru toate variantele analizate.",
      "Leagă rezultatul de timpul real de lucru, nu doar de suma afișată lunar.",
    ],
    mistakes: [
      "Să compari două oferte doar prin suma lunară, fără bonusuri sau ore reale lucrate.",
      "Să tratezi rata efectivă drept explicație fiscală completă, nu ca indicator orientativ.",
      "Să ignori venitul anual atunci când compari pachete salariale diferite.",
    ],
    nextSteps: [
      "Compară creșterea salarială cu tariful orar și venitul anual pentru același scenariu.",
      "Testează atât varianta netă, cât și varianta brută dacă oferta este prezentată diferit.",
      "Continuă cu ghidurile conexe pentru a clarifica interpretarea rezultatului în negociere sau planning.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Pagina te ajută să compari oferte, să înțelegi mai clar valoarea reală a venitului și să legi rapid salariul de timp, taxare sau venit anual.",
      },
      {
        title: "Ce trebuie validat separat",
        body:
          "Detaliile fiscale concrete, regulile de payroll și structura completă a pachetului de compensare trebuie verificate separat față de calculatorul orientativ.",
      },
    ],
  },
  "credite-si-economii": {
    summary:
      "În credite și economii, rezultatul are valoare când te ajută să compari scenarii reale, nu doar să obții o cifră izolată despre rată sau obiectiv.",
    checks: [
      "Verifică dacă toate valorile sunt exprimate în același tip de sumă: net, brut, fără comisioane sau cu costuri incluse.",
      "Compară întotdeauna cel puțin două scenarii: conservator și optimist.",
      "Leagă rezultatul de bugetul lunar, lichiditate și obiectivele pe termen mediu sau lung.",
    ],
    mistakes: [
      "Să te uiți doar la rata lunară și să ignori costul total sau perioada.",
      "Să folosești randamente optimiste ca și cum ar fi garantate.",
      "Să compari două scenarii de finanțare fără să verifici avansul, costurile inițiale și flexibilitatea reală.",
    ],
    nextSteps: [
      "Continuă cu un calculator complementar pentru validare: cost total, refinanțare, fond de urgență sau avans.",
      "Testează un scenariu mai prudent înainte să consideri rezultatul suficient.",
      "Folosește ghidurile asociate pentru a traduce cifra într-o decizie financiară mai bună.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Te ajută să compari credite, refinanțare, obiective de economisire și bufferul financiar necesar pentru stabilitate.",
      },
      {
        title: "Ce trebuie validat separat",
      body:
          "Comisioanele, condițiile produsului, fiscalitatea și comportamentul real al bugetului trebuie verificate separat față de formula orientativă.",
      },
    ],
  },
  imobiliare: {
    summary:
      "În imobiliare, rezultatul este util doar dacă îl legi de costul total, lichiditatea inițială și scenariul real de folosire sau exploatare a proprietății.",
    checks: [
      "Verifică dacă toate costurile sunt puse în același cadru: preț, costuri inițiale, costuri recurente și rezervă.",
      "Compară măcar un scenariu prudent și unul optimist pentru chirie, ocupare sau renovare.",
      "Nu citi proprietatea doar prin rată sau doar prin randament; leagă calculul de bugetul complet.",
    ],
    mistakes: [
      "Să tratezi prețul afișat ca și cum ar fi costul total al proiectului.",
      "Să folosești randamentul brut fără să scazi administrarea, neocuparea sau costurile recurente.",
      "Să proiectezi creșterea chiriei sau profitul din flip pe ipoteze prea optimiste.",
    ],
    nextSteps: [
      "Continuă cu un calculator complementar pentru avans, cost total, buget lunar sau randament.",
      "Compară scenariul de locuire cu scenariul investițional dacă proprietatea poate juca ambele roluri.",
      "Folosește ghidurile categoriei pentru a transforma cifra într-o decizie mai prudentă.",
    ],
    sections: [
      {
        title: "Ce decizie susține",
        body:
          "Te ajută să compari proprietăți, să bugetezi achiziția, să alegi între chirie și cumpărare sau să verifici dacă o investiție imobiliară rezistă după costurile reale.",
      },
      {
        title: "Ce trebuie validat separat",
        body:
          "Starea proprietății, costurile de închidere, finanțarea concretă, ocuparea reală și costurile de exploatare trebuie verificate separat față de formula de pe pagină.",
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
      ? `Continuă cu una dintre cele ${relatedCount} pagini conexe recomandate pentru a valida sau aprofunda rezultatul.`
      : "Continuă cu hub-ul categoriei pentru a compara rezultatul cu alte scenarii apropiate.";

  return {
    eyebrow: `Decision support ${audienceLabel(calculator.audience)}`,
    title: `Cum folosești ${calculator.title.toLowerCase()} într-o decizie reală`,
    summary: guidance.summary,
    checks: guidance.checks,
    mistakes: guidance.mistakes,
    nextSteps: [...guidance.nextSteps, dynamicStep],
    sections: guidance.sections,
  };
};
