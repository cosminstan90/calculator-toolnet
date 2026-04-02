export type CalculatorKey =
  | "bmi"
  | "bmr"
  | "tdee"
  | "calorie-deficit"
  | "protein-intake"
  | "body-fat-us-navy"
  | "ideal-weight"
  | "water-intake"
  | "one-rep-max"
  | "fuel-consumption"
  | "trip-fuel-cost"
  | "cost-per-km"
  | "travel-time"
  | "kw-cp"
  | "electricity-cost"
  | "amps-to-watts"
  | "watts-to-kwh"
  | "kg-lb"
  | "cm-inch"
  | "temperature-converter"
  | "room-area"
  | "concrete-volume"
  | "paint-coverage"
  | "tile-coverage"
  | "laminate-flooring"
  | "food-cost"
  | "profit-margin"
  | "markup"
  | "break-even"
  | "roi";

export type CalculatorInputOption = {
  label: string;
  value: string;
};

export type CalculatorInputDefinition = {
  name: string;
  label: string;
  type: "number" | "select";
  description?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  defaultValue?: number | string;
  options?: CalculatorInputOption[];
};

export type CalculatorOutputDefinition = {
  name: string;
  label: string;
  description?: string;
  unit?: string;
  decimals?: number;
};

export type CalculatorDefinition = {
  key: CalculatorKey;
  title: string;
  slug: string;
  categorySlug: string;
  summary: string;
  formulaName: string;
  formulaExpression: string;
  formulaDescription: string;
  howToSteps: string[];
  inputs: CalculatorInputDefinition[];
  outputs: CalculatorOutputDefinition[];
  compute: (values: Record<string, number | string>) => Record<string, number>;
};

const activityFactors: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const deficitFactors: Record<string, number> = {
  slow: 0.9,
  moderate: 0.8,
  aggressive: 0.75,
};

const proteinFactors: Record<string, number> = {
  maintenance: 1.8,
  cut: 2.1,
  gain: 2,
};

const parseNumber = (value: number | string | undefined): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const parseText = (value: number | string | undefined): string => {
  return typeof value === "string" ? value : String(value ?? "");
};

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const calculateBmrBase = (values: Record<string, number | string>) => {
  const sex = parseText(values.sex) === "female" ? "female" : "male";
  const weightKg = parseNumber(values.weightKg);
  const heightCm = parseNumber(values.heightCm);
  const age = parseNumber(values.age);

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "female" ? base - 161 : base + 5;
};

