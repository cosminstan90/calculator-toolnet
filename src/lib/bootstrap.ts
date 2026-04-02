import {
  CALCULATOR_KEYS,
  getCalculatorDefinition,
  type CalculatorKey,
} from "./calculator-registry.ts";
import { ensureCalculatorFaq } from "./calculator-content.ts";
import type { Payload } from "payload";

type BootstrapOptions = { force?: boolean };
type SeedStatus = "created" | "updated" | "skipped";
type SeedItemResult = { key: string; status: SeedStatus };
type ReleaseBatch =
  | "batch-01"
  | "batch-02"
  | "batch-03"
  | "batch-04"
  | "batch-05"
  | "batch-06"
  | "batch-07"
  | "batch-08"
  | "batch-09"
  | "batch-10"
  | "batch-11"
  | "batch-12"
  | "batch-13"
  | "batch-14"
  | "batch-15"
  | "batch-16"
  | "batch-17"
  | "batch-18";
type EditorialStatus =
  | "draft"
  | "formula_validated"
  | "content_in_progress"
  | "ready_for_review"
  | "approved"
  | "scheduled"
  | "published";
type CounterSummary = {
  created: number;
  updated: number;
  skipped: number;
  items: SeedItemResult[];
};

export type BootstrapCmsResult = {
  homepage: { status: "updated" | "skipped" };
  categories: CounterSummary;
  formulas: CounterSummary;
  calculators: CounterSummary;
  articles: CounterSummary;
};

type CategorySeed = {
  name: string;
  slug: string;
  summary: string;
  introContent: string;
  sortOrder: number;
  isFeatured: boolean;
};

type CalculatorMeta = {
  shortDescription: string;
  intro: string;
  interpretationNotes: string;
  isFeatured: boolean;
  sortOrder: number;
  releaseBatch?: ReleaseBatch;
  editorialStatus?: EditorialStatus;
  publishByDefault?: boolean;
  example: string;
  faq: Array<{ question: string; answer: string }>;
  relatedCalculatorKeys?: CalculatorKey[];
  relatedArticleSlugs?: string[];
};

type ArticleSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  articleType: "guide" | "explainer" | "comparison";
  relatedCategorySlug?: string;
  relatedCalculatorKeys?: CalculatorKey[];
  relatedArticleSlugs?: string[];
  launchWave?: "wave-1" | "wave-2" | "backlog";
  releaseBatch?: ReleaseBatch;
  editorialStatus?: EditorialStatus;
  publishByDefault?: boolean;
};

const BATCH_01_CALCULATORS: CalculatorKey[] = [
  "bmi",
  "bmr",
  "tdee",
  "calorie-deficit",
  "protein-intake",
  "body-fat-us-navy",
  "fuel-consumption",
  "trip-fuel-cost",
  "kw-cp",
  "electricity-cost",
];

const BATCH_01_ARTICLES = [
  "cum-interpretezi-bmi-corect",
  "bmr-vs-tdee-diferente",
  "cum-setezi-un-deficit-caloric",
  "cate-proteine-ai-nevoie-zilnic",
];

const defaultReleaseBatchForCalculator = (key: CalculatorKey): ReleaseBatch =>
  BATCH_01_CALCULATORS.includes(key) ? "batch-01" : "batch-02";

const defaultEditorialStatusForCalculator = (key: CalculatorKey): EditorialStatus =>
  BATCH_01_CALCULATORS.includes(key) ? "approved" : "draft";

const shouldPublishCalculator = (key: CalculatorKey, meta: CalculatorMeta) =>
  meta.publishByDefault === true || BATCH_01_CALCULATORS.includes(key);

const defaultReleaseBatchForArticle = (seed: ArticleSeed): ReleaseBatch => {
  if (BATCH_01_ARTICLES.includes(seed.slug)) {
    return "batch-01";
  }

  if (seed.launchWave === "wave-2") {
    return "batch-02";
  }

  return seed.relatedCategorySlug === "conversii" ? "batch-04" : "batch-03";
};

const defaultEditorialStatusForArticle = (seed: ArticleSeed): EditorialStatus =>
  BATCH_01_ARTICLES.includes(seed.slug) ? "approved" : "draft";

const categoryFrames = {
  fitness: {
    audience:
      "cand urmaresti compozitia corporala, aportul caloric, hidratarea sau performanta din antrenament",
    caution:
      "In fitness, rezultatul merita corelat cu obiectivul, istoricul personal si cu alte repere relevante, nu folosit izolat.",
    linkingLead:
      "Din acelasi cluster merita sa legi calculatorul de alte tool-uri care rafineaza interpretarea rezultatului.",
  },
  auto: {
    audience:
      "cand vrei sa estimezi mai corect costul unui drum, consumul real sau timpul necesar pentru un traseu",
    caution:
      "In zona auto, traficul, stilul de condus, incarcarea masinii si diferentele de pret pot schimba rezultatul final.",
    linkingLead:
      "Legaturile interne functioneaza bine aici pentru ca utilizatorul cauta de obicei si costul, si consumul, si timpul.",
  },
  energie: {
    audience:
      "cand compari specificatii tehnice, estimezi consum energetic sau convertesti rapid valori folosite in practica",
    caution:
      "In energie si electricitate, rezultatul matematic este clar, dar consumul real depinde si de randament, factor de putere sau mod de folosire.",
    linkingLead:
      "Un calculator de energie performeaza mai bine SEO cand este conectat natural cu alte conversii si cu ghiduri explicative.",
  },
  conversii: {
    audience:
      "cand ai nevoie de un raspuns rapid intre doua unitati si vrei sa verifici imediat daca valoarea este corecta",
    caution:
      "La conversii simple, avantajul competitiv nu vine doar din formula, ci din claritatea explicatiei si din contextul util oferit pe pagina.",
    linkingLead:
      "Conversiile tind sa capteze cautari answer-first, asa ca merita sustinute prin linkuri spre alte conversii si spre pagini explicative.",
  },
} as const;

const readStringField = (doc: { [key: string]: unknown }, field: string): string => {
  const value = doc[field];
  return typeof value === "string" ? value : "";
};

const clampSeoValue = (value: string, maxLength: number) => {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  if (maxLength <= 3) {
    return normalized.slice(0, maxLength);
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
};

const buildSeoPayload = ({
  canonicalPath,
  metaDescription,
  metaTitle,
}: {
  canonicalPath: string;
  metaDescription: string;
  metaTitle: string;
}) => ({
  canonicalPath,
  metaDescription: clampSeoValue(metaDescription, 170),
  metaTitle: clampSeoValue(metaTitle, 70),
});

const toSentenceList = (items: string[]) => {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} si ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")} si ${items[items.length - 1]}`;
};

const getCategoryFrame = (categorySlug: string) => {
  if (categorySlug === "auto") {
    return categoryFrames.auto;
  }

  if (categorySlug === "energie") {
    return categoryFrames.energie;
  }

  if (categorySlug === "conversii") {
    return categoryFrames.conversii;
  }

  return categoryFrames.fitness;
};

const buildFallbackCalculatorMeta = (
  key: CalculatorKey,
  definition: ReturnType<typeof getCalculatorDefinition>
) => {
  const categoryFrame = getCategoryFrame(definition.categorySlug);

  return {
    shortDescription: `${definition.summary} Pagina ofera formula explicata, exemple de calcul si context util pentru interpretarea rezultatului.`,
    intro: `${definition.title} te ajuta sa obtii un raspuns rapid, dar si sa intelegi ce inseamna valoarea calculata in practica. Pagina foloseste ${definition.formulaName.toLowerCase()} si este gandita pentru cautari cu intentie clara, answer-first.`,
    interpretationNotes: `${categoryFrame.caution} Rezultatul trebuie verificat in functie de datele introduse si de scenariul real in care folosesti calculatorul.`,
    isFeatured: false,
    sortOrder: 200 + CALCULATOR_KEYS.indexOf(key),
    releaseBatch: defaultReleaseBatchForCalculator(key),
    editorialStatus: defaultEditorialStatusForCalculator(key),
    publishByDefault: BATCH_01_CALCULATORS.includes(key),
    example: `Exemplu orientativ pentru ${definition.title.toLowerCase()}, pornind de la valorile standard afisate in formular si ajustat apoi dupa scenariul tau real.`,
    faq: [
      {
        question: `Cum functioneaza ${definition.title.toLowerCase()}?`,
        answer: definition.formulaDescription,
      },
      {
        question: "Cand este util acest calculator?",
        answer: `Este util ${categoryFrame.audience}.`,
      },
      {
        question: "Rezultatul este exact?",
        answer:
          "Rezultatul este corect matematic pe baza formulei folosite, dar interpretarea practica depinde de contextul real.",
      },
    ],
  };
};