export const CALCULATOR_DEFINITIONS: Record<CalculatorKey, CalculatorDefinition> = {
  bmi: {
    key: "bmi",
    title: "Calculator BMI / IMC",
    slug: "calculator-bmi-imc",
    categorySlug: "fitness",
    summary:
      "Calculeaza indicele de masa corporala pornind de la greutate si inaltime.",
    formulaName: "Indicele de masa corporala",
    formulaExpression: "BMI = greutate (kg) / [inaltime (m)]^2",
    formulaDescription:
      "Indicele de masa corporala imparte greutatea exprimata in kilograme la patratul inaltimii exprimate in metri.",
    howToSteps: [
      "Introdu greutatea in kilograme.",
      "Introdu inaltimea in centimetri.",
      "Citeste BMI-ul calculat automat si compara-l cu intervalele standard.",
    ],
    inputs: [
      {
        name: "weightKg",
        label: "Greutate",
        type: "number",
        unit: "kg",
        min: 20,
        max: 400,
        step: 0.1,
        required: true,
        defaultValue: 70,
      },
      {
        name: "heightCm",
        label: "Inaltime",
        type: "number",
        unit: "cm",
        min: 100,
        max: 250,
        step: 0.1,
        required: true,
        defaultValue: 170,
      },
    ],
    outputs: [
      {
        name: "bmi",
        label: "BMI / IMC",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const weightKg = parseNumber(values.weightKg);
      const heightMeters = parseNumber(values.heightCm) / 100;
      const bmi = heightMeters > 0 ? weightKg / (heightMeters * heightMeters) : 0;
      return { bmi: round(bmi, 2) };
    },
  },
  bmr: {
    key: "bmr",
    title: "Calculator BMR",
    slug: "calculator-bmr",
    categorySlug: "fitness",
    summary:
      "Estimeaza metabolismul bazal prin formula Mifflin-St Jeor.",
    formulaName: "Mifflin-St Jeor",
    formulaExpression:
      "BMR barbati = 10W + 6.25H - 5A + 5; BMR femei = 10W + 6.25H - 5A - 161",
    formulaDescription:
      "Formula Mifflin-St Jeor foloseste greutatea, inaltimea, varsta si sexul pentru a estima necesarul energetic in repaus.",
    howToSteps: [
      "Selecteaza sexul biologic pentru formula de baza.",
      "Completeaza varsta, greutatea si inaltimea.",
      "Rezultatul arata cate calorii ar consuma corpul in repaus pe parcursul unei zile.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Barbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "age",
        label: "Varsta",
        type: "number",
        unit: "ani",
        min: 15,
        max: 100,
        step: 1,
        required: true,
        defaultValue: 30,
      },
      {
        name: "weightKg",
        label: "Greutate",
        type: "number",
        unit: "kg",
        min: 20,
        max: 400,
        step: 0.1,
        required: true,
        defaultValue: 80,
      },
      {
        name: "heightCm",
        label: "Inaltime",
        type: "number",
        unit: "cm",
        min: 100,
        max: 250,
        step: 0.1,
        required: true,
        defaultValue: 180,
      },
    ],
    outputs: [
      {
        name: "bmr",
        label: "BMR estimat",
        unit: "kcal/zi",
        decimals: 0,
      },
    ],
    compute: (values) => ({
      bmr: round(calculateBmrBase(values), 0),
    }),
  },
  tdee: {
    key: "tdee",
    title: "Calculator TDEE",
    slug: "calculator-tdee",
    categorySlug: "fitness",
    summary:
      "Combina BMR-ul cu activitatea zilnica pentru a estima caloriile de mentinere.",
    formulaName: "TDEE = BMR x factor de activitate",
    formulaExpression: "TDEE = BMR x nivel de activitate",
    formulaDescription:
      "Total Daily Energy Expenditure inmulteste metabolismul bazal cu un factor care reflecta activitatea ta obisnuita.",
    howToSteps: [
      "Introdu aceleasi date de baza folosite pentru BMR.",
      "Alege nivelul de activitate care descrie media saptamanii.",
      "Rezultatul indica aportul caloric orientativ pentru mentinere.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Barbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "age",
        label: "Varsta",
        type: "number",
        unit: "ani",
        min: 15,
        max: 100,
        step: 1,
        required: true,
        defaultValue: 30,
      },
      {
        name: "weightKg",
        label: "Greutate",
        type: "number",
        unit: "kg",
        min: 20,
        max: 400,
        step: 0.1,
        required: true,
        defaultValue: 75,
      },
      {
        name: "heightCm",
        label: "Inaltime",
        type: "number",
        unit: "cm",
        min: 100,
        max: 250,
        step: 0.1,
        required: true,
        defaultValue: 175,
      },
      {
        name: "activityLevel",
        label: "Nivel activitate",
        type: "select",
        required: true,
        defaultValue: "moderate",
        options: [
          { label: "Sedentar", value: "sedentary" },
          { label: "Usor activ", value: "light" },
          { label: "Moderat", value: "moderate" },
          { label: "Foarte activ", value: "active" },
          { label: "Sport intens", value: "athlete" },
        ],
      },
    ],
    outputs: [
      {
        name: "bmr",
        label: "BMR",
        unit: "kcal/zi",
        decimals: 0,
      },
      {
        name: "tdee",
        label: "TDEE",
        unit: "kcal/zi",
        decimals: 0,
      },
    ],
    compute: (values) => {
      const bmr = calculateBmrBase(values);
      const factor = activityFactors[parseText(values.activityLevel)] ?? 1.55;
      return {
        bmr: round(bmr, 0),
        tdee: round(bmr * factor, 0),
      };
    },
  },
  "calorie-deficit": {
    key: "calorie-deficit",
    title: "Calculator calorii pentru slabire",
    slug: "calculator-calorii-slabire",
    categorySlug: "fitness",
    summary:
      "Transforma TDEE-ul intr-o tinta zilnica de calorii pentru deficit controlat.",
    formulaName: "Target caloric pentru deficit",
    formulaExpression: "Calorii tinta = TDEE x factor deficit",
    formulaDescription:
      "Poti porni de la TDEE si aplica un factor orientativ in functie de viteza de slabire dorita.",
    howToSteps: [
      "Introdu TDEE-ul estimat sau rezultat din calculatorul dedicat.",
      "Alege ritmul dorit pentru deficit.",
      "Rezultatul iti arata aportul caloric si deficitul zilnic aproximativ.",
    ],
    inputs: [
      {
        name: "tdee",
        label: "TDEE",
        type: "number",
        unit: "kcal/zi",
        min: 1000,
        max: 7000,
        step: 1,
        required: true,
        defaultValue: 2400,
      },
      {
        name: "pace",
        label: "Ritmul deficitului",
        type: "select",
        required: true,
        defaultValue: "moderate",
        options: [
          { label: "Lent (10%)", value: "slow" },
          { label: "Moderat (20%)", value: "moderate" },
          { label: "Agresiv (25%)", value: "aggressive" },
        ],
      },
    ],
    outputs: [
      {
        name: "targetCalories",
        label: "Calorii tinta",
        unit: "kcal/zi",
        decimals: 0,
      },
      {
        name: "dailyDeficit",
        label: "Deficit zilnic",
        unit: "kcal/zi",
        decimals: 0,
      },
    ],
    compute: (values) => {
      const tdee = parseNumber(values.tdee);
      const factor = deficitFactors[parseText(values.pace)] ?? 0.8;
      const targetCalories = tdee * factor;
      return {
        targetCalories: round(targetCalories, 0),
        dailyDeficit: round(tdee - targetCalories, 0),
      };
    },
  },
  "protein-intake": {
    key: "protein-intake",
    title: "Calculator necesar proteine",
    slug: "calculator-necesar-proteine",
    categorySlug: "fitness",
    summary:
      "Estimeaza aportul zilnic de proteine pe baza greutatii si a obiectivului.",
    formulaName: "Proteine zilnice",
    formulaExpression: "Proteine = greutate x factor in functie de obiectiv",
    formulaDescription:
      "Aportul de proteine este de obicei exprimat in grame per kilogram corp, iar factorul depinde de obiectivul principal.",
    howToSteps: [
      "Introdu greutatea actuala.",
      "Alege obiectivul principal.",
      "Citeste rezultatul in grame pe zi si distribuie-l pe mesele principale.",
    ],
    inputs: [
      {
        name: "weightKg",
        label: "Greutate",
        type: "number",
        unit: "kg",
        min: 20,
        max: 400,
        step: 0.1,
        required: true,
        defaultValue: 75,
      },
      {
        name: "goal",
        label: "Obiectiv",
        type: "select",
        required: true,
        defaultValue: "maintenance",
        options: [
          { label: "Mentinere", value: "maintenance" },
          { label: "Slabire", value: "cut" },
          { label: "Crestere musculara", value: "gain" },
        ],
      },
    ],
    outputs: [
      {
        name: "proteinGrams",
        label: "Proteine recomandate",
        unit: "g/zi",
        decimals: 0,
      },
    ],
    compute: (values) => {
      const weightKg = parseNumber(values.weightKg);
      const factor = proteinFactors[parseText(values.goal)] ?? 1.8;
      return {
        proteinGrams: round(weightKg * factor, 0),
      };
    },
  },
  "body-fat-us-navy": {
    key: "body-fat-us-navy",
    title: "Calculator procent grasime corporala",
    slug: "calculator-grasime-corporala",
    categorySlug: "fitness",
    summary:
      "Estimeaza procentul de grasime corporala folosind formula US Navy.",
    formulaName: "US Navy Body Fat",
    formulaExpression:
      "Barbati: 495 / (1.0324 - 0.19077 * log10(talie-gat) + 0.15456 * log10(inaltime)) - 450; Femei: 495 / (1.29579 - 0.35004 * log10(talie+sold-gat) + 0.22100 * log10(inaltime)) - 450",
    formulaDescription:
      "Formula US Navy foloseste circumferinte corporale si inaltimea pentru a estima procentul de grasime corporala.",
    howToSteps: [
      "Selecteaza sexul.",
      "Introdu inaltimea si circumferintele cerute.",
      "Citeste estimarea procentului de grasime corporala.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Barbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "heightCm",
        label: "Inaltime",
        type: "number",
        unit: "cm",
        min: 100,
        max: 250,
        step: 0.1,
        required: true,
        defaultValue: 175,
      },
      {
        name: "neckCm",
        label: "Circumferinta gat",
        type: "number",
        unit: "cm",
        min: 20,
        max: 70,
        step: 0.1,
        required: true,
        defaultValue: 38,
      },
      {
        name: "waistCm",
        label: "Circumferinta talie",
        type: "number",
        unit: "cm",
        min: 40,
        max: 200,
        step: 0.1,
        required: true,
        defaultValue: 84,
      },
      {
        name: "hipCm",
        label: "Circumferinta sold",
        type: "number",
        unit: "cm",
        min: 50,
        max: 200,
        step: 0.1,
        required: false,
        defaultValue: 98,
      },
    ],
    outputs: [
      {
        name: "bodyFatPercent",
        label: "Grasime corporala estimata",
        unit: "%",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const sex = parseText(values.sex);
      const heightCm = parseNumber(values.heightCm);
      const neckCm = parseNumber(values.neckCm);
      const waistCm = parseNumber(values.waistCm);
      const hipCm = parseNumber(values.hipCm);
      const denominator =
        sex === "female"
          ? 1.29579 -
            0.35004 * Math.log10(Math.max(waistCm + hipCm - neckCm, 1)) +
            0.221 * Math.log10(Math.max(heightCm, 1))
          : 1.0324 -
            0.19077 * Math.log10(Math.max(waistCm - neckCm, 1)) +
            0.15456 * Math.log10(Math.max(heightCm, 1));

      const bodyFatPercent = denominator > 0 ? 495 / denominator - 450 : 0;
      return { bodyFatPercent: round(bodyFatPercent, 2) };
    },
  },
  "ideal-weight": {
    key: "ideal-weight",
    title: "Calculator greutate ideala",
    slug: "calculator-greutate-ideala",
    categorySlug: "fitness",
    summary:
      "Estimeaza greutatea ideala folosind formula Devine.",
    formulaName: "Formula Devine",
    formulaExpression:
      "Barbati: 50 + 2.3 x (inaltime in inch - 60); Femei: 45.5 + 2.3 x (inaltime in inch - 60)",
    formulaDescription:
      "Formula Devine este folosita frecvent ca reper orientativ pentru greutatea ideala in functie de inaltime si sex.",
    howToSteps: [
      "Selecteaza sexul.",
      "Introdu inaltimea in centimetri.",
      "Citeste greutatea ideala estimata.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Barbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "heightCm",
        label: "Inaltime",
        type: "number",
        unit: "cm",
        min: 100,
        max: 250,
        step: 0.1,
        required: true,
        defaultValue: 175,
      },
    ],
    outputs: [
      {
        name: "idealWeightKg",
        label: "Greutate ideala estimata",
        unit: "kg",
        decimals: 1,
      },
    ],
    compute: (values) => {
      const sex = parseText(values.sex);
      const heightInches = parseNumber(values.heightCm) / 2.54;
      const base = sex === "female" ? 45.5 : 50;
      const idealWeightKg = base + Math.max(heightInches - 60, 0) * 2.3;
      return { idealWeightKg: round(idealWeightKg, 1) };
    },
  },
  "water-intake": {
    key: "water-intake",
    title: "Calculator aport zilnic de apa",
    slug: "calculator-aport-zilnic-apa",
    categorySlug: "fitness",
    summary:
      "Estimeaza aportul zilnic de apa in functie de greutate.",
    formulaName: "Necesar orientativ de apa",
    formulaExpression: "Apa (ml/zi) = greutate (kg) x 35",
    formulaDescription:
      "O regula simpla si frecvent folosita este 35 ml de apa pe kilogram corp, ajustata ulterior dupa clima si activitate.",
    howToSteps: [
      "Introdu greutatea actuala.",
      "Calculatorul estimeaza necesarul zilnic in mililitri si litri.",
      "Ajusteaza dupa activitate, temperatura si particularitati personale.",
    ],
    inputs: [
      {
        name: "weightKg",
        label: "Greutate",
        type: "number",
        unit: "kg",
        min: 20,
        max: 400,
        step: 0.1,
        required: true,
        defaultValue: 70,
      },
    ],
    outputs: [
      {
        name: "waterMl",
        label: "Necesar estimat",
        unit: "ml/zi",
        decimals: 0,
      },
      {
        name: "waterLiters",
        label: "Necesar estimat",
        unit: "l/zi",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const waterMl = parseNumber(values.weightKg) * 35;
      return {
        waterMl: round(waterMl, 0),
        waterLiters: round(waterMl / 1000, 2),
      };
    },
  },
  "one-rep-max": {
    key: "one-rep-max",
    title: "Calculator one rep max",
    slug: "calculator-one-rep-max",
    categorySlug: "fitness",
    summary:
      "Estimeaza repetarea maxima folosind formula Epley.",
    formulaName: "Formula Epley",
    formulaExpression: "1RM = greutate x (1 + repetari / 30)",
    formulaDescription:
      "Formula Epley este una dintre cele mai simple metode pentru a estima greutatea maxima pe o singura repetare pornind de la o serie submaximala.",
    howToSteps: [
      "Introdu greutatea ridicata.",
      "Introdu numarul de repetari realizate.",
      "Citeste 1RM-ul estimat si procentele utile pentru antrenament.",
    ],
    inputs: [
      {
        name: "weightKg",
        label: "Greutate ridicata",
        type: "number",
        unit: "kg",
        min: 1,
        max: 1000,
        step: 0.5,
        required: true,
        defaultValue: 80,
      },
      {
        name: "reps",
        label: "Repetari",
        type: "number",
        min: 1,
        max: 20,
        step: 1,
        required: true,
        defaultValue: 5,
      },
    ],
    outputs: [
      {
        name: "oneRepMax",
        label: "1RM estimat",
        unit: "kg",
        decimals: 1,
      },
      {
        name: "trainingWeight85",
        label: "85% din 1RM",
        unit: "kg",
        decimals: 1,
      },
    ],
    compute: (values) => {
      const oneRepMax =
        parseNumber(values.weightKg) * (1 + parseNumber(values.reps) / 30);
      return {
        oneRepMax: round(oneRepMax, 1),
        trainingWeight85: round(oneRepMax * 0.85, 1),
      };
    },
  },  "fuel-consumption": {
    key: "fuel-consumption",
    title: "Calculator consum combustibil",
    slug: "calculator-consum-combustibil",
    categorySlug: "auto",
    summary:
      "Calculeaza consumul mediu in litri la 100 km.",
    formulaName: "Consum mediu auto",
    formulaExpression: "Consum (l/100 km) = litri consumati / kilometri x 100",
    formulaDescription:
      "Formula standard pentru consumul mediu porneste de la litrii consumati si distanta parcursa.",
    howToSteps: [
      "Introdu distanta parcursa.",
      "Introdu litrii consumati pe acea distanta.",
      "Rezultatul afiseaza consumul mediu raportat la 100 km.",
    ],
    inputs: [
      {
        name: "distanceKm",
        label: "Distanta",
        type: "number",
        unit: "km",
        min: 1,
        max: 5000,
        step: 0.1,
        required: true,
        defaultValue: 500,
      },
      {
        name: "fuelLiters",
        label: "Combustibil consumat",
        type: "number",
        unit: "l",
        min: 0.1,
        max: 500,
        step: 0.01,
        required: true,
        defaultValue: 36,
      },
    ],
    outputs: [
      {
        name: "litersPer100Km",
        label: "Consum mediu",
        unit: "l/100 km",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const distanceKm = parseNumber(values.distanceKm);
      const fuelLiters = parseNumber(values.fuelLiters);
      const litersPer100Km = distanceKm > 0 ? (fuelLiters / distanceKm) * 100 : 0;
      return {
        litersPer100Km: round(litersPer100Km, 2),
      };
    },
  },
  "trip-fuel-cost": {
    key: "trip-fuel-cost",
    title: "Calculator cost calatorie auto",
    slug: "calculator-cost-calatorie-auto",
    categorySlug: "auto",
    summary:
      "Estimeaza litrii necesari si costul carburantului pentru un drum.",
    formulaName: "Cost calatorie auto",
    formulaExpression:
      "Litri necesari = distanta x consum / 100; cost = litri necesari x pret/litru",
    formulaDescription:
      "Pornesti de la consumul mediu exprimat in l/100 km si de la pretul carburantului pentru a estima costul unui traseu.",
    howToSteps: [
      "Introdu distanta calatoriei.",
      "Completeaza consumul mediu al masinii.",
      "Adauga pretul pe litru si citeste costul estimat.",
    ],
    inputs: [
      {
        name: "distanceKm",
        label: "Distanta",
        type: "number",
        unit: "km",
        min: 1,
        max: 5000,
        step: 0.1,
        required: true,
        defaultValue: 320,
      },
      {
        name: "consumption",
        label: "Consum mediu",
        type: "number",
        unit: "l/100 km",
        min: 0.1,
        max: 40,
        step: 0.01,
        required: true,
        defaultValue: 7,
      },
      {
        name: "fuelPrice",
        label: "Pret carburant",
        type: "number",
        unit: "lei/l",
        min: 0.1,
        max: 50,
        step: 0.01,
        required: true,
        defaultValue: 7.45,
      },
    ],
    outputs: [
      {
        name: "fuelNeeded",
        label: "Combustibil necesar",
        unit: "l",
        decimals: 2,
      },
      {
        name: "totalCost",
        label: "Cost estimat",
        unit: "lei",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const distanceKm = parseNumber(values.distanceKm);
      const consumption = parseNumber(values.consumption);
      const fuelPrice = parseNumber(values.fuelPrice);
      const fuelNeeded = (distanceKm * consumption) / 100;
      return {
        fuelNeeded: round(fuelNeeded, 2),
        totalCost: round(fuelNeeded * fuelPrice, 2),
      };
    },
  },
  "cost-per-km": {
    key: "cost-per-km",
    title: "Calculator cost pe kilometru",
    slug: "calculator-cost-pe-kilometru",
    categorySlug: "auto",
    summary:
      "Afla cat te costa carburantul pe fiecare kilometru parcurs.",
    formulaName: "Cost pe kilometru",
    formulaExpression: "Cost/km = (consum l/100 km x pret/litru) / 100",
    formulaDescription:
      "Formula transforma consumul mediu si pretul carburantului intr-un cost mediu pe kilometru.",
    howToSteps: [
      "Introdu consumul mediu.",
      "Introdu pretul carburantului pe litru.",
      "Citeste costul estimat pentru 1 km si 100 km.",
    ],
    inputs: [
      {
        name: "consumption",
        label: "Consum mediu",
        type: "number",
        unit: "l/100 km",
        min: 0.1,
        max: 40,
        step: 0.01,
        required: true,
        defaultValue: 7,
      },
      {
        name: "fuelPrice",
        label: "Pret carburant",
        type: "number",
        unit: "lei/l",
        min: 0.1,
        max: 50,
        step: 0.01,
        required: true,
        defaultValue: 7.45,
      },
    ],
    outputs: [
      { name: "costPerKm", label: "Cost per km", unit: "lei/km", decimals: 3 },
      { name: "costPer100Km", label: "Cost per 100 km", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const costPer100Km =
        parseNumber(values.consumption) * parseNumber(values.fuelPrice);
      return {
        costPerKm: round(costPer100Km / 100, 3),
        costPer100Km: round(costPer100Km, 2),
      };
    },
  },
  "travel-time": {
    key: "travel-time",
    title: "Calculator timp calatorie",
    slug: "calculator-timp-calatorie",
    categorySlug: "auto",
    summary:
      "Estimeaza durata unui drum in functie de distanta si viteza medie.",
    formulaName: "Timp = distanta / viteza",
    formulaExpression: "Timp (ore) = distanta (km) / viteza medie (km/h)",
    formulaDescription:
      "Durata unei calatorii se estimeaza impartind distanta la viteza medie realista.",
    howToSteps: [
      "Introdu distanta traseului.",
      "Introdu viteza medie estimata.",
      "Citeste durata in ore si minute.",
    ],
    inputs: [
      {
        name: "distanceKm",
        label: "Distanta",
        type: "number",
        unit: "km",
        min: 1,
        max: 5000,
        step: 0.1,
        required: true,
        defaultValue: 320,
      },
      {
        name: "averageSpeed",
        label: "Viteza medie",
        type: "number",
        unit: "km/h",
        min: 1,
        max: 200,
        step: 0.1,
        required: true,
        defaultValue: 78,
      },
    ],
    outputs: [
      { name: "hours", label: "Durata", unit: "ore", decimals: 2 },
      { name: "minutes", label: "Durata", unit: "minute", decimals: 0 },
    ],
    compute: (values) => {
      const hours =
        parseNumber(values.averageSpeed) > 0
          ? parseNumber(values.distanceKm) / parseNumber(values.averageSpeed)
          : 0;
      return {
        hours: round(hours, 2),
        minutes: round(hours * 60, 0),
      };
    },
  },  "kw-cp": {
    key: "kw-cp",
    title: "Convertor KW in CP",
    slug: "convertor-kw-in-cp",
    categorySlug: "energie",
    summary:
      "Converteste kilowati in cai putere si invers.",
    formulaName: "Conversie KW <-> CP",
    formulaExpression: "CP = kW x 1.35962; kW = CP / 1.35962",
    formulaDescription:
      "Conversia dintre kilowati si cai putere foloseste un factor fix de aproximativ 1.35962.",
    howToSteps: [
      "Alege directia conversiei.",
      "Introdu valoarea initiala.",
      "Citeste imediat valoarea convertita.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Directia conversiei",
        type: "select",
        required: true,
        defaultValue: "kw-to-cp",
        options: [
          { label: "kW in CP", value: "kw-to-cp" },
          { label: "CP in kW", value: "cp-to-kw" },
        ],
      },
      {
        name: "value",
        label: "Valoare",
        type: "number",
        min: 0,
        max: 5000,
        step: 0.01,
        required: true,
        defaultValue: 110,
      },
    ],
    outputs: [
      {
        name: "convertedValue",
        label: "Rezultat conversie",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const mode = parseText(values.mode);
      const value = parseNumber(values.value);
      const convertedValue =
        mode === "cp-to-kw" ? value / 1.35962 : value * 1.35962;
      return {
        convertedValue: round(convertedValue, 2),
      };
    },
  },
  "electricity-cost": {
    key: "electricity-cost",
    title: "Calculator cost consum electric",
    slug: "calculator-cost-consum-electric",
    categorySlug: "energie",
    summary:
      "Estimeaza consumul lunar si costul energiei electrice.",
    formulaName: "Cost consum electric",
    formulaExpression:
      "kWh/zi = (W / 1000) x ore; cost = kWh x pret pe kWh",
    formulaDescription:
      "Pornesti de la puterea aparatului, durata de functionare si pretul energiei pentru a estima costuri lunare si anuale.",
    howToSteps: [
      "Introdu puterea aparatului in wati.",
      "Completeaza numarul de ore de utilizare pe zi.",
      "Adauga pretul pe kWh si citeste consumul lunar si costul estimat.",
    ],
    inputs: [
      {
        name: "powerWatts",
        label: "Putere aparat",
        type: "number",
        unit: "W",
        min: 1,
        max: 20000,
        step: 1,
        required: true,
        defaultValue: 1500,
      },
      {
        name: "hoursPerDay",
        label: "Ore pe zi",
        type: "number",
        unit: "ore",
        min: 0,
        max: 24,
        step: 0.1,
        required: true,
        defaultValue: 2,
      },
      {
        name: "pricePerKwh",
        label: "Pret energie",
        type: "number",
        unit: "lei/kWh",
        min: 0.01,
        max: 10,
        step: 0.01,
        required: true,
        defaultValue: 0.8,
      },
    ],
    outputs: [
      {
        name: "monthlyKwh",
        label: "Consum lunar",
        unit: "kWh/luna",
        decimals: 2,
      },
      {
        name: "monthlyCost",
        label: "Cost lunar",
        unit: "lei",
        decimals: 2,
      },
      {
        name: "yearlyCost",
        label: "Cost anual",
        unit: "lei",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const powerWatts = parseNumber(values.powerWatts);
      const hoursPerDay = parseNumber(values.hoursPerDay);
      const pricePerKwh = parseNumber(values.pricePerKwh);
      const dailyKwh = (powerWatts / 1000) * hoursPerDay;
      const monthlyKwh = dailyKwh * 30;
      const monthlyCost = monthlyKwh * pricePerKwh;
      return {
        monthlyKwh: round(monthlyKwh, 2),
        monthlyCost: round(monthlyCost, 2),
        yearlyCost: round(monthlyCost * 12, 2),
      };
    },
  },
  "amps-to-watts": {
    key: "amps-to-watts",
    title: "Convertor amperi in wati",
    slug: "convertor-amperi-in-wati",
    categorySlug: "energie",
    summary:
      "Converteste amperi in wati pornind de la tensiune.",
    formulaName: "Putere electrica",
    formulaExpression: "W = A x V",
    formulaDescription:
      "In curent continuu sau in estimari simple, puterea in wati este produsul dintre intensitate si tensiune.",
    howToSteps: [
      "Introdu amperii.",
      "Introdu tensiunea in volti.",
      "Citeste puterea rezultata in wati si kilowati.",
    ],
    inputs: [
      {
        name: "amps",
        label: "Curent",
        type: "number",
        unit: "A",
        min: 0,
        max: 10000,
        step: 0.01,
        required: true,
        defaultValue: 10,
      },
      {
        name: "volts",
        label: "Tensiune",
        type: "number",
        unit: "V",
        min: 1,
        max: 10000,
        step: 1,
        required: true,
        defaultValue: 230,
      },
    ],
    outputs: [
      { name: "watts", label: "Putere", unit: "W", decimals: 2 },
      { name: "kilowatts", label: "Putere", unit: "kW", decimals: 3 },
    ],
    compute: (values) => {
      const watts = parseNumber(values.amps) * parseNumber(values.volts);
      return {
        watts: round(watts, 2),
        kilowatts: round(watts / 1000, 3),
      };
    },
  },
  "watts-to-kwh": {
    key: "watts-to-kwh",
    title: "Calculator W in kWh",
    slug: "calculator-wati-in-kwh",
    categorySlug: "energie",
    summary:
      "Transforma puterea in wati si timpul de functionare in consum energetic.",
    formulaName: "Consum energetic",
    formulaExpression: "kWh = (W / 1000) x ore",
    formulaDescription:
      "Pentru a estima consumul energetic, puterea in wati se converteste in kilowati si se inmulteste cu numarul de ore.",
    howToSteps: [
      "Introdu puterea aparatului in wati.",
      "Introdu numarul de ore de functionare.",
      "Citeste consumul rezultat in kWh.",
    ],
    inputs: [
      {
        name: "watts",
        label: "Putere",
        type: "number",
        unit: "W",
        min: 1,
        max: 20000,
        step: 1,
        required: true,
        defaultValue: 1500,
      },
      {
        name: "hours",
        label: "Timp de functionare",
        type: "number",
        unit: "ore",
        min: 0,
        max: 1000,
        step: 0.1,
        required: true,
        defaultValue: 2,
      },
    ],
    outputs: [
      { name: "kwh", label: "Consum", unit: "kWh", decimals: 3 },
    ],
    compute: (values) => {
      const kwh = (parseNumber(values.watts) / 1000) * parseNumber(values.hours);
      return { kwh: round(kwh, 3) };
    },
  },
  "kg-lb": {
    key: "kg-lb",
    title: "Convertor kg in lb",
    slug: "convertor-kg-in-lb",
    categorySlug: "conversii",
    summary:
      "Converteste kilograme in livre si invers.",
    formulaName: "Conversie masa",
    formulaExpression: "lb = kg x 2.20462; kg = lb / 2.20462",
    formulaDescription:
      "Conversia dintre kilograme si livre foloseste factorul fix 2.20462.",
    howToSteps: [
      "Alege sensul conversiei.",
      "Introdu valoarea initiala.",
      "Citeste rezultatul convertit automat.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Directia conversiei",
        type: "select",
        required: true,
        defaultValue: "kg-to-lb",
        options: [
          { label: "kg in lb", value: "kg-to-lb" },
          { label: "lb in kg", value: "lb-to-kg" },
        ],
      },
      {
        name: "value",
        label: "Valoare",
        type: "number",
        min: 0,
        max: 100000,
        step: 0.01,
        required: true,
        defaultValue: 70,
      },
    ],
    outputs: [
      { name: "convertedValue", label: "Rezultat conversie", decimals: 2 },
    ],
    compute: (values) => {
      const mode = parseText(values.mode);
      const value = parseNumber(values.value);
      const convertedValue = mode === "lb-to-kg" ? value / 2.20462 : value * 2.20462;
      return { convertedValue: round(convertedValue, 2) };
    },
  },
  "cm-inch": {
    key: "cm-inch",
    title: "Convertor cm in inch",
    slug: "convertor-cm-in-inch",
    categorySlug: "conversii",
    summary:
      "Converteste centimetri in inch si invers.",
    formulaName: "Conversie lungime",
    formulaExpression: "inch = cm / 2.54; cm = inch x 2.54",
    formulaDescription:
      "Conversia dintre centimetri si inch foloseste raportul fix de 2.54 centimetri pentru un inch.",
    howToSteps: [
      "Alege sensul conversiei.",
      "Introdu valoarea initiala.",
      "Citeste rezultatul convertit automat.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Directia conversiei",
        type: "select",
        required: true,
        defaultValue: "cm-to-inch",
        options: [
          { label: "cm in inch", value: "cm-to-inch" },
          { label: "inch in cm", value: "inch-to-cm" },
        ],
      },
      {
        name: "value",
        label: "Valoare",
        type: "number",
        min: 0,
        max: 100000,
        step: 0.01,
        required: true,
        defaultValue: 180,
      },
    ],
    outputs: [
      { name: "convertedValue", label: "Rezultat conversie", decimals: 2 },
    ],
    compute: (values) => {
      const mode = parseText(values.mode);
      const value = parseNumber(values.value);
      const convertedValue = mode === "inch-to-cm" ? value * 2.54 : value / 2.54;
      return { convertedValue: round(convertedValue, 2) };
    },
  },
  "temperature-converter": {
    key: "temperature-converter",
    title: "Convertor Celsius Fahrenheit",
    slug: "convertor-celsius-fahrenheit",
    categorySlug: "conversii",
    summary:
      "Converteste temperaturile din Celsius in Fahrenheit si invers.",
    formulaName: "Conversie temperatura",
    formulaExpression: "F = C x 9/5 + 32; C = (F - 32) x 5/9",
    formulaDescription:
      "Cele doua formule standard convertesc temperaturile intre cele mai folosite scari in contexte internationale.",
    howToSteps: [
      "Alege sensul conversiei.",
      "Introdu temperatura initiala.",
      "Citeste rezultatul convertit automat.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Directia conversiei",
        type: "select",
        required: true,
        defaultValue: "c-to-f",
        options: [
          { label: "Celsius in Fahrenheit", value: "c-to-f" },
          { label: "Fahrenheit in Celsius", value: "f-to-c" },
        ],
      },
      {
        name: "value",
        label: "Temperatura",
        type: "number",
        step: 0.1,
        required: true,
        defaultValue: 25,
      },
    ],
    outputs: [
      {
        name: "convertedValue",
        label: "Temperatura convertita",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const mode = parseText(values.mode);
      const value = parseNumber(values.value);
      const convertedValue =
        mode === "f-to-c" ? ((value - 32) * 5) / 9 : (value * 9) / 5 + 32;
      return {
        convertedValue: round(convertedValue, 2),
      };
    },
  },
  "room-area": {
    key: "room-area",
    title: "Calculator suprafata camera",
    slug: "calculator-suprafata-camera",
    categorySlug: "constructii",
    summary:
      "Calculeaza suprafata si perimetrul unei camere pornind de la lungime si latime.",
    formulaName: "Suprafata si perimetru dreptunghi",
    formulaExpression: "Suprafata = lungime x latime; Perimetru = 2 x (lungime + latime)",
    formulaDescription:
      "Formula standard pentru o camera dreptunghiulara foloseste lungimea si latimea pentru a estima suprafata utila si perimetrul.",
    howToSteps: [
      "Introdu lungimea camerei in metri.",
      "Introdu latimea camerei in metri.",
      "Citeste suprafata si perimetrul rezultate.",
    ],
    inputs: [
      {
        name: "lengthM",
        label: "Lungime",
        type: "number",
        unit: "m",
        min: 0.1,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 5,
      },
      {
        name: "widthM",
        label: "Latime",
        type: "number",
        unit: "m",
        min: 0.1,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 4,
      },
    ],
    outputs: [
      { name: "areaSqm", label: "Suprafata", unit: "mp", decimals: 2 },
      { name: "perimeterM", label: "Perimetru", unit: "m", decimals: 2 },
    ],
    compute: (values) => {
      const lengthM = parseNumber(values.lengthM);
      const widthM = parseNumber(values.widthM);
      return {
        areaSqm: round(lengthM * widthM, 2),
        perimeterM: round(2 * (lengthM + widthM), 2),
      };
    },
  },
  "concrete-volume": {
    key: "concrete-volume",
    title: "Calculator volum beton",
    slug: "calculator-volum-beton",
    categorySlug: "constructii",
    summary:
      "Estimeaza volumul de beton necesar pentru fundatii, placi sau alte turnari simple.",
    formulaName: "Volum dreptunghiular",
    formulaExpression: "Volum = lungime x latime x grosime",
    formulaDescription:
      "Volumul de beton pentru o forma simpla se estimeaza inmultind lungimea si latimea in metri cu grosimea exprimata in metri.",
    howToSteps: [
      "Introdu lungimea si latimea zonei in metri.",
      "Introdu grosimea stratului in centimetri.",
      "Citeste volumul rezultat in metri cubi si litri.",
    ],
    inputs: [
      {
        name: "lengthM",
        label: "Lungime",
        type: "number",
        unit: "m",
        min: 0.1,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 10,
      },
      {
        name: "widthM",
        label: "Latime",
        type: "number",
        unit: "m",
        min: 0.1,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 0.4,
      },
      {
        name: "depthCm",
        label: "Grosime",
        type: "number",
        unit: "cm",
        min: 1,
        max: 500,
        step: 0.1,
        required: true,
        defaultValue: 80,
      },
    ],
    outputs: [
      { name: "volumeM3", label: "Volum beton", unit: "m3", decimals: 3 },
      { name: "volumeLiters", label: "Volum beton", unit: "l", decimals: 0 },
    ],
    compute: (values) => {
      const volumeM3 =
        parseNumber(values.lengthM) *
        parseNumber(values.widthM) *
        (parseNumber(values.depthCm) / 100);
      return {
        volumeM3: round(volumeM3, 3),
        volumeLiters: round(volumeM3 * 1000, 0),
      };
    },
  },
  "paint-coverage": {
    key: "paint-coverage",
    title: "Calculator necesar vopsea",
    slug: "calculator-necesar-vopsea",
    categorySlug: "constructii",
    summary:
      "Estimeaza cata vopsea iti trebuie in functie de suprafata, numarul de straturi si acoperirea declarata.",
    formulaName: "Necesar vopsea",
    formulaExpression: "Litri necesari = (suprafata x straturi) / acoperire pe litru",
    formulaDescription:
      "Necesarul de vopsea se estimeaza impartind suprafata totala ajustata cu numarul de straturi la acoperirea declarata de produs.",
    howToSteps: [
      "Introdu suprafata de vopsit in metri patrati.",
      "Alege cate straturi vrei sa aplici si acoperirea produsului.",
      "Citeste litrii necesari si numarul estimat de galeti de 10 litri.",
    ],
    inputs: [
      {
        name: "areaSqm",
        label: "Suprafata",
        type: "number",
        unit: "mp",
        min: 0.1,
        max: 100000,
        step: 0.1,
        required: true,
        defaultValue: 48,
      },
      {
        name: "coats",
        label: "Numar straturi",
        type: "number",
        min: 1,
        max: 10,
        step: 1,
        required: true,
        defaultValue: 2,
      },
      {
        name: "coverageSqmPerLiter",
        label: "Acoperire produs",
        type: "number",
        unit: "mp/l",
        min: 0.1,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 10,
      },
    ],
    outputs: [
      { name: "litersNeeded", label: "Vopsea necesara", unit: "l", decimals: 2 },
      { name: "buckets10L", label: "Galeti de 10 l", decimals: 0 },
    ],
    compute: (values) => {
      const litersNeeded =
        (parseNumber(values.areaSqm) * parseNumber(values.coats)) /
        Math.max(parseNumber(values.coverageSqmPerLiter), 0.01);
      return {
        litersNeeded: round(litersNeeded, 2),
        buckets10L: Math.ceil(litersNeeded / 10),
      };
    },
  },
  "tile-coverage": {
    key: "tile-coverage",
    title: "Calculator necesar gresie si faianta",
    slug: "calculator-necesar-gresie-faianta",
    categorySlug: "constructii",
    summary:
      "Estimeaza suprafata cu pierderi si numarul de cutii pentru gresie sau faianta.",
    formulaName: "Necesar finisaj cu pierderi",
    formulaExpression: "Suprafata necesara = suprafata x (1 + pierderi); cutii = suprafata necesara / acoperire cutie",
    formulaDescription:
      "Necesarul de gresie sau faianta se estimeaza adaugand un procent de pierderi peste suprafata utila si impartind apoi la acoperirea unei cutii.",
    howToSteps: [
      "Introdu suprafata totala de acoperit.",
      "Alege procentul de pierderi si acoperirea unei cutii.",
      "Citeste suprafata ajustata si numarul de cutii necesare.",
    ],
    inputs: [
      {
        name: "areaSqm",
        label: "Suprafata",
        type: "number",
        unit: "mp",
        min: 0.1,
        max: 100000,
        step: 0.1,
        required: true,
        defaultValue: 24,
      },
      {
        name: "wastePercent",
        label: "Pierderi",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 10,
      },
      {
        name: "boxCoverageSqm",
        label: "Acoperire cutie",
        type: "number",
        unit: "mp",
        min: 0.1,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 1.44,
      },
    ],
    outputs: [
      { name: "requiredAreaSqm", label: "Suprafata ajustata", unit: "mp", decimals: 2 },
      { name: "boxesNeeded", label: "Cutii necesare", decimals: 0 },
    ],
    compute: (values) => {
      const requiredAreaSqm =
        parseNumber(values.areaSqm) * (1 + parseNumber(values.wastePercent) / 100);
      return {
        requiredAreaSqm: round(requiredAreaSqm, 2),
        boxesNeeded: Math.ceil(
          requiredAreaSqm / Math.max(parseNumber(values.boxCoverageSqm), 0.01),
        ),
      };
    },
  },
  "laminate-flooring": {
    key: "laminate-flooring",
    title: "Calculator necesar parchet",
    slug: "calculator-necesar-parchet",
    categorySlug: "constructii",
    summary:
      "Estimeaza numarul de pachete de parchet necesare pentru o camera sau o zona de lucru.",
    formulaName: "Necesar parchet cu rezerva",
    formulaExpression: "Suprafata necesara = suprafata x (1 + rezerva); pachete = suprafata necesara / acoperire pachet",
    formulaDescription:
      "Necesarul de parchet se calculeaza pe baza suprafetei, a rezervei pentru taieturi si a acoperirii declarate pe pachet.",
    howToSteps: [
      "Introdu suprafata de acoperit.",
      "Introdu procentul de rezerva si acoperirea pe pachet.",
      "Citeste suprafata ajustata si numarul de pachete necesare.",
    ],
    inputs: [
      {
        name: "areaSqm",
        label: "Suprafata",
        type: "number",
        unit: "mp",
        min: 0.1,
        max: 100000,
        step: 0.1,
        required: true,
        defaultValue: 18,
      },
      {
        name: "wastePercent",
        label: "Rezerva pentru taieturi",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 8,
      },
      {
        name: "packageCoverageSqm",
        label: "Acoperire pachet",
        type: "number",
        unit: "mp",
        min: 0.1,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 2.22,
      },
    ],
    outputs: [
      { name: "requiredAreaSqm", label: "Suprafata ajustata", unit: "mp", decimals: 2 },
      { name: "packagesNeeded", label: "Pachete necesare", decimals: 0 },
    ],
    compute: (values) => {
      const requiredAreaSqm =
        parseNumber(values.areaSqm) * (1 + parseNumber(values.wastePercent) / 100);
      return {
        requiredAreaSqm: round(requiredAreaSqm, 2),
        packagesNeeded: Math.ceil(
          requiredAreaSqm / Math.max(parseNumber(values.packageCoverageSqm), 0.01),
        ),
      };
    },
  },
  "food-cost": {
    key: "food-cost",
    title: "Calculator food cost",
    slug: "calculator-food-cost",
    categorySlug: "business",
    summary:
      "Calculeaza food cost-ul si profitul brut pe portie pornind de la costul ingredientelor si pretul de vanzare.",
    formulaName: "Food cost",
    formulaExpression: "Food cost (%) = cost ingrediente / pret vanzare x 100",
    formulaDescription:
      "Food cost-ul raporteaza costul ingredientelor la pretul de vanzare pentru a arata ce pondere consuma materia prima din pretul final.",
    howToSteps: [
      "Introdu costul ingredientelor pentru o portie.",
      "Introdu pretul de vanzare al portiei.",
      "Citeste procentul de food cost si profitul brut rezultat.",
    ],
    inputs: [
      {
        name: "ingredientCost",
        label: "Cost ingrediente",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 12.5,
      },
      {
        name: "sellingPrice",
        label: "Pret de vanzare",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 35,
      },
    ],
    outputs: [
      { name: "foodCostPercent", label: "Food cost", unit: "%", decimals: 2 },
      { name: "grossProfit", label: "Profit brut", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const ingredientCost = parseNumber(values.ingredientCost);
      const sellingPrice = Math.max(parseNumber(values.sellingPrice), 0.01);
      return {
        foodCostPercent: round((ingredientCost / sellingPrice) * 100, 2),
        grossProfit: round(sellingPrice - ingredientCost, 2),
      };
    },
  },
  "profit-margin": {
    key: "profit-margin",
    title: "Calculator marja profit",
    slug: "calculator-marja-profit",
    categorySlug: "business",
    summary:
      "Calculeaza marja de profit si profitul brut pornind de la cost si pretul de vanzare.",
    formulaName: "Marja profit",
    formulaExpression: "Marja (%) = (pret vanzare - cost) / pret vanzare x 100",
    formulaDescription:
      "Marja de profit arata ce procent din pretul de vanzare ramane dupa ce scazi costul direct.",
    howToSteps: [
      "Introdu costul produsului sau serviciului.",
      "Introdu pretul de vanzare.",
      "Citeste profitul brut si marja rezultata.",
    ],
    inputs: [
      {
        name: "costPrice",
        label: "Cost",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 70,
      },
      {
        name: "sellingPrice",
        label: "Pret de vanzare",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 100,
      },
    ],
    outputs: [
      { name: "grossProfit", label: "Profit brut", unit: "lei", decimals: 2 },
      { name: "marginPercent", label: "Marja", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const costPrice = parseNumber(values.costPrice);
      const sellingPrice = Math.max(parseNumber(values.sellingPrice), 0.01);
      const grossProfit = sellingPrice - costPrice;
      return {
        grossProfit: round(grossProfit, 2),
        marginPercent: round((grossProfit / sellingPrice) * 100, 2),
      };
    },
  },
  markup: {
    key: "markup",
    title: "Calculator markup",
    slug: "calculator-markup",
    categorySlug: "business",
    summary:
      "Calculeaza markup-ul comercial pornind de la cost si pretul de vanzare.",
    formulaName: "Markup comercial",
    formulaExpression: "Markup (%) = (pret vanzare - cost) / cost x 100",
    formulaDescription:
      "Markup-ul arata cu cat ai crescut costul de baza pentru a ajunge la pretul de vanzare.",
    howToSteps: [
      "Introdu costul direct.",
      "Introdu pretul de vanzare.",
      "Citeste markup-ul si profitul brut rezultat.",
    ],
    inputs: [
      {
        name: "costPrice",
        label: "Cost",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 70,
      },
      {
        name: "sellingPrice",
        label: "Pret de vanzare",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 100,
      },
    ],
    outputs: [
      { name: "grossProfit", label: "Profit brut", unit: "lei", decimals: 2 },
      { name: "markupPercent", label: "Markup", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const costPrice = Math.max(parseNumber(values.costPrice), 0.01);
      const sellingPrice = parseNumber(values.sellingPrice);
      const grossProfit = sellingPrice - costPrice;
      return {
        grossProfit: round(grossProfit, 2),
        markupPercent: round((grossProfit / costPrice) * 100, 2),
      };
    },
  },
  "break-even": {
    key: "break-even",
    title: "Calculator break-even",
    slug: "calculator-break-even",
    categorySlug: "business",
    summary:
      "Estimeaza pragul de rentabilitate in unitati pornind de la costuri fixe, cost variabil si pret de vanzare.",
    formulaName: "Prag de rentabilitate",
    formulaExpression: "Break-even unitati = costuri fixe / (pret de vanzare - cost variabil/unitate)",
    formulaDescription:
      "Pragul de rentabilitate arata cate unitati trebuie sa vinzi pana cand acoperi costurile fixe si nu mai esti pe pierdere.",
    howToSteps: [
      "Introdu costurile fixe totale.",
      "Introdu pretul de vanzare si costul variabil per unitate.",
      "Citeste contributia pe unitate si pragul de rentabilitate estimat.",
    ],
    inputs: [
      {
        name: "fixedCosts",
        label: "Costuri fixe",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 10000,
      },
      {
        name: "sellingPrice",
        label: "Pret de vanzare/unitate",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 75,
      },
      {
        name: "variableCost",
        label: "Cost variabil/unitate",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 0.01,
        required: true,
        defaultValue: 40,
      },
    ],
    outputs: [
      { name: "contributionPerUnit", label: "Contributie/unitate", unit: "lei", decimals: 2 },
      { name: "breakEvenUnits", label: "Prag rentabilitate", unit: "unitati", decimals: 0 },
    ],
    compute: (values) => {
      const contributionPerUnit =
        parseNumber(values.sellingPrice) - parseNumber(values.variableCost);
      const safeContribution = Math.max(contributionPerUnit, 0);
      return {
        contributionPerUnit: round(contributionPerUnit, 2),
        breakEvenUnits:
          safeContribution > 0
            ? Math.ceil(parseNumber(values.fixedCosts) / safeContribution)
            : 0,
      };
    },
  },
  roi: {
    key: "roi",
    title: "Calculator ROI",
    slug: "calculator-roi",
    categorySlug: "business",
    summary:
      "Calculeaza rentabilitatea unei investitii pornind de la costul investitiei si castigul obtinut.",
    formulaName: "Return on Investment",
    formulaExpression: "ROI (%) = (castig net / investitie) x 100",
    formulaDescription:
      "ROI-ul compara castigul net ramas dupa recuperarea investitiei cu suma investita initial.",
    howToSteps: [
      "Introdu costul investitiei.",
      "Introdu incasarile sau valoarea obtinuta.",
      "Citeste profitul net si ROI-ul rezultat.",
    ],
    inputs: [
      {
        name: "investmentCost",
        label: "Investitie",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 100000000,
        step: 0.01,
        required: true,
        defaultValue: 10000,
      },
      {
        name: "returnValue",
        label: "Valoare obtinuta",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 0.01,
        required: true,
        defaultValue: 13500,
      },
    ],
    outputs: [
      { name: "netProfit", label: "Profit net", unit: "lei", decimals: 2 },
      { name: "roiPercent", label: "ROI", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const investmentCost = Math.max(parseNumber(values.investmentCost), 0.01);
      const returnValue = parseNumber(values.returnValue);
      const netProfit = returnValue - investmentCost;
      return {
        netProfit: round(netProfit, 2),
        roiPercent: round((netProfit / investmentCost) * 100, 2),
      };
    },
  },
};

export const CALCULATOR_KEYS = Object.keys(
  CALCULATOR_DEFINITIONS
) as CalculatorKey[];

export const getCalculatorDefinition = (key: CalculatorKey) => {
  return CALCULATOR_DEFINITIONS[key];
};