const homepageSeed = {
  heroBadge: "Calculatoare online clare si utile",
  heroTitle: "Calcule utile, explicate pe inteles si gata de folosit.",
  heroDescription:
    "Calculatoare Online reuneste tool-uri pentru fitness, auto, energie si conversii, fiecare completat cu formula folosita, exemple practice, intrebari frecvente si legaturi catre pagini relevante.",
  primaryCTA: { label: "Vezi toate calculatoarele", href: "/calculatoare" },
  secondaryCTA: { label: "Cum construim paginile", href: "/metodologie" },
  heroHighlights: [
    { value: "20", label: "calculatoare disponibile in primul hub" },
    { value: "4", label: "categorii principale de cautare" },
    { value: "FAQ", label: "explicatii si raspunsuri integrate in pagini" },
  ],
  contentBlocks: [
    {
      blockType: "story",
      eyebrow: "Ce face diferenta",
      title:
        "Fiecare pagina porneste de la un calculator real, dar merge mai departe cu explicatii, interpretare si urmatorul pas util.",
      body: "Scopul platformei nu este doar sa afiseze un rezultat rapid, ci sa ofere suficient context incat utilizatorul sa inteleaga ce inseamna cifra obtinuta si cum se leaga de alte calcule sau ghiduri relevante.",
      tone: "night",
    },
    {
      blockType: "facts",
      eyebrow: "Cum este structurat hub-ul",
      title: "Platforma este gandita pentru raspuns rapid, dar si pentru explorare coerenta.",
      intro:
        "Fiecare pagina are formula, exemple, FAQ, continut contextual si legaturi catre tool-uri sau articole apropiate.",
      tone: "mist",
      items: [
        { value: "Fitness", label: "BMI, BMR, TDEE, proteine si calorii" },
        { value: "Auto", label: "consum, cost de drum si timp de calatorie" },
        { value: "Energie", label: "kW in CP, cost electric si conversii utile" },
        { value: "Conversii", label: "temperatura, greutate, lungime si unitati uzuale" },
      ],
    },
  ],
  seo: buildSeoPayload({
    metaTitle: "Calculatoare Online - BMI, calorii, consum, kW in CP si alte tool-uri utile",
    metaDescription:
      "Hub de calculatoare online pentru fitness, auto, energie si conversii, cu formule explicate, exemple practice, FAQ si pagini construite pentru utilitate reala.",
    canonicalPath: "/",
  }),
};

const categorySeeds: CategorySeed[] = [
  {
    name: "Fitness",
    slug: "fitness",
    summary: "Calculatoare pentru IMC, metabolism, calorii, proteine si obiective de nutritie.",
    introContent:
      "Categoria Fitness aduna tool-uri pentru compozitie corporala, necesar caloric, proteine si alte calcule frecvente in nutritie si antrenament. Fiecare pagina combina formularul cu explicatia formulei, exemple de calcul si context editorial care te ajuta sa folosesti corect rezultatul.",
    sortOrder: 10,
    isFeatured: true,
  },
  {
    name: "Auto",
    slug: "auto",
    summary: "Tool-uri pentru consum, cost pe kilometru, costuri de drum si estimari utile pentru soferi.",
    introContent:
      "Categoria Auto raspunde intrebarilor practice care apar inaintea unui drum sau dupa alimentare: cat consuma masina, cat te costa traseul, cat dureaza si cum compari mai bine mai multe scenarii de consum.",
    sortOrder: 20,
    isFeatured: true,
  },
  {
    name: "Energie",
    slug: "energie",
    summary: "Conversii tehnice si estimari pentru consum, putere si cost electric.",
    introContent:
      "Categoria Energie grupeaza conversii tehnice si estimari de cost energetic pentru utilizare practica. Este utila atat pentru specificatii de aparate sau motoare, cat si pentru intrebari simple despre consum si cost.",
    sortOrder: 30,
    isFeatured: true,
  },
  {
    name: "Conversii",
    slug: "conversii",
    summary: "Convertori rapizi pentru unitati uzuale si formule folosite frecvent.",
    introContent:
      "Categoria Conversii este construita pentru cautari recurente si answer-first, dar fiecare pagina merge dincolo de formula simpla si adauga exemple, explicatii si legaturi catre alte conversii utile.",
    sortOrder: 40,
    isFeatured: false,
  },
];

const calculatorMeta: Partial<Record<CalculatorKey, CalculatorMeta>> = {
  bmi: {
    shortDescription: "Calculeaza rapid indicele de masa corporala pe baza greutatii si inaltimii.",
    intro: "Acest calculator BMI estimeaza indicele de masa corporala si te ajuta sa intelegi rapid in ce interval te incadrezi.",
    interpretationNotes: "BMI este orientativ. La sportivi sau persoane cu masa musculara mare, rezultatul poate fi inselator.",
    isFeatured: true,
    sortOrder: 10,
    example: "La 70 kg si 170 cm, BMI este 24.2.",
    faq: [
      { question: "Ce inseamna BMI?", answer: "BMI sau IMC este indicele de masa corporala calculat din greutate si inaltime." },
      { question: "Este suficient pentru evaluare?", answer: "Nu. Este un indicator de pornire si trebuie completat cu alti factori." },
    ],
    relatedCalculatorKeys: ["bmr", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cum-interpretezi-bmi-corect"],
  },
  bmr: {
    shortDescription: "Estimeaza rata metabolica bazala folosind formula Mifflin-St Jeor.",
    intro: "Calculatorul BMR arata de cate calorii are nevoie corpul tau in repaus pentru functiile vitale.",
    interpretationNotes: "BMR nu include activitatea zilnica. Pentru mentinere sau slabire, foloseste si calculatorul TDEE.",
    isFeatured: true,
    sortOrder: 20,
    example: "Pentru 80 kg, 180 cm si 30 ani, BMR este aproximativ 1780 kcal/zi.",
    faq: [
      { question: "Ce diferenta este intre BMR si TDEE?", answer: "BMR este consumul in repaus, iar TDEE adauga activitatea zilnica." },
      { question: "Formula este exacta?", answer: "Este o estimare buna, dar nu un rezultat clinic." },
    ],
    relatedCalculatorKeys: ["tdee", "calorie-deficit", "bmi"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
  },
  tdee: {
    shortDescription: "Estimeaza necesarul zilnic de calorii in functie de metabolism si activitate.",
    intro: "Calculatorul TDEE combina BMR-ul cu activitatea ta zilnica pentru a estima caloriile de mentinere.",
    interpretationNotes: "Rezultatul este un punct de plecare. Ajusteaza dupa 2-3 saptamani in functie de evolutia reala.",
    isFeatured: true,
    sortOrder: 30,
    example: "Un BMR de 1650 kcal si activitate moderata duc la aproximativ 2550 kcal/zi.",
    faq: [
      { question: "Cum aleg nivelul de activitate?", answer: "Alege media saptamanii, nu cea mai intensa zi de antrenament." },
      { question: "TDEE se schimba in timp?", answer: "Da, in functie de greutate, masa musculara si rutina." },
    ],
    relatedCalculatorKeys: ["bmr", "calorie-deficit", "protein-intake"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
  },
  "calorie-deficit": {
    shortDescription: "Porneste de la TDEE si estimeaza tinta zilnica de calorii pentru slabire.",
    intro: "Calculatorul transforma TDEE-ul intr-o tinta practica de calorii pentru un deficit lent, moderat sau agresiv.",
    interpretationNotes: "Pentru multi utilizatori, deficitul moderat este un punct de plecare mai sustenabil decat varianta agresiva.",
    isFeatured: true,
    sortOrder: 40,
    example: "La un TDEE de 2400 kcal, un deficit moderat duce la circa 1920 kcal/zi.",
    faq: [
      { question: "Ce deficit este recomandat?", answer: "De multe ori 15% pana la 20% este un compromis bun intre progres si sustenabilitate." },
      { question: "Calculatorul garanteaza slabirea?", answer: "Nu. Este un punct de pornire care necesita ajustare in functie de raspunsul real." },
    ],
    relatedCalculatorKeys: ["tdee", "bmr", "protein-intake"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
  },
  "protein-intake": {
    shortDescription: "Estimeaza cate grame de proteine ai nevoie zilnic in functie de greutate si obiectiv.",
    intro: "Calculatorul de proteine este util pentru mentinere, slabire sau crestere musculara cand vrei o tinta simpla si usor de aplicat.",
    interpretationNotes: "Rezultatul este orientativ. Pentru conditii medicale speciale, consulta un specialist.",
    isFeatured: false,
    sortOrder: 50,
    example: "La 75 kg si mentinere, 1.8 g/kg inseamna aproximativ 135 g/zi.",
    faq: [
      { question: "De ce creste necesarul de proteine in deficit?", answer: "Un aport mai mare poate ajuta la mentinerea masei musculare si la satietate." },
      { question: "Trebuie impartite pe mese?", answer: "De obicei este mai usor sa distribui proteinele in 3-5 mese pe zi." },
    ],
    relatedCalculatorKeys: ["tdee", "calorie-deficit", "bmi"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
  },
  "fuel-consumption": {
    shortDescription: "Afla consumul mediu in litri la 100 km pe baza distantei si a carburantului consumat.",
    intro: "Calculatorul de consum combustibil este unul dintre cele mai utile tool-uri auto pentru costuri si comparatii reale.",
    interpretationNotes: "Rezultatul este mai relevant daca masuratoarea acopera o distanta suficient de lunga.",
    isFeatured: true,
    sortOrder: 60,
    example: "36 litri consumati pe 500 km inseamna 7.2 l/100 km.",
    faq: [
      { question: "Cum calculez corect consumul real?", answer: "Alimenteaza pana la plin, noteaza distanta si litrii consumati, apoi aplica formula." },
      { question: "Consumul din bord este suficient?", answer: "Este orientativ, dar calculul manual este de obicei mai apropiat de realitate." },
    ],
    relatedCalculatorKeys: ["trip-fuel-cost", "electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-consumul-real-la-masina"],
  },
  "trip-fuel-cost": {
    shortDescription: "Estimeaza cati litri consumi si cat te costa un drum pe baza distantei, consumului si pretului carburantului.",
    intro: "Calculatorul de cost auto transforma consumul mediu si pretul combustibilului intr-o estimare financiara usor de folosit.",
    interpretationNotes: "Rezultatul nu include taxe de drum, parcari sau variatii de consum cauzate de trafic ori viteza.",
    isFeatured: true,
    sortOrder: 70,
    example: "La 320 km, 7 l/100 km si 7.45 lei/l, costul este aproximativ 166.88 lei.",
    faq: [
      { question: "Pot folosi consumul mixt din fabrica?", answer: "Da, dar pentru estimari mai bune e preferabil consumul tau mediu real." },
      { question: "Include oras si autostrada separat?", answer: "Nu in varianta initiala; poti calcula separat doua scenarii." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "kw-cp", "electricity-cost"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
  },
  "kw-cp": {
    shortDescription: "Converteste rapid kilowati in cai putere si invers din acelasi calculator.",
    intro: "Convertorul KW in CP este util pentru comparatii auto, moto si specificatii tehnice unde apar ambele unitati.",
    interpretationNotes: "In specificatii tehnice pot aparea valori rotunjite, deci sunt posibile diferente mici fata de alte surse.",
    isFeatured: true,
    sortOrder: 80,
    example: "110 kW inseamna aproximativ 149.56 CP.",
    faq: [
      { question: "Cat inseamna 1 kW in CP?", answer: "1 kW este aproximativ 1.35962 CP." },
      { question: "Pot converti si invers?", answer: "Da, calculatorul functioneaza in ambele sensuri." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "trip-fuel-cost", "temperature-converter"],
    relatedArticleSlugs: ["kw-vs-cp-explicat-simplu"],
  },
  "electricity-cost": {
    shortDescription: "Estimeaza consumul lunar si costul energiei electrice pe baza puterii, timpului de utilizare si pretului pe kWh.",
    intro: "Calculatorul este util pentru electrocasnice, aparate de aer conditionat sau orice echipament pentru care vrei o estimare de cost.",
    interpretationNotes: "Consumul real poate varia in functie de cicluri de functionare, eficienta aparatului si tariful exact din contract.",
    isFeatured: true,
    sortOrder: 90,
    example: "Un aparat de 1500 W folosit 2 ore/zi consuma circa 90 kWh/luna, adica aproximativ 72 lei la 0.8 lei/kWh.",
    faq: [
      { question: "Cum transform watt in kWh?", answer: "Imparti puterea in W la 1000 pentru a obtine kW, apoi inmultesti cu orele de functionare." },
      { question: "Trebuie sa includ toate taxele in pretul pe kWh?", answer: "Ideal da, pentru o estimare mai apropiata de factura finala." },
    ],
    relatedCalculatorKeys: ["watts-to-kwh", "amps-to-watts", "kw-cp"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
  },
  "body-fat-us-navy": {
    shortDescription: "Estimeaza procentul de grasime corporala din circumferinte si inaltime folosind formula US Navy.",
    intro: "Calculatorul de grasime corporala este util cand vrei un reper mai fin decat BMI-ul si ai nevoie de o estimare orientativa a compozitiei corporale.",
    interpretationNotes: "Formula este orientativa si depinde mult de masuratori corecte. Diferente mici de centimetri pot schimba rezultatul mai mult decat te astepti.",
    isFeatured: false,
    sortOrder: 55,
    example: "Pentru 175 cm, 84 cm talie si 38 cm gat, rezultatul poate fi in jur de 17-18% la barbati.",
    faq: [
      { question: "Este mai util decat BMI?", answer: "De multe ori ofera mai mult context despre compozitia corporala, dar tot ramane o estimare, nu o masuratoare clinica." },
      { question: "Cum masor corect circumferintele?", answer: "Foloseste un centimetru flexibil, stai relaxat si masoara in acelasi punct de fiecare data pentru comparatii coerente." },
    ],
    relatedCalculatorKeys: ["bmi", "ideal-weight", "protein-intake"],
    relatedArticleSlugs: ["cum-estimezi-procentul-de-grasime-corporala"],
  },
  "ideal-weight": {
    shortDescription: "Calculeaza o greutate ideala orientativa in functie de inaltime si sex cu formula Devine.",
    intro: "Calculatorul de greutate ideala este util cand vrei un reper simplu pentru intervalul de greutate, fara sa-l tratezi ca obiectiv rigid.",
    interpretationNotes: "Greutatea ideala este un reper general. Nu surprinde masa musculara, structura corporala sau contextul individual al utilizatorului.",
    isFeatured: false,
    sortOrder: 57,
    example: "La 175 cm, formula Devine estimeaza aproximativ 70.5 kg pentru femei si 75 kg pentru barbati.",
    faq: [
      { question: "Greutatea ideala este acelasi lucru cu greutatea sanatoasa?", answer: "Nu neaparat. Este un reper statistic orientativ, nu un verdict medical sau estetic." },
      { question: "De ce merita combinata cu alte calcule?", answer: "Pentru ca BMI-ul, procentul de grasime si obiectivul personal ofera context mai bun decat o singura valoare." },
    ],
    relatedCalculatorKeys: ["bmi", "body-fat-us-navy", "water-intake"],
    relatedArticleSlugs: ["cum-estimezi-procentul-de-grasime-corporala"],
  },
  "water-intake": {
    shortDescription: "Estimeaza aportul zilnic de apa pornind de la greutate si ofera un reper usor de aplicat in rutina.",
    intro: "Calculatorul de apa este gandit pentru utilizatorii care vor un punct de plecare simplu, apoi isi ajusteaza hidratarea in functie de activitate, sezon si obiceiuri.",
    interpretationNotes: "Rezultatul nu inlocuieste semnalele reale ale corpului sau recomandarile medicale. Este mai util ca reper de organizare zilnica.",
    isFeatured: false,
    sortOrder: 58,
    example: "La 70 kg, regula de 35 ml/kg duce la aproximativ 2450 ml, adica 2.45 litri pe zi.",
    faq: [
      { question: "Trebuie sa beau exact atat in fiecare zi?", answer: "Nu. Necesarul variaza dupa temperatura, activitate, alimentatie si toleranta personala." },
      { question: "Apa din cafea, ceai sau alimente conteaza?", answer: "Da, aportul total de lichide conteaza, dar multi utilizatori prefera sa foloseasca apa ca reper principal." },
    ],
    relatedCalculatorKeys: ["tdee", "protein-intake", "ideal-weight"],
    relatedArticleSlugs: ["cata-apa-ai-nevoie-zilnic-cu-adevarat"],
  },
  "one-rep-max": {
    shortDescription: "Estimeaza repetarea maxima si o greutate utila de antrenament pornind de la o serie submaximala.",
    intro: "Calculatorul one rep max este util cand vrei sa planifici mai clar intensitatea la exercitii de forta fara sa testezi mereu un maxim real.",
    interpretationNotes: "Formula functioneaza mai bine pe seturi scurte si executii curate. La repetari multe sau tehnica instabila, estimarea devine mai slaba.",
    isFeatured: false,
    sortOrder: 59,
    example: "80 kg pentru 5 repetari duc la un 1RM estimat de aproximativ 93.3 kg si la circa 79.3 kg pentru 85% din 1RM.",
    faq: [
      { question: "Este nevoie sa testez un maxim real?", answer: "Nu intotdeauna. Pentru multi utilizatori, estimarea este suficienta ca reper de programare a antrenamentului." },
      { question: "Pentru cate repetari mai este util calculatorul?", answer: "De obicei functioneaza mai bine pana in jur de 8-10 repetari, dupa care precizia scade progresiv." },
    ],
    relatedCalculatorKeys: ["protein-intake", "tdee", "water-intake"],
    relatedArticleSlugs: ["cum-folosesti-one-rep-max-in-antrenament"],
  },
  "temperature-converter": {
    shortDescription: "Converteste instant temperaturile din grade Celsius in Fahrenheit si invers.",
    intro: "Convertorul de temperatura este util in retete, specificatii tehnice, prognoze si contexte internationale.",
    interpretationNotes: "Pentru uz obisnuit, rotunjirea la una sau doua zecimale este suficienta.",
    isFeatured: false,
    sortOrder: 97,
    example: "25C inseamna 77F.",
    faq: [
      { question: "Care este formula din Celsius in Fahrenheit?", answer: "F = C x 9/5 + 32." },
      { question: "Pot converti si invers?", answer: "Da, calculatorul functioneaza in ambele sensuri." },
    ],
    relatedCalculatorKeys: ["kg-lb", "cm-inch"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "cost-per-km": {
    shortDescription: "Calculeaza cat te costa combustibilul pe kilometru si pe 100 km folosind consumul mediu si pretul carburantului.",
    intro: "Calculatorul de cost pe kilometru este util cand vrei un reper foarte rapid pentru buget, comparatii intre masini sau intre doua trasee.",
    interpretationNotes: "Rezultatul include doar componenta de carburant. Nu ia in calcul revizii, anvelope, taxe sau deprecierea masinii.",
    isFeatured: false,
    sortOrder: 75,
    example: "La 7 l/100 km si 7.45 lei/l, costul de carburant este de aproximativ 0.522 lei/km si 52.15 lei/100 km.",
    faq: [
      { question: "Este acelasi lucru cu costul total al masinii?", answer: "Nu. Aici calculezi doar costul de carburant, nu costul complet de utilizare." },
      { question: "Cand este mai util acest calculator?", answer: "Cand vrei sa compari rapid doua masini, doua rute sau impactul unei schimbari de pret la carburant." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "trip-fuel-cost", "travel-time"],
    relatedArticleSlugs: ["cost-pe-kilometru-vs-cost-total-drum"],
  },
  "travel-time": {
    shortDescription: "Estimeaza durata unui drum din distanta si viteza medie, in ore si minute usor de interpretat.",
    intro: "Calculatorul de timp de calatorie este util pentru planificare rapida, mai ales cand vrei sa compari doua scenarii de traseu sau de viteza medie.",
    interpretationNotes: "Viteza medie reala este de obicei mai mica decat cea imaginata. Traficul, opririle si diferentele de drum pot schimba rapid estimarea.",
    isFeatured: false,
    sortOrder: 76,
    example: "Pentru 320 km si 78 km/h viteza medie, timpul estimat este de aproximativ 4.1 ore, adica 246 minute.",
    faq: [
      { question: "Pot folosi limita legala de viteza?", answer: "Mai bine folosesti viteza medie realista, altfel rezultatul va fi prea optimist." },
      { question: "Calculatorul include opriri sau trafic?", answer: "Nu automat. Le poti integra alegand o viteza medie mai apropiata de scenariul real." },
    ],
    relatedCalculatorKeys: ["trip-fuel-cost", "cost-per-km", "fuel-consumption"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
  },
  "amps-to-watts": {
    shortDescription: "Transforma amperii in wati pornind de la tensiune si afiseaza rezultatul si in kilowati.",
    intro: "Convertorul amperi in wati este util pentru intrebari tehnice simple despre putere electrica, mai ales cand eticheta sau discutia porneste de la intensitate.",
    interpretationNotes: "Formula simpla W = A x V este utila in scenarii de baza. Pentru sisteme mai complexe, factorul de putere sau tipul curentului pot conta.",
    isFeatured: false,
    sortOrder: 85,
    example: "La 10 A si 230 V, rezultatul este 2300 W, adica 2.3 kW.",
    faq: [
      { question: "Formula este mereu suficienta?", answer: "Pentru conversii simple, da. Pentru instalatii complexe sau curent alternativ cu factori suplimentari, poate fi doar orientativa." },
      { question: "De ce e util sa vad si kW?", answer: "Pentru ca multe specificatii si estimari de consum sunt exprimate in kilowati sau kWh, nu doar in wati." },
    ],
    relatedCalculatorKeys: ["watts-to-kwh", "electricity-cost", "kw-cp"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh"],
  },
  "watts-to-kwh": {
    shortDescription: "Calculeaza consumul energetic in kWh din puterea aparatului si timpul de functionare.",
    intro: "Calculatorul W in kWh este puntea practica dintre puterea afisata pe un aparat si consumul pe care il vezi apoi in estimari de factura.",
    interpretationNotes: "Rezultatul este foarte util pentru estimare, dar consumul real poate varia in functie de cicluri, randament si functionarea efectiva a aparatului.",
    isFeatured: false,
    sortOrder: 86,
    example: "1500 W folositi timp de 2 ore inseamna 3 kWh consumati.",
    faq: [
      { question: "Care este diferenta dintre W si kWh?", answer: "W descrie puterea intr-un moment dat, iar kWh descrie energia consumata pe o perioada de timp." },
      { question: "Cum folosesc rezultatul in costuri?", answer: "Dupa ce obtii kWh-ul, il inmultesti cu pretul energiei pentru a estima costul." },
    ],
    relatedCalculatorKeys: ["electricity-cost", "amps-to-watts", "kw-cp"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh", "cum-calculezi-consumul-electric-al-unui-aparat"],
  },
  "kg-lb": {
    shortDescription: "Converteste kilogramele in livre si invers pentru situatii uzuale din fitness, shopping sau documentatie internationala.",
    intro: "Convertorul kg in lb este util cand compari rapid greutati afisate in sisteme diferite si vrei un raspuns instant fara riscul unei conversii gresite.",
    interpretationNotes: "In multe contexte, doua zecimale sunt suficiente. Pentru uz cotidian, nu merita sa complici afisarea cu mai multa precizie decat ai nevoie.",
    isFeatured: false,
    sortOrder: 95,
    example: "70 kg inseamna aproximativ 154.32 lb, iar 180 lb inseamna aproximativ 81.65 kg.",
    faq: [
      { question: "De ce apar frecvent livrele in fitness?", answer: "Pentru ca multe surse internationale, echipamente si programe de antrenament folosesc sistemul imperial." },
      { question: "Cat de precisa este conversia?", answer: "Formula foloseste factorul standard si este suficient de precisa pentru uz obisnuit si comparatii practice." },
    ],
    relatedCalculatorKeys: ["cm-inch", "bmi", "temperature-converter"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "cm-inch": {
    shortDescription: "Converteste centimetri in inch si invers pentru dimensiuni personale, produse sau specificatii internationale.",
    intro: "Convertorul cm in inch este util in shopping, fitness, design si documentatie tehnica, mai ales cand alternezi des intre sistemul metric si cel imperial.",
    interpretationNotes: "La dimensiuni uzuale, doua zecimale sunt suficiente pentru majoritatea scenariilor. Important este mai ales sa nu inversezi sensul conversiei.",
    isFeatured: false,
    sortOrder: 96,
    example: "180 cm inseamna aproximativ 70.87 inch, iar 72 inch inseamna 182.88 cm.",
    faq: [
      { question: "In ce situatii apare cel mai des conversia?", answer: "Apare frecvent la haine, ecrane, inaltime corporala, mobilier si specificatii internationale." },
      { question: "Pot folosi rezultatul direct in alte calcule?", answer: "Da, de exemplu in formule care cer inch sau in conversii succesive pentru inaltime si greutate." },
    ],
    relatedCalculatorKeys: ["kg-lb", "ideal-weight", "temperature-converter"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
};

const articleSeeds: ArticleSeed[] = [
  {
    slug: "cum-interpretezi-bmi-corect",
    title: "Cum interpretezi BMI corect fara sa cazi in concluzii prea rapide",
    excerpt: "BMI este util, dar nu este suficient singur. Iata cum sa-l folosesti corect si cand trebuie completat cu alti indicatori.",
    content: "BMI este un indicator rapid, nu un verdict final despre starea ta de sanatate.\n\nPentru multi utilizatori, este primul calcul cautat atunci cand vor sa inteleaga daca greutatea actuala este aproape de un interval considerat normal. Tocmai de aceea merita folosit corect si interpretat in context, nu separat de restul datelor personale.\n\nFormula BMI leaga greutatea de inaltime si ofera un reper simplu, usor de comparat intre persoane sau intre etape diferite din acelasi proces de slabire ori mentinere. Avantajul lui este viteza. Limita lui este ca nu diferentiaza intre masa musculara si masa grasa.\n\nDin acest motiv, un rezultat mai mare nu inseamna automat exces de grasime, iar un rezultat aflat in intervalul standard nu inseamna neaparat ca toate celelalte repere sunt in regula. Sportivii, persoanele cu multa masa musculara sau cei care trec prin schimbari metabolice pot obtine valori care au nevoie de interpretare suplimentara.\n\nCel mai util mod de a privi BMI-ul este ca punct de plecare. Il poti completa cu calculatorul BMR, cu TDEE-ul si cu alte estimari legate de obiectivul tau, astfel incat rezultatul sa devina parte dintr-o imagine mai coerenta, nu doar o cifra izolata.",
    articleType: "explainer",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["bmi", "bmr", "tdee"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "bmr-vs-tdee-diferente",
    title: "BMR vs TDEE: diferentele care conteaza cand iti calculezi caloriile",
    excerpt: "BMR si TDEE sunt confundate des, dar au roluri diferite in planificarea unei diete.",
    content: "BMR si TDEE par apropiate, dar raspund la doua intrebari diferite.\n\nBMR, adica rata metabolica bazala, estimeaza cate calorii consuma corpul in repaus pentru functiile de baza: respiratie, circulatie, reglare termica si mentinerea organelor in functiune. Este o valoare de fundal, nu o tinta de alimentatie zilnica pentru majoritatea oamenilor activi.\n\nTDEE porneste de la BMR si adauga miscarea zilnica, antrenamentele si nivelul general de activitate. Din acest motiv, TDEE este de obicei cifra mai utila atunci cand vrei sa afli cate calorii poti consuma pentru mentinere, slabire sau crestere in greutate.\n\nConfuzia apare frecvent atunci cand cineva foloseste direct BMR-ul ca reper alimentar si ajunge la o tinta prea joasa. In practica, daca vrei sa-ti organizezi mesele sau sa setezi un deficit caloric, TDEE este baza mai relevanta, iar BMR ramane etapa intermediara care explica de unde porneste calculul.\n\nCel mai bun mod de a le folosi este impreuna: calculezi BMR-ul, il transformi in TDEE prin factorul de activitate, apoi ajustezi in functie de obiectiv si de raspunsul real al corpului dupa cateva saptamani.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["bmr", "tdee", "calorie-deficit"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cum-setezi-un-deficit-caloric",
    title: "Cum setezi un deficit caloric sustenabil pentru slabire",
    excerpt: "Un deficit prea mare poate sa-ti saboteze progresul. Iata cum alegi o tinta calorica mai realista.",
    content: "Deficitul caloric este diferenta dintre energia pe care o consumi si energia pe care o cheltui intr-o zi.\n\nIn teorie, ideea este simpla: mananci mai putin decat consumi si greutatea incepe sa scada. In practica, lucrurile devin mai nuantate, pentru ca un deficit prea agresiv poate duce la foame mare, oboseala, aderenta slaba si renuntare rapida.\n\nPentru multi oameni, un deficit moderat este un punct de pornire mai bun decat o taiere brusca a caloriilor. De aceea, un calculator de deficit caloric ar trebui folosit ca instrument de setare initiala, nu ca garantie ca rezultatul va arata identic la toata lumea.\n\nDupa ce obtii o tinta, cel mai important pas este observatia. Daca dupa doua-trei saptamani greutatea, energia si foamea merg intr-o directie dezechilibrata, tinta trebuie ajustata. Aici intervine diferenta dintre un calcul util si o strategie sustenabila.\n\nUn deficit bine setat iti ofera spatiu sa ramai consecvent. De aceea merita sa-l legi de TDEE, de aportul de proteine si de obiectivul real, nu doar de dorinta de a obtine un numar cat mai mic pe ecran.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["calorie-deficit", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cate-proteine-ai-nevoie-zilnic",
    title: "Cate proteine ai nevoie zilnic in functie de obiectiv",
    excerpt: "Necesarul de proteine difera intre mentinere, slabire si crestere musculara. Iata o regula simpla de pornire.",
    content: "Necesarul de proteine nu este acelasi pentru toata lumea.\n\nGreutatea corporala, nivelul de activitate, varsta si obiectivul fac diferenta intre o tinta minima pentru mentinere si una mai ridicata pentru slabire sau dezvoltare musculara. De aceea, o cifra fixa identica pentru toti este rar utila in practica.\n\nPentru multe persoane active, un interval raportat la kilogram corp ofera un punct de pornire mai bun decat o recomandare generica pe zi. Calculatorul de proteine tocmai asta face: transforma greutatea si obiectivul intr-o estimare usor de folosit in planificarea meselor.\n\nInterpretarea ramane totusi importanta. Daca esti in deficit caloric, un aport mai mare poate sustine satietatea si mentinerea masei musculare. Daca esti la mentinere si nu ai un volum mare de antrenament, o tinta mai moderata poate fi suficienta.\n\nCel mai util este sa folosesti rezultatul impreuna cu TDEE-ul si cu structura meselor tale zilnice. Astfel nu ramai doar cu un numar de grame, ci cu o tinta pe care o poti distribui realist in alimentatia de zi cu zi.",
    articleType: "explainer",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["protein-intake", "calorie-deficit", "tdee"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cum-calculezi-consumul-real-la-masina",
    title: "Cum calculezi consumul real la masina fara sa te bazezi doar pe bord",
    excerpt: "Consumul afisat in bord este util, dar nu este intotdeauna suficient. Iata metoda simpla pentru o estimare mai buna.",
    content: "Consumul afisat in bord este util pentru orientare rapida, dar nu este intotdeauna suficient daca vrei o estimare cat mai apropiata de realitate.\n\nCea mai simpla metoda practica este sa alimentezi pana la plin, sa notezi kilometrii parcursi si sa compari distanta cu cantitatea reala de carburant consumata. Formula ramane simpla, dar rezultatul devine mai valoros atunci cand este repetat pe mai multe plinuri.\n\nPe distante foarte scurte, traficul, relantiul, temperatura exterioara sau stilul de condus pot distorsiona usor concluzia. De aceea merita sa te uiti la o medie, nu la un singur drum. In felul acesta, consumul calculat devine mai util pentru buget si pentru comparatii intre trasee sau perioade.\n\nOdata ce stii consumul real, poti continua cu estimarea costului pe kilometru sau a costului total pentru un drum mai lung. Exact aici se leaga bine calculatoarele din categoria auto: unul iti da consumul, altul iti arata costul, iar altul iti estimeaza timpul.\n\nPrivit corect, consumul real nu este doar o curiozitate tehnica. Este un reper practic pentru decizii zilnice legate de buget, trasee si modul in care folosesti masina.",
    articleType: "guide",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["fuel-consumption", "cost-per-km", "trip-fuel-cost"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
    launchWave: "wave-2",
  },
  {
    slug: "cum-estimezi-costul-unei-calatorii-cu-masina",
    title: "Cum estimezi costul unei calatorii cu masina mai aproape de realitate",
    excerpt: "Un drum nu inseamna doar distanta. Consumul, pretul carburantului si viteza medie schimba estimarea finala.",
    content: "Costul unui drum nu inseamna doar distanta dintre punctul A si punctul B.\n\nPentru o estimare rezonabila ai nevoie de cel putin trei repere: distanta, consumul mediu real si pretul carburantului. Daca unul dintre ele este nerealist, si rezultatul final va fi mai degraba optimist decat util.\n\nIn practica, merita sa iei in calcul si tipul de traseu. Un drum cu mult oras, relanti sau diferente de nivel poate arata foarte diferit fata de o deplasare predominanta pe autostrada. De aceea, calculul devine mai bun atunci cand compari doua sau trei scenarii, nu doar unul singur.\n\nUn alt avantaj al estimarii corecte este ca o poti combina cu timpul de calatorie si cu costul pe kilometru. In momentul acela, drumul nu mai este doar o distanta, ci o decizie de buget si de planificare.\n\nUn calculator bun pentru costul calatoriei nu iti ofera doar un total. Iti da un punct de plecare pentru a compara rute, a pregati bugetul si a evita surprizele cand pretul carburantului sau consumul real sunt diferite de cele anticipate.",
    articleType: "guide",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["trip-fuel-cost", "travel-time", "cost-per-km"],
    relatedArticleSlugs: ["cum-calculezi-consumul-real-la-masina"],
    launchWave: "wave-2",
  },
  {
    slug: "kw-vs-cp-explicat-simplu",
    title: "KW vs CP explicat simplu: ce inseamna si cand conteaza diferenta",
    excerpt: "Kilowatii si caii putere descriu aceeasi idee, dar apar in contexte diferite. Iata cum le citesti corect.",
    content: "kW si CP sunt doua moduri uzuale de a exprima aceeasi idee: puterea dezvoltata de un motor sau de un echipament.\n\nConfuzia apare pentru ca unele documentatii folosesc kilowatii, altele caii putere, iar utilizatorul ajunge sa vrea conversia imediata fara sa piarda contextul. In special in zona auto, diferentele de afisare dintre acte, configuratoare si anunturi duc des la intrebari aparent simple, dar recurente.\n\nConversia in sine este directa. Problema reala apare atunci cand cifrele sunt rotunjite sau cand sursele folosesc conventii usor diferite. De aceea pot aparea mici variatii intre rezultatele afisate in locuri diferite, chiar daca toate pleaca de la aceeasi formula de baza.\n\nDin perspectiva utilizatorului, un convertor bun trebuie sa ofere doua lucruri: raspuns instant si o explicatie suficient de clara incat sa stii ce compari de fapt. Nu toate cautarile au nevoie de un articol lung, dar toate beneficiaza de o explicatie simpla si corecta.\n\nTocmai aici pagina devine utila: nu doar transforma kW in CP, ci iti arata si de ce vezi cand o unitate, cand cealalta, si cum sa citesti corect specificatiile unui motor sau ale unui aparat.",
    articleType: "explainer",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["kw-cp", "amps-to-watts", "watts-to-kwh"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-consumul-electric-al-unui-aparat",
    title: "Cum calculezi consumul electric al unui aparat fara formule complicate",
    excerpt: "Pornesti de la putere si timp de functionare, iar din aceste doua valori poti estima rapid consumul si costul.",
    content: "Calculul consumului electric al unui aparat devine simplu atunci cand separi clar doua notiuni: puterea instantanee si energia consumata in timp.\n\nPuterea in wati iti spune cat consuma aparatul intr-un anumit moment, in timp ce kWh-ul arata consumul acumulat pe durata functionarii. De aici porneste intreaga estimare: transformi puterea si timpul intr-o valoare de consum, apoi aplici pretul pe kWh ca sa obtii costul.\n\nMulte confuzii apar pentru ca utilizatorii compara direct wati cu bani, fara pasul intermediar. In realitate, costul nu vine din puterea afisata pe eticheta, ci din felul in care aparatul este folosit de-a lungul unei zile, saptamani sau luni.\n\nUn astfel de calculator este util nu doar pentru curiozitate, ci si pentru prioritizare. Daca vrei sa intelegi ce aparat conteaza mai mult in factura sau daca merita sa schimbi un obicei de consum, ai nevoie de o estimare rapida si usor de refacut.\n\nDe aceea merita legat de conversiile dintre wati si kWh, dar si de calculatorul de cost electric. Impreuna, ele transforma un calcul simplu intr-un raspuns practic pentru decizii de consum.",
    articleType: "guide",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["electricity-cost", "watts-to-kwh", "amps-to-watts"],
    relatedArticleSlugs: ["kw-vs-cp-explicat-simplu"],
    launchWave: "backlog",
  },
  {
    slug: "ghid-conversii-kg-lb-cm-inch",
    title: "Ghid rapid pentru conversii kg-lb si cm-inch in contexte de zi cu zi",
    excerpt: "Conversiile simple apar in fitness, shopping, retete si specificatii tehnice. Iata cum le folosesti fara sa gresesti unitatile.",
    content: "Conversiile intre kilograme si livre sau intre centimetri si inch apar peste tot: in surse internationale, in magazine, in fitness, in retete sau in specificatii tehnice.\n\nFormula este simpla, dar nevoia utilizatorului nu este doar matematica. De cele mai multe ori, persoana care cauta o conversie vrea o confirmare rapida, fara risc de eroare si fara sa piarda timp cu formule memorate pe jumatate.\n\nExact de aceea paginile de conversie functioneaza bine atunci cand ofera un raspuns instant, dar si cateva exemple usor de recunoscut. O valoare convertita capata mai mult sens cand este ancorata intr-un context real: greutate corporala, marime de produs, dimensiunea unui obiect sau temperatura dintr-o reteta.\n\nDin punct de vedere SEO, aceste cautari sunt answer-first, dar nu trebuie tratate ca pagini goale. Un minim de context si cateva legaturi catre conversii apropiate ajuta atat utilizatorul, cat si arhitectura interna a site-ului.\n\nUn convertor bun reduce frictiunea. Iti da raspunsul imediat, te lasa sa verifici rapid si te trimite mai departe doar atunci cand are sens sa continui cu o alta conversie sau cu o pagina mai explicativa.",
    articleType: "guide",
    relatedCategorySlug: "conversii",
    relatedCalculatorKeys: ["kg-lb", "cm-inch", "temperature-converter"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh"],
    launchWave: "backlog",
  },
  {
    slug: "cum-estimezi-procentul-de-grasime-corporala",
    title: "Cum estimezi procentul de grasime corporala fara sa supraevaluezi precizia",
    excerpt: "Formula US Navy este utila pentru orientare, dar valoarea ei vine din masuratori coerente si interpretare prudenta.",
    content: "Procentul de grasime corporala este cautat des pentru ca promite un raspuns mai fin decat BMI-ul. In multe cazuri chiar ofera mai mult context, dar numai daca este folosit cu asteptari corecte.\n\nFormula US Navy porneste de la circumferinte si inaltime, ceea ce o face accesibila si usor de repetat acasa. Tocmai repetabilitatea este unul dintre avantajele ei: daca masori in acelasi mod, poti urmari tendinte in timp mai usor decat daca schimbi metoda la fiecare cateva saptamani.\n\nLimita principala este ca masuratorile trebuie facute atent. Un centimetru in plus sau in minus la talie ori la gat poate schimba rezultatul suficient cat sa para ca ai progresat sau regresat mai mult decat s-a intamplat in realitate. De aceea, consistenta conteaza aproape la fel de mult ca formula.\n\nIn practica, procentul estimat de grasime corporala merita citit impreuna cu BMI-ul, cu greutatea actuala si cu obiectivul personal. Pentru unii utilizatori, progresul util inseamna schimbarea compozitiei corporale, nu doar scaderea unui numar pe cantar.\n\nCel mai sanatos mod de a folosi acest calculator este ca instrument de observatie, nu ca verdict perfect. Daca il tratezi astfel, pagina devine un reper bun pentru comparatii in timp si pentru setarea unor asteptari mai realiste.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["body-fat-us-navy", "bmi", "ideal-weight"],
    relatedArticleSlugs: ["cum-interpretezi-bmi-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cata-apa-ai-nevoie-zilnic-cu-adevarat",
    title: "Cata apa ai nevoie zilnic cu adevarat si cum folosesti corect un calculator simplu",
    excerpt: "Regula pe kilogram corp este un bun punct de plecare, dar hidratarea reala depinde de contextul de zi cu zi.",
    content: "Cand cineva cauta cata apa trebuie sa bea zilnic, de obicei cauta claritate, nu o formula complicata. Tocmai de aceea regulile simple, precum aportul estimat pe kilogram corp, raman atat de populare.\n\nAvantajul unui calculator simplu de hidratare este ca iti da imediat un reper. Fara acest punct de plecare, multi utilizatori fie subestimeaza constant cat beau, fie incearca sa urmeze recomandari generale care nu tin cont de greutate, vreme sau nivel de activitate.\n\nIn acelasi timp, hidratarea nu este un numar fix care trebuie respectat mecanic in fiecare zi. Temperatura, transpiratia, mesele, cafeaua, antrenamentele si chiar obiceiurile de somn pot muta nevoia reala in sus sau in jos.\n\nDe aceea merita sa folosesti calculatorul ca instrument de organizare. Iti setezi o tinta orientativa, o observi cateva zile si apoi o corectezi dupa cum te simti si dupa contextul concret. Exact aici devine utila pagina: traduce o formula simpla intr-o regula usor de aplicat, nu intr-o obligatie rigida.\n\nDaca o legi de alimentatie, de nivelul de activitate si de sezon, hidratarea devine mai usor de gestionat. Iar calculatorul ramane ceea ce trebuie sa fie: un reper practic, nu o sursa de presiune inutila.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["water-intake", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "backlog",
  },
  {
    slug: "cum-folosesti-one-rep-max-in-antrenament",
    title: "Cum folosesti one rep max in antrenament fara sa transformi totul intr-un test de ego",
    excerpt: "Estimarea 1RM este utila pentru programare, nu doar pentru a afla un numar mare pe hartie.",
    content: "One rep max este una dintre cele mai populare valori din antrenamentul de forta, dar si una dintre cele mai usor de interpretat gresit. Multi utilizatori il cauta ca pe un scor, cand de fapt valoarea lui reala apare in programare.\n\nUn calculator 1RM pleaca de la o serie submaximala si estimeaza ce ai putea ridica o singura data in conditii bune. Pentru majoritatea utilizatorilor, asta este mai practic si mai sigur decat sa testeze mereu un maxim real in sala.\n\nAvantajul apare imediat in planificare. Daca stii 1RM-ul estimat, poti calcula mai usor procente de lucru, poti organiza zilele grele si poti observa cand forta creste fara sa transformi fiecare saptamana intr-o competitie.\n\nTotusi, rezultatul trebuie citit cu prudenta. Cu cat setul folosit la intrare are mai multe repetari sau tehnica mai slaba, cu atat estimarea devine mai putin stabila. De aceea calculatorul este mai util ca reper intern decat ca adevar absolut.\n\nPrivit corect, 1RM-ul te ajuta sa aduci mai multa structura in antrenament. Nu iti spune totul despre progres, dar iti ofera un limbaj simplu prin care sa legi efortul de planificare si de obiectivele tale reale.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["one-rep-max", "protein-intake", "tdee"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "backlog",
  },
  {
    slug: "cost-pe-kilometru-vs-cost-total-drum",
    title: "Cost pe kilometru vs cost total de drum: ce iti spune fiecare si cand merita sa le compari",
    excerpt: "Cele doua estimari raspund la intrebari diferite. Una te ajuta la comparatii rapide, cealalta la bugetarea unui traseu.",
    content: "Costul pe kilometru si costul total al unui drum par calcule apropiate, dar servesc scopuri diferite. Exact de aceea merita sa le pui impreuna in acelasi cluster de continut.\n\nCostul pe kilometru este util atunci cand vrei un reper rapid si comparabil. Iti arata cum se schimba bugetul atunci cand variaza consumul sau pretul carburantului si te ajuta sa compari doua masini ori doua stiluri de condus fara sa pornesti mereu de la o distanta anume.\n\nCostul total de drum raspunde unei alte intrebari: cat te costa traseul pe care urmeaza sa il faci. Aici conteaza distanta, consumul, pretul carburantului si, uneori, chiar timpul estimat daca vrei sa pui planificarea in acelasi tablou.\n\nIn practica, cele doua calcule functioneaza mai bine impreuna. Unul iti da unitatea de comparatie, celalalt iti da suma concreta. Cand le legi si de consumul real, estimarile devin mult mai utile decat cifrele teoretice din acte sau din bord.\n\nDin perspectiva utilizatorului, aceasta este diferenta dintre o pagina care afiseaza un singur rezultat si un hub care chiar ajuta la decizie. Iar din perspectiva SEO, exact aici internal linking-ul devine natural: cost, consum si timp fac parte din aceeasi intentie de cautare.",
    articleType: "comparison",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["cost-per-km", "trip-fuel-cost", "fuel-consumption"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
    launchWave: "backlog",
  },
  {
    slug: "cum-transformi-amperii-in-wati-si-wati-in-kwh",
    title: "Cum transformi amperii in wati si watii in kWh fara sa amesteci puterea cu energia",
    excerpt: "Amperi, wati si kWh apar des impreuna, dar descriu lucruri diferite. Iata cum le legi corect intr-un calcul util.",
    content: "Confuzia dintre amperi, wati si kWh este foarte comuna pentru ca termenii apar des unul langa altul, dar nu descriu acelasi lucru. Exact de aici pornesc multe cautari care par simple si ajung sa aiba nevoie de explicatie, nu doar de formula.\n\nAmperii descriu intensitatea curentului, iar watii descriu puterea rezultata intr-un anumit moment. Daca mai adaugi si timpul de functionare, ajungi la kWh, adica energia consumata pe o perioada. Fara aceasta ordine, utilizatorul risca sa compare marimi diferite ca si cum ar fi acelasi lucru.\n\nDe aceea primul pas util este conversia corecta dintre amperi si wati, folosind tensiunea. Al doilea pas este transformarea puterii in consum energetic atunci cand aparatul functioneaza un anumit numar de ore. Abia dupa aceea are sens sa vorbesti despre costuri si factura.\n\nAcest lant de calcule este foarte util in practica: pentru electrocasnice, incalzire, echipamente de atelier sau orice situatie in care vrei sa estimezi rapid cat consuma ceva si daca merita sa schimbi modul de utilizare.\n\nPus corect intr-o pagina, acest subiect face legatura fireasca dintre conversii tehnice si calcule de cost. Asa utilizatorul pleaca nu doar cu un numar, ci cu o intelegere mai clara a relatiei dintre putere, timp si consum.",
    articleType: "guide",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["amps-to-watts", "watts-to-kwh", "electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
    launchWave: "backlog",
  },
];

const shouldPublishArticle = (seed: ArticleSeed) =>
  seed.publishByDefault === true || BATCH_01_ARTICLES.includes(seed.slug);

const buildCalculatorSeoBody = (
  definition: ReturnType<typeof getCalculatorDefinition>,
  meta: CalculatorMeta
) => {
  const categoryFrame = getCategoryFrame(definition.categorySlug);
  const relatedCalculatorTitles = (meta.relatedCalculatorKeys ?? [])
    .slice(0, 3)
    .map((relatedKey) => getCalculatorDefinition(relatedKey).title.toLowerCase());
  const relatedArticleTitles = (meta.relatedArticleSlugs ?? [])
    .slice(0, 2)
    .map(
      (slug) =>
        articleSeeds.find((article) => article.slug === slug)?.title.toLowerCase() ??
        slug.replace(/-/g, " ")
    );

  const relatedToolsSentence = relatedCalculatorTitles.length
    ? ` Daca vrei sa mergi mai departe, continua si cu ${toSentenceList(relatedCalculatorTitles)}.`
    : "";
  const relatedArticlesSentence = relatedArticleTitles.length
    ? ` Pentru intentii mai documentate, merita citite si ${toSentenceList(relatedArticleTitles)}.`
    : "";

  return [
    `${definition.title} este construit pentru situatiile in care vrei un raspuns rapid, dar si suficient context ca sa nu ramai doar cu o cifra afisata pe ecran. Formula folosita aici este ${definition.formulaName}, iar pagina explica pe scurt de unde vine rezultatul si in ce scenarii este util. In practica, acest tip de calcul apare ${categoryFrame.audience}, motiv pentru care am pastrat pagina simpla la nivel de UX, dar mai bogata in continut editorial.`,
    `Ca sa obtii un rezultat relevant, merita sa verifici unitatile introduse, sa completezi campurile cu valori realiste si sa refaci scenariul ori de cate ori datele se schimba. ${meta.example} Dupa calcul, interpretarea rezultatului conteaza la fel de mult ca formula in sine: ${meta.interpretationNotes} Tocmai de aceea pagina include exemple, intrebari frecvente si explicatii care reduc riscul de interpretare prea rapida sau prea simplista.`,
    `${categoryFrame.caution} ${categoryFrame.linkingLead}${relatedToolsSentence}${relatedArticlesSentence} In felul acesta, pagina nu functioneaza doar ca un tool izolat, ci ca o parte dintr-un hub SEO in care utilizatorul poate aprofunda usor subiectul si poate ajunge la alte raspunsuri complementare.`,
  ].join("\n\n");
};

const buildCalculatorBlocks = (
  definition: ReturnType<typeof getCalculatorDefinition>,
  meta: CalculatorMeta
) => {
  const calculatorLinks = (meta.relatedCalculatorKeys ?? []).map((relatedKey) => {
    const relatedDefinition = getCalculatorDefinition(relatedKey);

    return {
      label: relatedDefinition.title,
      href: `/calculatoare/${relatedDefinition.categorySlug}/${relatedDefinition.slug}`,
      description: `Completeaza analiza cu ${relatedDefinition.title.toLowerCase()} si mergi mai departe pe aceeasi intentie de cautare.`,
    };
  });

  const articleLinks = (meta.relatedArticleSlugs ?? []).map((slug) => {
    const article = articleSeeds.find((entry) => entry.slug === slug);

    return {
      label: article?.title ?? slug.replace(/-/g, " "),
      href: `/blog/${slug}`,
      description:
        article?.excerpt ??
        "Articol explicativ pentru utilizatorii care vor mai mult context decat formula de baza.",
    };
  });

  const linkItems = [
    ...calculatorLinks,
    ...articleLinks,
    {
      label: `Toate calculatoarele din ${definition.categorySlug}`,
      href: `/calculatoare/${definition.categorySlug}`,
      description:
        "Hub-ul de categorie grupeaza tool-uri apropiate semantic si intareste linking-ul intern din acelasi cluster.",
    },
    {
      label: "Vezi toate calculatoarele",
      href: "/calculatoare",
      description:
        "Indexul general este util pentru navigare, descoperire si distribuirea autoritatii interne spre paginile importante.",
    },
  ].slice(0, 6);

  const blocks: Array<Record<string, unknown>> = [
    {
      blockType: "story",
      eyebrow: "Context util",
      title: `Cum folosesti ${definition.title.toLowerCase()} fara sa ramai doar la cifra finala`,
      body: `${definition.formulaDescription} Scopul paginii este sa ofere un raspuns rapid, dar si context practic pentru urmatorul pas: comparatie, estimare, decizie sau verificare.`,
      tone: "mist",
    },
    {
      blockType: "facts",
      eyebrow: "Dintr-o privire",
      title: "Ce merita sa urmaresti pe aceasta pagina",
      intro:
        "Formula rezolva calculul instant, dar valoarea SEO vine din claritate, exemple si din legaturile spre alte pagini relevante.",
      tone: "sand",
      items: [
        {
          value: String(definition.inputs.length),
          label: "campuri de intrare",
          detail:
            "Campurile sunt gandite sa fie usor de completat pe mobil si desktop, fara pasi inutili.",
        },
        {
          value: String(definition.outputs.length),
          label: "rezultate afisate",
          detail:
            "Rezultatul principal este insotit de unitati clare si de explicatii pentru interpretare.",
        },
        {
          value: definition.categorySlug,
          label: "cluster tematic",
          detail:
            "Pagina este ancorata intr-o categorie care ajuta la linking intern si la dezvoltarea content hub-ului.",
        },
      ],
    },
  ];

  if (linkItems.length >= 2) {
    blocks.push({
      blockType: "links",
      eyebrow: "Internal linking",
      title: "Continua natural spre pagini utile din acelasi hub",
      intro:
        "Linkurile de mai jos sunt alese ca extensii firesti ale intentiei de cautare, nu doar ca recomandari generice.",
      tone: "night",
      items: linkItems,
    });
  }

  return blocks;
};

const buildCategoryBlocks = (seed: CategorySeed) => [
  {
    blockType: "story",
    eyebrow: `Categorie: ${seed.name}`,
    title: `Hub-ul ${seed.name.toLowerCase()} trebuie sa combine raspunsul rapid cu contextul util.`,
    body: `${seed.introContent} Internal linking-ul dintre calculatoare si articole este parte din produs, nu un artificiu de final.`,
    tone: "night",
  },
];

const getCounterSummary = (items: SeedItemResult[]): CounterSummary => ({
  created: items.filter((item) => item.status === "created").length,
  updated: items.filter((item) => item.status === "updated").length,
  skipped: items.filter((item) => item.status === "skipped").length,
  items,
});

const bootstrapHomepage = async (payload: Payload, force: boolean) => {
  const existing = (await payload.findGlobal({ slug: "homepage", depth: 0, draft: true, overrideAccess: true })) as Record<string, unknown>;
  const existingBlocks = Array.isArray(existing.contentBlocks) ? existing.contentBlocks : [];
  if (!force && existingBlocks.length > 0) {
    return { status: "skipped" as const };
  }

  await payload.updateGlobal({ slug: "homepage", overrideAccess: true, draft: false, data: homepageSeed });
  return { status: "updated" as const };
};

const bootstrapCategories = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  for (const seed of categorySeeds) {
    const existing = await payload.find({
      collection: "calculator-categories",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: seed.slug } },
    });

    const data = {
      ...seed,
      contentBlocks: buildCategoryBlocks(seed),
      seo: buildSeoPayload({
        metaTitle: `${seed.name} - calculatoare online utile`,
        metaDescription: seed.summary,
        canonicalPath: `/calculatoare/${seed.slug}`,
      }),
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key: seed.slug, status: "skipped" });
        continue;
      }
      await payload.update({ collection: "calculator-categories", id: existing.docs[0].id, overrideAccess: true, draft: false, data });
      results.push({ key: seed.slug, status: "updated" });
      continue;
    }

    await payload.create({ collection: "calculator-categories", overrideAccess: true, draft: false, data });
    results.push({ key: seed.slug, status: "created" });
  }

  return getCounterSummary(results);
};

const bootstrapFormulaLibrary = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  for (const key of CALCULATOR_KEYS) {
    const definition = getCalculatorDefinition(key);
    const existing = await payload.find({
      collection: "formula-library",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { formulaKey: { equals: key } },
    });

    const data = {
      title: definition.title,
      slug: definition.slug,
      formulaKey: key,
      expression: definition.formulaExpression,
      summary: definition.summary,
      explanation: definition.formulaDescription,
      variables: definition.inputs.map((input) => ({ name: input.name, label: input.label, unit: input.unit })),
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key, status: "skipped" });
        continue;
      }
      await payload.update({ collection: "formula-library", id: existing.docs[0].id, overrideAccess: true, draft: false, data });
      results.push({ key, status: "updated" });
      continue;
    }

    await payload.create({ collection: "formula-library", overrideAccess: true, draft: false, data });
    results.push({ key, status: "created" });
  }

  return getCounterSummary(results);
};

const bootstrapCalculators = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  const categories = await payload.find({ collection: "calculator-categories", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const categoryMap = new Map(
    categories.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "slug"), doc.id])
  );
  const formulas = await payload.find({ collection: "formula-library", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const formulaMap = new Map(
    formulas.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "formulaKey"), doc.id])
  );

  for (const key of CALCULATOR_KEYS) {
    const definition = getCalculatorDefinition(key);
    const meta: CalculatorMeta =
      calculatorMeta[key] ?? buildFallbackCalculatorMeta(key, definition);
    const publishCalculator = shouldPublishCalculator(key, meta);
    const existing = await payload.find({
      collection: "calculators",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { calculatorKey: { equals: key } },
    });

    const data = {
      title: definition.title,
      slug: definition.slug,
      calculatorKey: key,
      category: categoryMap.get(definition.categorySlug),
      formulaReference: formulaMap.get(key),
      shortDescription: meta.shortDescription,
      intro: meta.intro,
      seoBody: buildCalculatorSeoBody(definition, meta),
      interpretationNotes: meta.interpretationNotes,
      examples: [{ title: "Exemplu de calcul", narrative: meta.example }],
      faq: ensureCalculatorFaq(key, meta.faq),
      howToSteps: definition.howToSteps.map((step) => ({ step })),
      isFeatured: meta.isFeatured,
      sortOrder: meta.sortOrder,
      releaseBatch: meta.releaseBatch ?? defaultReleaseBatchForCalculator(key),
      editorialStatus: publishCalculator
        ? "published"
        : meta.editorialStatus ?? defaultEditorialStatusForCalculator(key),
      contentBlocks: buildCalculatorBlocks(definition, meta),
      seo: buildSeoPayload({
        metaTitle: `${definition.title} online`,
        metaDescription: meta.shortDescription,
        canonicalPath: `/calculatoare/${definition.categorySlug}/${definition.slug}`,
      }),
      _status: publishCalculator ? "published" : "draft",
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key, status: "skipped" });
        continue;
      }
      await payload.update({ collection: "calculators", id: existing.docs[0].id, overrideAccess: true, draft: false, data });
      results.push({ key, status: "updated" });
      continue;
    }

    await payload.create({ collection: "calculators", overrideAccess: true, draft: false, data });
    results.push({ key, status: "created" });
  }

  const calculatorDocs = await payload.find({ collection: "calculators", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const calculatorMap = new Map(
    calculatorDocs.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "calculatorKey"), doc.id])
  );

  for (const key of CALCULATOR_KEYS) {
    const meta: CalculatorMeta =
      calculatorMeta[key] ?? buildFallbackCalculatorMeta(key, getCalculatorDefinition(key));
    const doc = calculatorDocs.docs.find(
      (entry) => readStringField(entry as { [key: string]: unknown }, "calculatorKey") === key
    );
    if (!doc) {
      continue;
    }

    await payload.update({
      collection: "calculators",
      id: doc.id,
      overrideAccess: true,
      draft: false,
      data: {
        relatedCalculators: (meta.relatedCalculatorKeys ?? [])
          .map((item) => calculatorMap.get(item))
          .filter(Boolean),
      },
    });
  }

  return getCounterSummary(results);
};

const bootstrapArticles = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  const users = await payload.find({ collection: "users", depth: 0, pagination: false, limit: 1, overrideAccess: true });
  const authorID = users.docs[0]?.id;
  if (!authorID) {
    throw new Error("Bootstrap requires at least one CMS user to exist.");
  }

  const categories = await payload.find({ collection: "calculator-categories", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const categoryMap = new Map(
    categories.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "slug"), doc.id])
  );
  const calculators = await payload.find({ collection: "calculators", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const calculatorMap = new Map(
    calculators.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "calculatorKey"), doc.id])
  );

  for (const seed of articleSeeds) {
    const existing = await payload.find({ collection: "articles", depth: 0, limit: 1, pagination: false, overrideAccess: true, where: { slug: { equals: seed.slug } } });
    const publishArticle = shouldPublishArticle(seed);

    const data = {
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      content: seed.content,
      articleType: seed.articleType,
      relatedCategory: seed.relatedCategorySlug ? categoryMap.get(seed.relatedCategorySlug) : undefined,
      relatedCalculators: (seed.relatedCalculatorKeys ?? []).map((item) => calculatorMap.get(item)).filter(Boolean),
      launchWave: seed.launchWave ?? "backlog",
      releaseBatch: seed.releaseBatch ?? defaultReleaseBatchForArticle(seed),
      editorialStatus: publishArticle
        ? "published"
        : seed.editorialStatus ?? defaultEditorialStatusForArticle(seed),
      author: authorID,
      publishedAt: publishArticle ? new Date().toISOString() : undefined,
      aiDraft: { reviewStatus: publishArticle ? "reviewed" : "draft" },
      seo: buildSeoPayload({
        metaTitle: seed.title,
        metaDescription: seed.excerpt,
        canonicalPath: `/blog/${seed.slug}`,
      }),
      _status: publishArticle ? "published" : "draft",
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key: seed.slug, status: "skipped" });
        continue;
      }
      await payload.update({
        collection: "articles",
        id: existing.docs[0].id,
        overrideAccess: true,
        draft: !publishArticle,
        data,
      });
      results.push({ key: seed.slug, status: "updated" });
      continue;
    }

    await payload.create({
      collection: "articles",
      overrideAccess: true,
      draft: !publishArticle,
      data,
    });
    results.push({ key: seed.slug, status: "created" });
  }

  const articleDocs = await payload.find({ collection: "articles", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const articleMap = new Map(
    articleDocs.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "slug"), doc.id])
  );

  for (const seed of articleSeeds) {
    const article = articleDocs.docs.find(
      (entry) => readStringField(entry as { [key: string]: unknown }, "slug") === seed.slug
    );
    if (!article) {
      continue;
    }

    await payload.update({
      collection: "articles",
      id: article.id,
      overrideAccess: true,
      draft: !shouldPublishArticle(seed),
      data: {
        relatedArticles: (seed.relatedArticleSlugs ?? [])
          .map((slug) => articleMap.get(slug))
          .filter(Boolean),
      },
    });
  }

  for (const key of CALCULATOR_KEYS) {
    const meta: CalculatorMeta =
      calculatorMeta[key] ?? buildFallbackCalculatorMeta(key, getCalculatorDefinition(key));
    const calculator = calculators.docs.find(
      (entry) => readStringField(entry as { [key: string]: unknown }, "calculatorKey") === key
    );
    if (!calculator) {
      continue;
    }

    await payload.update({
      collection: "calculators",
      id: calculator.id,
      overrideAccess: true,
      draft: false,
      data: {
        relatedArticles: (meta.relatedArticleSlugs ?? [])
          .map((slug) => articleMap.get(slug))
          .filter(Boolean),
      },
    });
  }

  return getCounterSummary(results);
};

export const bootstrapCms = async (payload: Payload, options: BootstrapOptions = {}): Promise<BootstrapCmsResult> => {
  const force = options.force === true;
  const homepage = await bootstrapHomepage(payload, force);
  const categories = await bootstrapCategories(payload, force);
  const formulas = await bootstrapFormulaLibrary(payload, force);
  const calculators = await bootstrapCalculators(payload, force);
  const articles = await bootstrapArticles(payload, force);

  return { homepage, categories, formulas, calculators, articles };
};




