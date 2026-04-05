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
  | "percentage-of-number"
  | "percentage-change"
  | "reverse-percentage"
  | "discount"
  | "vat"
  | "reverse-vat"
  | "compound-interest"
  | "monthly-savings"
  | "savings-goal"
  | "loan-payment"
  | "room-area"
  | "concrete-volume"
  | "paint-coverage"
  | "tile-coverage"
  | "laminate-flooring"
  | "food-cost"
  | "profit-margin"
  | "markup"
  | "break-even"
  | "roi"
  | "salary-increase"
  | "hourly-rate"
  | "monthly-work-hours"
  | "annual-income"
  | "effective-tax-rate"
  | "credit-affordability"
  | "debt-to-income"
  | "loan-total-cost"
  | "refinance-savings"
  | "emergency-fund"
  | "savings-interest"
  | "retirement-savings"
  | "goal-timeline"
  | "lease-vs-loan"
  | "down-payment"
  | "roas"
  | "break-even-roas"
  | "aov"
  | "conversion-rate"
  | "cpl"
  | "cac"
  | "target-revenue"
  | "gross-profit"
  | "net-profit"
  | "inventory-turnover"
  | "appliance-electricity-cost"
  | "monthly-electricity-bill"
  | "solar-system-size"
  | "solar-production"
  | "solar-panel-count"
  | "solar-payback"
  | "ac-btu"
  | "heating-load"
  | "heat-pump-size"
  | "solar-battery-size"
  | "fridge-electricity-cost"
  | "boiler-electricity-cost"
  | "ac-electricity-cost"
  | "led-savings"
  | "solar-roof-area"
  | "solar-inverter-size"
  | "solar-self-consumption"
  | "ups-runtime"
  | "heating-cost-comparison"
  | "solar-co2-savings"
  | "price-per-sqm"
  | "property-down-payment"
  | "property-total-purchase-cost"
  | "rent-vs-buy"
  | "renovation-budget"
  | "furniture-budget"
  | "monthly-home-budget"
  | "price-negotiation"
  | "space-per-person"
  | "mortgage-buffer"
  | "rental-yield"
  | "cash-on-cash-return"
  | "vacancy-loss"
  | "rent-increase"
  | "property-flip-margin"
  | "property-management-fee"
  | "closing-cost-share"
  | "room-rental-income"
  | "service-charge-budget"
  | "rental-break-even-occupancy";

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
  "percentage-of-number": {
    key: "percentage-of-number",
    title: "Calculator procent din numar",
    slug: "calculator-procent-din-numar",
    categorySlug: "finante",
    summary:
      "Calculeaza rapid cat inseamna un procent dintr-o valoare data.",
    formulaName: "Procent din numar",
    formulaExpression: "Rezultat = valoare x procent / 100",
    formulaDescription:
      "Formula standard pentru procent din numar inmulteste valoarea de baza cu procentul si imparte rezultatul la 100.",
    howToSteps: [
      "Introdu valoarea de baza.",
      "Introdu procentul pe care vrei sa il aplici.",
      "Citeste imediat suma rezultata.",
    ],
    inputs: [
      {
        name: "baseValue",
        label: "Valoare de baza",
        type: "number",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 1500,
      },
      {
        name: "percentage",
        label: "Procent",
        type: "number",
        unit: "%",
        min: 0,
        max: 10000,
        step: 0.01,
        required: true,
        defaultValue: 19,
      },
    ],
    outputs: [
      { name: "result", label: "Rezultat", decimals: 2 },
    ],
    compute: (values) => ({
      result: round((parseNumber(values.baseValue) * parseNumber(values.percentage)) / 100, 2),
    }),
  },
  "percentage-change": {
    key: "percentage-change",
    title: "Calculator diferenta procentuala",
    slug: "calculator-diferenta-procentuala",
    categorySlug: "finante",
    summary:
      "Arata cu cat a crescut sau a scazut o valoare in procente intre doua momente.",
    formulaName: "Diferenta procentuala",
    formulaExpression: "Variatie (%) = (valoare noua - valoare veche) / valoare veche x 100",
    formulaDescription:
      "Diferenta procentuala compara valoarea noua cu cea initiala si arata ritmul de crestere sau scadere in procente.",
    howToSteps: [
      "Introdu valoarea initiala.",
      "Introdu valoarea noua.",
      "Citeste diferenta absoluta si variatia procentuala.",
    ],
    inputs: [
      {
        name: "initialValue",
        label: "Valoare initiala",
        type: "number",
        min: 0.01,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 100,
      },
      {
        name: "newValue",
        label: "Valoare noua",
        type: "number",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 125,
      },
    ],
    outputs: [
      { name: "absoluteChange", label: "Diferenta absoluta", decimals: 2 },
      { name: "percentageChange", label: "Diferenta procentuala", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const initialValue = Math.max(parseNumber(values.initialValue), 0.01);
      const newValue = parseNumber(values.newValue);
      const absoluteChange = newValue - initialValue;
      return {
        absoluteChange: round(absoluteChange, 2),
        percentageChange: round((absoluteChange / initialValue) * 100, 2),
      };
    },
  },
  "reverse-percentage": {
    key: "reverse-percentage",
    title: "Calculator procent invers",
    slug: "calculator-procent-invers",
    categorySlug: "finante",
    summary:
      "Afla valoarea initiala atunci cand stii rezultatul final si procentul de crestere sau reducere.",
    formulaName: "Procent invers",
    formulaExpression:
      "Valoare initiala = valoare finala / (1 +/- procent / 100)",
    formulaDescription:
      "Calculatorul inverseaza o crestere sau o reducere procentuala pentru a estima valoarea de pornire.",
    howToSteps: [
      "Alege daca procentul a fost aplicat ca reducere sau ca majorare.",
      "Introdu valoarea finala si procentul folosit.",
      "Citeste valoarea initiala estimata.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Tip procent",
        type: "select",
        required: true,
        defaultValue: "decrease",
        options: [
          { label: "Reducere", value: "decrease" },
          { label: "Majorare", value: "increase" },
        ],
      },
      {
        name: "finalValue",
        label: "Valoare finala",
        type: "number",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 81,
      },
      {
        name: "percentage",
        label: "Procent aplicat",
        type: "number",
        unit: "%",
        min: 0,
        max: 10000,
        step: 0.01,
        required: true,
        defaultValue: 10,
      },
    ],
    outputs: [
      { name: "initialValue", label: "Valoare initiala", decimals: 2 },
    ],
    compute: (values) => {
      const mode = parseText(values.mode);
      const finalValue = parseNumber(values.finalValue);
      const percentage = parseNumber(values.percentage) / 100;
      const divisor = mode === "increase" ? 1 + percentage : 1 - percentage;
      return {
        initialValue: divisor > 0 ? round(finalValue / divisor, 2) : 0,
      };
    },
  },
  discount: {
    key: "discount",
    title: "Calculator discount",
    slug: "calculator-discount",
    categorySlug: "finante",
    summary:
      "Calculeaza valoarea reducerii si pretul final dupa aplicarea unui discount procentual.",
    formulaName: "Discount procentual",
    formulaExpression: "Reducere = pret initial x procent / 100; pret final = pret initial - reducere",
    formulaDescription:
      "Discountul procentual porneste de la pretul initial si scade procentul selectat pentru a obtine reducerea si pretul final.",
    howToSteps: [
      "Introdu pretul initial.",
      "Introdu procentul de discount.",
      "Citeste reducerea si pretul final.",
    ],
    inputs: [
      {
        name: "initialPrice",
        label: "Pret initial",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 299.99,
      },
      {
        name: "discountPercent",
        label: "Discount",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 15,
      },
    ],
    outputs: [
      { name: "discountAmount", label: "Reducere", unit: "lei", decimals: 2 },
      { name: "finalPrice", label: "Pret final", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const initialPrice = parseNumber(values.initialPrice);
      const discountAmount = (initialPrice * parseNumber(values.discountPercent)) / 100;
      return {
        discountAmount: round(discountAmount, 2),
        finalPrice: round(initialPrice - discountAmount, 2),
      };
    },
  },
  vat: {
    key: "vat",
    title: "Calculator TVA",
    slug: "calculator-tva",
    categorySlug: "finante",
    summary:
      "Adauga TVA peste o suma neta si afiseaza separat baza, TVA-ul si totalul.",
    formulaName: "TVA adaugat peste net",
    formulaExpression: "TVA = baza neta x cota TVA / 100; total = baza neta + TVA",
    formulaDescription:
      "Calculatorul TVA porneste de la suma neta si aplica cota de TVA pentru a obtine valoarea taxei si totalul cu TVA inclus.",
    howToSteps: [
      "Introdu suma neta.",
      "Alege sau introdu cota TVA.",
      "Citeste TVA-ul si suma totala cu TVA.",
    ],
    inputs: [
      {
        name: "netAmount",
        label: "Suma fara TVA",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 1000,
      },
      {
        name: "vatRate",
        label: "Cota TVA",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 19,
      },
    ],
    outputs: [
      { name: "vatAmount", label: "TVA", unit: "lei", decimals: 2 },
      { name: "grossAmount", label: "Total cu TVA", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const netAmount = parseNumber(values.netAmount);
      const vatAmount = (netAmount * parseNumber(values.vatRate)) / 100;
      return {
        vatAmount: round(vatAmount, 2),
        grossAmount: round(netAmount + vatAmount, 2),
      };
    },
  },
  "reverse-vat": {
    key: "reverse-vat",
    title: "Calculator TVA invers",
    slug: "calculator-tva-invers",
    categorySlug: "finante",
    summary:
      "Scoate TVA-ul dintr-o suma bruta si afiseaza baza neta si taxa corespunzatoare.",
    formulaName: "TVA scos din brut",
    formulaExpression: "Baza neta = suma bruta / (1 + cota TVA / 100); TVA = suma bruta - baza neta",
    formulaDescription:
      "Calculatorul TVA invers porneste de la totalul cu TVA inclus si separa baza neta de componenta fiscala.",
    howToSteps: [
      "Introdu suma cu TVA inclus.",
      "Alege sau introdu cota TVA.",
      "Citeste baza neta si valoarea TVA-ului inclus.",
    ],
    inputs: [
      {
        name: "grossAmount",
        label: "Suma cu TVA",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 1190,
      },
      {
        name: "vatRate",
        label: "Cota TVA",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 19,
      },
    ],
    outputs: [
      { name: "netAmount", label: "Suma fara TVA", unit: "lei", decimals: 2 },
      { name: "vatAmount", label: "TVA inclus", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const grossAmount = parseNumber(values.grossAmount);
      const divisor = 1 + parseNumber(values.vatRate) / 100;
      const netAmount = divisor > 0 ? grossAmount / divisor : 0;
      return {
        netAmount: round(netAmount, 2),
        vatAmount: round(grossAmount - netAmount, 2),
      };
    },
  },
  "compound-interest": {
    key: "compound-interest",
    title: "Calculator dobanda compusa",
    slug: "calculator-dobanda-compusa",
    categorySlug: "finante",
    summary:
      "Estimeaza valoarea viitoare a unei sume investite cu dobanda compusa.",
    formulaName: "Dobanda compusa",
    formulaExpression: "FV = principal x (1 + rata / capitalizari)^ (capitalizari x ani)",
    formulaDescription:
      "Dobanda compusa creste capitalul initial prin reinvestirea castigurilor la fiecare perioada de capitalizare.",
    howToSteps: [
      "Introdu suma initiala.",
      "Introdu rata anuala, numarul de ani si frecventa capitalizarii.",
      "Citeste valoarea finala si castigul total.",
    ],
    inputs: [
      {
        name: "principal",
        label: "Suma initiala",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 10000,
      },
      {
        name: "annualRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 7,
      },
      {
        name: "years",
        label: "Perioada",
        type: "number",
        unit: "ani",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 10,
      },
      {
        name: "compoundsPerYear",
        label: "Capitalizari pe an",
        type: "number",
        min: 1,
        max: 365,
        step: 1,
        required: true,
        defaultValue: 12,
      },
    ],
    outputs: [
      { name: "futureValue", label: "Valoare viitoare", unit: "lei", decimals: 2 },
      { name: "interestEarned", label: "Dobanda acumulata", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const principal = parseNumber(values.principal);
      const annualRate = parseNumber(values.annualRate) / 100;
      const years = parseNumber(values.years);
      const compoundsPerYear = Math.max(parseNumber(values.compoundsPerYear), 1);
      const futureValue =
        principal * (1 + annualRate / compoundsPerYear) ** (compoundsPerYear * years);
      return {
        futureValue: round(futureValue, 2),
        interestEarned: round(futureValue - principal, 2),
      };
    },
  },
  "monthly-savings": {
    key: "monthly-savings",
    title: "Calculator economii lunare",
    slug: "calculator-economii-lunare",
    categorySlug: "finante",
    summary:
      "Estimeaza cat se aduna in timp din economii lunare recurente, cu sau fara dobanda.",
    formulaName: "Valoare viitoare a unei anuitati",
    formulaExpression:
      "FV = contributie lunara x [((1 + rata lunara)^luni - 1) / rata lunara]",
    formulaDescription:
      "Economiile lunare recurente pot fi proiectate in timp folosind rata lunara a dobanzii si numarul total de luni.",
    howToSteps: [
      "Introdu suma economisita lunar.",
      "Introdu dobanda anuala si numarul de ani.",
      "Citeste totalul acumulat si contributia proprie.",
    ],
    inputs: [
      {
        name: "monthlyContribution",
        label: "Economisire lunara",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 500,
      },
      {
        name: "annualRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 5,
      },
      {
        name: "years",
        label: "Perioada",
        type: "number",
        unit: "ani",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 5,
      },
    ],
    outputs: [
      { name: "futureValue", label: "Total acumulat", unit: "lei", decimals: 2 },
      { name: "totalContributions", label: "Contributii proprii", unit: "lei", decimals: 2 },
      { name: "interestEarned", label: "Dobanda acumulata", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyContribution = parseNumber(values.monthlyContribution);
      const annualRate = parseNumber(values.annualRate) / 100;
      const months = Math.round(parseNumber(values.years) * 12);
      const monthlyRate = annualRate / 12;
      const futureValue =
        monthlyRate > 0
          ? monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate)
          : monthlyContribution * months;
      const totalContributions = monthlyContribution * months;
      return {
        futureValue: round(futureValue, 2),
        totalContributions: round(totalContributions, 2),
        interestEarned: round(futureValue - totalContributions, 2),
      };
    },
  },
  "savings-goal": {
    key: "savings-goal",
    title: "Calculator obiectiv economisire",
    slug: "calculator-obiectiv-economisire",
    categorySlug: "finante",
    summary:
      "Arata cati bani trebuie sa pui lunar pentru a atinge o tinta financiara intr-un anumit termen.",
    formulaName: "Contributie lunara pentru obiectiv",
    formulaExpression:
      "Contributie = tinta x rata lunara / ((1 + rata lunara)^luni - 1)",
    formulaDescription:
      "Calculatorul inverseaza formula valorii viitoare pentru a estima economisirea lunara necesara catre o tinta finala.",
    howToSteps: [
      "Introdu suma pe care vrei sa o strangi.",
      "Introdu dobanda anuala si perioada.",
      "Citeste contributia lunara necesara.",
    ],
    inputs: [
      {
        name: "targetAmount",
        label: "Obiectiv final",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 30000,
      },
      {
        name: "annualRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 5,
      },
      {
        name: "years",
        label: "Perioada",
        type: "number",
        unit: "ani",
        min: 0.1,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 4,
      },
    ],
    outputs: [
      { name: "monthlyContribution", label: "Economisire lunara necesara", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const targetAmount = parseNumber(values.targetAmount);
      const annualRate = parseNumber(values.annualRate) / 100;
      const months = Math.max(Math.round(parseNumber(values.years) * 12), 1);
      const monthlyRate = annualRate / 12;
      const monthlyContribution =
        monthlyRate > 0
          ? (targetAmount * monthlyRate) / ((1 + monthlyRate) ** months - 1)
          : targetAmount / months;
      return {
        monthlyContribution: round(monthlyContribution, 2),
      };
    },
  },
  "loan-payment": {
    key: "loan-payment",
    title: "Calculator rata credit",
    slug: "calculator-rata-credit",
    categorySlug: "finante",
    summary:
      "Estimeaza rata lunara, costul total si dobanda totala pentru un credit cu rambursare in rate egale.",
    formulaName: "Rata lunara anuitate",
    formulaExpression:
      "Rata = credit x rata lunara / (1 - (1 + rata lunara)^-luni)",
    formulaDescription:
      "Pentru creditele cu rate egale, rata lunara se calculeaza pornind de la suma imprumutata, dobanda anuala si numarul total de luni.",
    howToSteps: [
      "Introdu suma imprumutata.",
      "Introdu dobanda anuala si perioada creditului.",
      "Citeste rata lunara, costul total si dobanda platita.",
    ],
    inputs: [
      {
        name: "loanAmount",
        label: "Suma credit",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 250000,
      },
      {
        name: "annualRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 1000,
        step: 0.01,
        required: true,
        defaultValue: 8.5,
      },
      {
        name: "years",
        label: "Perioada",
        type: "number",
        unit: "ani",
        min: 0.1,
        max: 50,
        step: 0.1,
        required: true,
        defaultValue: 30,
      },
    ],
    outputs: [
      { name: "monthlyPayment", label: "Rata lunara", unit: "lei", decimals: 2 },
      { name: "totalCost", label: "Cost total", unit: "lei", decimals: 2 },
      { name: "totalInterest", label: "Dobanda totala", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const loanAmount = parseNumber(values.loanAmount);
      const annualRate = parseNumber(values.annualRate) / 100;
      const months = Math.max(Math.round(parseNumber(values.years) * 12), 1);
      const monthlyRate = annualRate / 12;
      const monthlyPayment =
        monthlyRate > 0
          ? (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
          : loanAmount / months;
      const totalCost = monthlyPayment * months;
      return {
        monthlyPayment: round(monthlyPayment, 2),
        totalCost: round(totalCost, 2),
        totalInterest: round(totalCost - loanAmount, 2),
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
  "salary-increase": {
    key: "salary-increase",
    title: "Calculator crestere salariala",
    slug: "calculator-crestere-salariala",
    categorySlug: "salarii-si-taxe",
    summary:
      "Compara salariul actual cu salariul tinta si vezi diferenta in lei si in procente.",
    formulaName: "Crestere salariala",
    formulaExpression:
      "Diferenta = salariu tinta - salariu actual; Crestere (%) = diferenta / salariu actual x 100",
    formulaDescription:
      "Calculatorul transforma diferenta dintre salariul actual si cel tinta intr-o crestere absoluta si procentuala.",
    howToSteps: [
      "Introdu salariul actual.",
      "Introdu salariul tinta sau oferta noua.",
      "Citeste cresterea in lei si in procente.",
    ],
    inputs: [
      {
        name: "currentSalary",
        label: "Salariu actual",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 5000,
      },
      {
        name: "targetSalary",
        label: "Salariu tinta",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 6200,
      },
    ],
    outputs: [
      { name: "increaseAmount", label: "Crestere in lei", unit: "lei", decimals: 2 },
      { name: "increasePercent", label: "Crestere procentuala", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const currentSalary = Math.max(parseNumber(values.currentSalary), 0.01);
      const targetSalary = parseNumber(values.targetSalary);
      const increaseAmount = targetSalary - currentSalary;
      return {
        increaseAmount: round(increaseAmount, 2),
        increasePercent: round((increaseAmount / currentSalary) * 100, 2),
      };
    },
  },
  "hourly-rate": {
    key: "hourly-rate",
    title: "Calculator tarif orar din salariu",
    slug: "calculator-tarif-orar-din-salariu",
    categorySlug: "salarii-si-taxe",
    summary:
      "Transforma salariul lunar intr-un tarif orar orientativ, pornind de la numarul de ore lucrate.",
    formulaName: "Tarif orar",
    formulaExpression: "Tarif orar = venit lunar / ore lucrate in luna",
    formulaDescription:
      "Tariful orar rezulta din impartirea venitului lunar la numarul total de ore lucrate in aceeasi perioada.",
    howToSteps: [
      "Introdu venitul lunar pe care vrei sa-l transformi in tarif orar.",
      "Introdu numarul de ore lucrate in luna.",
      "Citeste valoarea orientativa pe ora.",
    ],
    inputs: [
      {
        name: "monthlyIncome",
        label: "Venit lunar",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 6000,
      },
      {
        name: "hoursWorked",
        label: "Ore lucrate",
        type: "number",
        unit: "ore",
        min: 1,
        max: 400,
        step: 1,
        required: true,
        defaultValue: 168,
      },
    ],
    outputs: [
      { name: "hourlyRate", label: "Tarif orar", unit: "lei/ora", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyIncome = parseNumber(values.monthlyIncome);
      const hoursWorked = Math.max(parseNumber(values.hoursWorked), 1);
      return {
        hourlyRate: round(monthlyIncome / hoursWorked, 2),
      };
    },
  },
  "monthly-work-hours": {
    key: "monthly-work-hours",
    title: "Calculator ore lucrate pe luna",
    slug: "calculator-ore-lucrate-pe-luna",
    categorySlug: "salarii-si-taxe",
    summary:
      "Estimeaza numarul total de ore lucrate intr-o luna pe baza zilelor lucratoare si a programului zilnic.",
    formulaName: "Ore lucrate pe luna",
    formulaExpression: "Ore lunare = zile lucratoare x ore pe zi",
    formulaDescription:
      "Numarul total de ore lucrate intr-o luna se obtine inmultind zilele lucratoare cu durata programului zilnic.",
    howToSteps: [
      "Introdu numarul de zile lucratoare relevante pentru luna analizata.",
      "Introdu numarul de ore lucrate intr-o zi obisnuita.",
      "Citeste totalul de ore pentru luna respectiva.",
    ],
    inputs: [
      {
        name: "workDays",
        label: "Zile lucratoare",
        type: "number",
        unit: "zile",
        min: 1,
        max: 31,
        step: 1,
        required: true,
        defaultValue: 21,
      },
      {
        name: "hoursPerDay",
        label: "Ore pe zi",
        type: "number",
        unit: "ore",
        min: 1,
        max: 24,
        step: 0.5,
        required: true,
        defaultValue: 8,
      },
    ],
    outputs: [
      { name: "monthlyHours", label: "Ore lucrate", unit: "ore", decimals: 1 },
    ],
    compute: (values) => {
      const workDays = parseNumber(values.workDays);
      const hoursPerDay = parseNumber(values.hoursPerDay);
      return {
        monthlyHours: round(workDays * hoursPerDay, 1),
      };
    },
  },
  "annual-income": {
    key: "annual-income",
    title: "Calculator venit anual",
    slug: "calculator-venit-anual",
    categorySlug: "salarii-si-taxe",
    summary:
      "Transforma venitul lunar intr-o estimare anuala si permite adaugarea bonusurilor sau a lunilor suplimentare.",
    formulaName: "Venit anual",
    formulaExpression: "Venit anual = venit lunar x luni platite + bonusuri",
    formulaDescription:
      "Venitul anual rezulta din inmultirea venitului lunar cu numarul de luni platite, la care se pot adauga bonusuri sau venituri suplimentare.",
    howToSteps: [
      "Introdu venitul lunar mediu.",
      "Alege numarul de luni platite sau valoarea suplimentara pentru bonusuri.",
      "Citeste venitul anual estimat.",
    ],
    inputs: [
      {
        name: "monthlyIncome",
        label: "Venit lunar",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 6000,
      },
      {
        name: "paidMonths",
        label: "Luni platite",
        type: "number",
        unit: "luni",
        min: 1,
        max: 24,
        step: 1,
        required: true,
        defaultValue: 12,
      },
      {
        name: "bonuses",
        label: "Bonusuri anuale",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 0,
      },
    ],
    outputs: [
      { name: "annualIncome", label: "Venit anual", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyIncome = parseNumber(values.monthlyIncome);
      const paidMonths = parseNumber(values.paidMonths);
      const bonuses = parseNumber(values.bonuses);
      return {
        annualIncome: round(monthlyIncome * paidMonths + bonuses, 2),
      };
    },
  },
  "effective-tax-rate": {
    key: "effective-tax-rate",
    title: "Calculator taxare efectiva salariu",
    slug: "calculator-taxare-efectiva-salariu",
    categorySlug: "salarii-si-taxe",
    summary:
      "Porneste de la brut si net pentru a vedea diferenta absoluta si rata efectiva de taxare.",
    formulaName: "Taxare efectiva",
    formulaExpression:
      "Taxe totale = brut - net; Taxare efectiva (%) = taxe totale / brut x 100",
    formulaDescription:
      "Calculatorul compara venitul brut cu venitul net pentru a estima rapid cat reprezinta taxele si contributiile in termeni absoluti si procentuali.",
    howToSteps: [
      "Introdu venitul brut.",
      "Introdu venitul net corespunzator.",
      "Citeste suma taxelor si rata efectiva rezultata.",
    ],
    inputs: [
      {
        name: "grossIncome",
        label: "Venit brut",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 10000,
      },
      {
        name: "netIncome",
        label: "Venit net",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 5850,
      },
    ],
    outputs: [
      { name: "taxAmount", label: "Taxe si contributii", unit: "lei", decimals: 2 },
      { name: "effectiveTaxRate", label: "Rata efectiva", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const grossIncome = Math.max(parseNumber(values.grossIncome), 0.01);
      const netIncome = parseNumber(values.netIncome);
      const taxAmount = grossIncome - netIncome;
      return {
        taxAmount: round(taxAmount, 2),
        effectiveTaxRate: round((taxAmount / grossIncome) * 100, 2),
      };
    },
  },
  "credit-affordability": {
    key: "credit-affordability",
    title: "Calculator rata maxima suportabila",
    slug: "calculator-rata-maxima-suportabila",
    categorySlug: "credite-si-economii",
    summary:
      "Estimeaza rata lunara maxima si suma finantabila pornind de la venit, cheltuieli, dobanda si perioada.",
    formulaName: "Rata suportabila si suma finantabila",
    formulaExpression:
      "Rata maxima = venit net x grad de indatorare - alte rate; Suma finantabila = rata x [1 - (1 + i)^-n] / i",
    formulaDescription:
      "Calculatorul porneste de la un prag de indatorare ales de utilizator si transforma rata lunara maxima intr-o estimare a sumei care poate fi finantata.",
    howToSteps: [
      "Introdu venitul lunar net si ratele existente.",
      "Alege pragul de indatorare, dobanda si perioada creditului.",
      "Citeste rata maxima si suma finantabila estimata.",
    ],
    inputs: [
      {
        name: "monthlyIncome",
        label: "Venit lunar net",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 8500,
      },
      {
        name: "existingDebtPayments",
        label: "Rate existente",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 0,
      },
      {
        name: "debtRatio",
        label: "Grad de indatorare",
        type: "number",
        unit: "%",
        min: 1,
        max: 80,
        step: 1,
        required: true,
        defaultValue: 40,
      },
      {
        name: "annualInterestRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 7.5,
      },
      {
        name: "loanMonths",
        label: "Perioada",
        type: "number",
        unit: "luni",
        min: 1,
        max: 480,
        step: 1,
        required: true,
        defaultValue: 240,
      },
    ],
    outputs: [
      { name: "maxPayment", label: "Rata maxima", unit: "lei", decimals: 2 },
      { name: "maxLoanAmount", label: "Suma finantabila", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyIncome = parseNumber(values.monthlyIncome);
      const existingDebtPayments = parseNumber(values.existingDebtPayments);
      const debtRatio = parseNumber(values.debtRatio) / 100;
      const annualInterestRate = parseNumber(values.annualInterestRate);
      const loanMonths = Math.max(parseNumber(values.loanMonths), 1);
      const maxPayment = Math.max(monthlyIncome * debtRatio - existingDebtPayments, 0);
      const monthlyRate = annualInterestRate / 100 / 12;
      const maxLoanAmount =
        monthlyRate > 0
          ? maxPayment * (1 - (1 + monthlyRate) ** -loanMonths) / monthlyRate
          : maxPayment * loanMonths;

      return {
        maxPayment: round(maxPayment, 2),
        maxLoanAmount: round(maxLoanAmount, 2),
      };
    },
  },
  "debt-to-income": {
    key: "debt-to-income",
    title: "Calculator grad de indatorare",
    slug: "calculator-grad-de-indatorare",
    categorySlug: "credite-si-economii",
    summary:
      "Arata ce procent din venitul lunar este deja consumat de rate si plati recurente.",
    formulaName: "Debt-to-income",
    formulaExpression: "Grad de indatorare = plati lunare recurente / venit lunar x 100",
    formulaDescription:
      "Gradul de indatorare compara toate platile recurente de datorii cu venitul disponibil intr-o luna obisnuita.",
    howToSteps: [
      "Introdu venitul lunar relevant pentru comparatie.",
      "Introdu totalul ratelor sau platilor recurente.",
      "Citeste procentul de indatorare rezultat.",
    ],
    inputs: [
      {
        name: "monthlyIncome",
        label: "Venit lunar",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 8500,
      },
      {
        name: "monthlyDebtPayments",
        label: "Plati recurente",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 2200,
      },
    ],
    outputs: [
      { name: "debtToIncome", label: "Grad de indatorare", unit: "%", decimals: 2 },
      { name: "remainingIncome", label: "Venit ramas", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyIncome = Math.max(parseNumber(values.monthlyIncome), 0.01);
      const monthlyDebtPayments = parseNumber(values.monthlyDebtPayments);
      return {
        debtToIncome: round((monthlyDebtPayments / monthlyIncome) * 100, 2),
        remainingIncome: round(monthlyIncome - monthlyDebtPayments, 2),
      };
    },
  },
  "loan-total-cost": {
    key: "loan-total-cost",
    title: "Calculator cost total credit",
    slug: "calculator-cost-total-credit",
    categorySlug: "credite-si-economii",
    summary:
      "Estimeaza rata lunara, suma totala platita si dobanda totala pentru un credit in rate egale.",
    formulaName: "Cost total credit",
    formulaExpression:
      "Rata = credit x rata lunara / (1 - (1 + rata lunara)^-luni); Cost total = rata x luni",
    formulaDescription:
      "Calculatorul foloseste formula anuitatii pentru a transforma suma imprumutata, dobanda si perioada in cost lunar si cost total.",
    howToSteps: [
      "Introdu suma imprumutata.",
      "Introdu dobanda anuala si perioada in luni.",
      "Citeste rata lunara, costul total si dobanda totala.",
    ],
    inputs: [
      {
        name: "principal",
        label: "Suma imprumutata",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 150000,
      },
      {
        name: "annualInterestRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 7.5,
      },
      {
        name: "loanMonths",
        label: "Perioada",
        type: "number",
        unit: "luni",
        min: 1,
        max: 480,
        step: 1,
        required: true,
        defaultValue: 240,
      },
    ],
    outputs: [
      { name: "monthlyPayment", label: "Rata lunara", unit: "lei", decimals: 2 },
      { name: "totalCost", label: "Cost total", unit: "lei", decimals: 2 },
      { name: "totalInterest", label: "Dobanda totala", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const principal = Math.max(parseNumber(values.principal), 0.01);
      const annualInterestRate = parseNumber(values.annualInterestRate);
      const loanMonths = Math.max(parseNumber(values.loanMonths), 1);
      const monthlyRate = annualInterestRate / 100 / 12;
      const monthlyPayment =
        monthlyRate > 0
          ? principal * monthlyRate / (1 - (1 + monthlyRate) ** -loanMonths)
          : principal / loanMonths;
      const totalCost = monthlyPayment * loanMonths;
      const totalInterest = totalCost - principal;

      return {
        monthlyPayment: round(monthlyPayment, 2),
        totalCost: round(totalCost, 2),
        totalInterest: round(totalInterest, 2),
      };
    },
  },
  "refinance-savings": {
    key: "refinance-savings",
    title: "Calculator economie refinantare",
    slug: "calculator-economie-refinantare",
    categorySlug: "credite-si-economii",
    summary:
      "Compara rata veche cu rata noua si estimeaza economia lunara, economia totala si pragul de recuperare a costurilor.",
    formulaName: "Economii refinantare",
    formulaExpression:
      "Economie lunara = rata veche - rata noua; Economie neta = economie lunara x luni ramase - cost refinantare",
    formulaDescription:
      "Calculatorul compara direct cele doua scenarii de plata si arata in cat timp se recupereaza costul refinantarii.",
    howToSteps: [
      "Introdu rata veche, rata noua si lunile ramase.",
      "Adauga costul refinantarii.",
      "Citeste economia lunara, economia neta si pragul de recuperare.",
    ],
    inputs: [
      {
        name: "oldMonthlyPayment",
        label: "Rata veche",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 2650,
      },
      {
        name: "newMonthlyPayment",
        label: "Rata noua",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 2280,
      },
      {
        name: "remainingMonths",
        label: "Luni ramase",
        type: "number",
        unit: "luni",
        min: 1,
        max: 480,
        step: 1,
        required: true,
        defaultValue: 180,
      },
      {
        name: "refinanceCost",
        label: "Cost refinantare",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 3500,
      },
    ],
    outputs: [
      { name: "monthlySavings", label: "Economie lunara", unit: "lei", decimals: 2 },
      { name: "netSavings", label: "Economie neta", unit: "lei", decimals: 2 },
      { name: "breakEvenMonths", label: "Recuperare cost", unit: "luni", decimals: 1 },
    ],
    compute: (values) => {
      const oldMonthlyPayment = parseNumber(values.oldMonthlyPayment);
      const newMonthlyPayment = parseNumber(values.newMonthlyPayment);
      const remainingMonths = Math.max(parseNumber(values.remainingMonths), 1);
      const refinanceCost = parseNumber(values.refinanceCost);
      const monthlySavings = oldMonthlyPayment - newMonthlyPayment;
      const netSavings = monthlySavings * remainingMonths - refinanceCost;
      const breakEvenMonths =
        monthlySavings > 0 ? refinanceCost / monthlySavings : 0;

      return {
        monthlySavings: round(monthlySavings, 2),
        netSavings: round(netSavings, 2),
        breakEvenMonths: round(breakEvenMonths, 1),
      };
    },
  },
  "emergency-fund": {
    key: "emergency-fund",
    title: "Calculator fond de urgenta",
    slug: "calculator-fond-de-urgenta",
    categorySlug: "credite-si-economii",
    summary:
      "Estimeaza marimea fondului de urgenta pornind de la cheltuielile lunare si numarul de luni de acoperire dorit.",
    formulaName: "Fond de urgenta",
    formulaExpression: "Fond de urgenta = cheltuieli lunare x luni de acoperire",
    formulaDescription:
      "Fondul de urgenta este estimat simplu, prin inmultirea cheltuielilor lunare esentiale cu perioada de acoperire dorita.",
    howToSteps: [
      "Introdu cheltuielile lunare esentiale.",
      "Alege cate luni vrei sa acoperi.",
      "Citeste suma-tinta pentru fondul de urgenta.",
    ],
    inputs: [
      {
        name: "monthlyExpenses",
        label: "Cheltuieli lunare",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 4200,
      },
      {
        name: "coverageMonths",
        label: "Luni de acoperire",
        type: "number",
        unit: "luni",
        min: 1,
        max: 24,
        step: 1,
        required: true,
        defaultValue: 6,
      },
    ],
    outputs: [
      { name: "emergencyFundTarget", label: "Fond recomandat", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyExpenses = parseNumber(values.monthlyExpenses);
      const coverageMonths = parseNumber(values.coverageMonths);
      return {
        emergencyFundTarget: round(monthlyExpenses * coverageMonths, 2),
      };
    },
  },
  "savings-interest": {
    key: "savings-interest",
    title: "Calculator dobanda economii",
    slug: "calculator-dobanda-economii",
    categorySlug: "credite-si-economii",
    summary:
      "Estimeaza valoarea finala a economiilor pornind de la suma initiala, contributie lunara, dobanda si perioada.",
    formulaName: "Valoare viitoare economii",
    formulaExpression:
      "FV = suma initiala x (1 + i)^n + contributie lunara x [((1 + i)^n - 1) / i]",
    formulaDescription:
      "Calculatorul combina capitalul initial cu depunerile lunare si capitalizarea dobanzii pentru a estima evolutia economiilor.",
    howToSteps: [
      "Introdu suma initiala si contributia lunara.",
      "Adauga dobanda anuala si perioada.",
      "Citeste valoarea finala si castigul total din dobanda.",
    ],
    inputs: [
      {
        name: "initialAmount",
        label: "Suma initiala",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 10000,
      },
      {
        name: "monthlyContribution",
        label: "Contributie lunara",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 750,
      },
      {
        name: "annualInterestRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 4.5,
      },
      {
        name: "months",
        label: "Perioada",
        type: "number",
        unit: "luni",
        min: 1,
        max: 600,
        step: 1,
        required: true,
        defaultValue: 60,
      },
    ],
    outputs: [
      { name: "futureValue", label: "Valoare finala", unit: "lei", decimals: 2 },
      { name: "interestEarned", label: "Dobanda acumulata", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const initialAmount = parseNumber(values.initialAmount);
      const monthlyContribution = parseNumber(values.monthlyContribution);
      const annualInterestRate = parseNumber(values.annualInterestRate);
      const months = Math.max(parseNumber(values.months), 1);
      const monthlyRate = annualInterestRate / 100 / 12;
      const futureValue =
        monthlyRate > 0
          ? initialAmount * (1 + monthlyRate) ** months +
            monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate)
          : initialAmount + monthlyContribution * months;
      const investedAmount = initialAmount + monthlyContribution * months;

      return {
        futureValue: round(futureValue, 2),
        interestEarned: round(futureValue - investedAmount, 2),
      };
    },
  },
  "retirement-savings": {
    key: "retirement-savings",
    title: "Calculator economii pensie",
    slug: "calculator-economii-pensie",
    categorySlug: "credite-si-economii",
    summary:
      "Estimeaza cat se poate acumula pentru pensie dintr-o contributie lunara, un randament anual si un orizont lung de timp.",
    formulaName: "Economii pentru pensie",
    formulaExpression:
      "FV = contributie lunara x [((1 + i)^n - 1) / i], cu capitalizare lunara",
    formulaDescription:
      "Calculatorul proiecteaza acumularea unei contributii lunare recurente pe termen lung, folosind o rata anuala de crestere aleasa de utilizator.",
    howToSteps: [
      "Introdu contributia lunara pe care o poti sustine.",
      "Alege numarul de ani si randamentul anual orientativ.",
      "Citeste suma finala estimata la finalul perioadei.",
    ],
    inputs: [
      {
        name: "monthlyContribution",
        label: "Contributie lunara",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 1000,
      },
      {
        name: "years",
        label: "Ani pana la obiectiv",
        type: "number",
        unit: "ani",
        min: 1,
        max: 60,
        step: 1,
        required: true,
        defaultValue: 25,
      },
      {
        name: "annualReturn",
        label: "Randament anual",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 6,
      },
    ],
    outputs: [
      { name: "retirementPot", label: "Capital estimat", unit: "lei", decimals: 2 },
      { name: "investedAmount", label: "Total depus", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyContribution = parseNumber(values.monthlyContribution);
      const years = Math.max(parseNumber(values.years), 1);
      const annualReturn = parseNumber(values.annualReturn);
      const months = years * 12;
      const monthlyRate = annualReturn / 100 / 12;
      const retirementPot =
        monthlyRate > 0
          ? monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate)
          : monthlyContribution * months;
      return {
        retirementPot: round(retirementPot, 2),
        investedAmount: round(monthlyContribution * months, 2),
      };
    },
  },
  "goal-timeline": {
    key: "goal-timeline",
    title: "Calculator termen obiectiv economisire",
    slug: "calculator-termen-obiectiv-economisire",
    categorySlug: "credite-si-economii",
    summary:
      "Estimeaza in cate luni poti ajunge la o tinta pornind de la suma initiala, contributie lunara si dobanda.",
    formulaName: "Termen obiectiv economisire",
    formulaExpression:
      "Termenul se obtine iterativ pana cand suma acumulata depaseste tinta dorita.",
    formulaDescription:
      "Calculatorul simuleaza evolutia lunara a economiilor pana cand valoarea acumulata atinge sau depaseste obiectivul final.",
    howToSteps: [
      "Introdu tinta finala, suma initiala si contributia lunara.",
      "Adauga dobanda anuala orientativa.",
      "Citeste numarul de luni si anii necesari pentru a atinge obiectivul.",
    ],
    inputs: [
      {
        name: "targetAmount",
        label: "Obiectiv final",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 100000,
      },
      {
        name: "initialAmount",
        label: "Suma initiala",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 10000,
      },
      {
        name: "monthlyContribution",
        label: "Contributie lunara",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 1200,
      },
      {
        name: "annualInterestRate",
        label: "Dobanda anuala",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.01,
        required: true,
        defaultValue: 4,
      },
    ],
    outputs: [
      { name: "monthsToGoal", label: "Luni pana la obiectiv", unit: "luni", decimals: 0 },
      { name: "yearsToGoal", label: "Ani pana la obiectiv", unit: "ani", decimals: 2 },
    ],
    compute: (values) => {
      const targetAmount = Math.max(parseNumber(values.targetAmount), 0.01);
      const initialAmount = parseNumber(values.initialAmount);
      const monthlyContribution = parseNumber(values.monthlyContribution);
      const annualInterestRate = parseNumber(values.annualInterestRate);
      const monthlyRate = annualInterestRate / 100 / 12;
      let balance = initialAmount;
      let months = 0;

      while (balance < targetAmount && months < 1200) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
        months += 1;
      }

      return {
        monthsToGoal: months,
        yearsToGoal: round(months / 12, 2),
      };
    },
  },
  "lease-vs-loan": {
    key: "lease-vs-loan",
    title: "Calculator leasing vs credit",
    slug: "calculator-leasing-vs-credit",
    categorySlug: "credite-si-economii",
    summary:
      "Compara costul total al doua scenarii de finantare pornind de la avans, rate lunare si costuri finale.",
    formulaName: "Comparatie leasing vs credit",
    formulaExpression:
      "Cost total = avans + rata lunara x luni + cost final; Diferenta = scenariul A - scenariul B",
    formulaDescription:
      "Calculatorul compara doua scenarii de finantare la nivel de cost total, folosind aceeasi perioada pentru o evaluare rapida.",
    howToSteps: [
      "Introdu avansul, rata si costul final pentru leasing.",
      "Introdu aceleasi valori pentru credit.",
      "Citeste costul total si diferenta dintre scenarii.",
    ],
    inputs: [
      {
        name: "leaseDownPayment",
        label: "Avans leasing",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 30000,
      },
      {
        name: "leaseMonthlyPayment",
        label: "Rata leasing",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 2100,
      },
      {
        name: "leaseResidualValue",
        label: "Valoare reziduala",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 15000,
      },
      {
        name: "loanDownPayment",
        label: "Avans credit",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 30000,
      },
      {
        name: "loanMonthlyPayment",
        label: "Rata credit",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 2350,
      },
      {
        name: "months",
        label: "Perioada comparata",
        type: "number",
        unit: "luni",
        min: 1,
        max: 480,
        step: 1,
        required: true,
        defaultValue: 60,
      },
    ],
    outputs: [
      { name: "leaseTotalCost", label: "Cost total leasing", unit: "lei", decimals: 2 },
      { name: "loanTotalCost", label: "Cost total credit", unit: "lei", decimals: 2 },
      { name: "difference", label: "Diferenta", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const leaseDownPayment = parseNumber(values.leaseDownPayment);
      const leaseMonthlyPayment = parseNumber(values.leaseMonthlyPayment);
      const leaseResidualValue = parseNumber(values.leaseResidualValue);
      const loanDownPayment = parseNumber(values.loanDownPayment);
      const loanMonthlyPayment = parseNumber(values.loanMonthlyPayment);
      const months = Math.max(parseNumber(values.months), 1);
      const leaseTotalCost =
        leaseDownPayment + leaseMonthlyPayment * months + leaseResidualValue;
      const loanTotalCost = loanDownPayment + loanMonthlyPayment * months;

      return {
        leaseTotalCost: round(leaseTotalCost, 2),
        loanTotalCost: round(loanTotalCost, 2),
        difference: round(leaseTotalCost - loanTotalCost, 2),
      };
    },
  },
  "down-payment": {
    key: "down-payment",
    title: "Calculator avans",
    slug: "calculator-avans",
    categorySlug: "credite-si-economii",
    summary:
      "Calculeaza avansul necesar si suma finantata pornind de la pretul total si procentul de avans.",
    formulaName: "Avans si suma finantata",
    formulaExpression: "Avans = pret total x procent avans; Suma finantata = pret total - avans",
    formulaDescription:
      "Calculatorul transforma un procent de avans intr-o suma concreta si arata ce parte ramane de finantat.",
    howToSteps: [
      "Introdu pretul total al achizitiei.",
      "Introdu procentul de avans dorit sau cerut.",
      "Citeste suma avansului si suma ramasa pentru finantare.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Pret total",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 450000,
      },
      {
        name: "downPaymentPercent",
        label: "Avans",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 15,
      },
    ],
    outputs: [
      { name: "downPaymentAmount", label: "Avans necesar", unit: "lei", decimals: 2 },
      { name: "financedAmount", label: "Suma finantata", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const purchasePrice = Math.max(parseNumber(values.purchasePrice), 0.01);
      const downPaymentPercent = parseNumber(values.downPaymentPercent);
      const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
      return {
        downPaymentAmount: round(downPaymentAmount, 2),
        financedAmount: round(purchasePrice - downPaymentAmount, 2),
      };
    },
  },
  roas: {
    key: "roas",
    title: "Calculator ROAS",
    slug: "calculator-roas",
    categorySlug: "business",
    summary:
      "Calculeaza ROAS-ul pornind de la bugetul de advertising si venitul atribuit campaniei.",
    formulaName: "ROAS",
    formulaExpression: "ROAS = venit atribuit / buget ads",
    formulaDescription:
      "ROAS-ul arata de cate ori recuperezi bugetul de advertising prin venitul generat de campanie.",
    howToSteps: [
      "Introdu bugetul de advertising consumat.",
      "Introdu venitul atribuit campaniei.",
      "Citeste multiplicatorul ROAS si venitul generat pentru fiecare leu investit.",
    ],
    inputs: [
      {
        name: "adSpend",
        label: "Buget ads",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 12000,
      },
      {
        name: "attributedRevenue",
        label: "Venit atribuit",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 54000,
      },
    ],
    outputs: [
      { name: "roas", label: "ROAS", decimals: 2 },
      {
        name: "revenuePerLeu",
        label: "Venit per 1 leu ads",
        unit: "lei",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const adSpend = Math.max(parseNumber(values.adSpend), 0.01);
      const attributedRevenue = parseNumber(values.attributedRevenue);
      const roas = attributedRevenue / adSpend;
      return {
        roas: round(roas, 2),
        revenuePerLeu: round(roas, 2),
      };
    },
  },
  "break-even-roas": {
    key: "break-even-roas",
    title: "Calculator break-even ROAS",
    slug: "calculator-break-even-roas",
    categorySlug: "business",
    summary:
      "Arata ROAS-ul minim necesar pentru a acoperi costul variabil si pentru a nu ramane pe pierdere.",
    formulaName: "Break-even ROAS",
    formulaExpression: "Break-even ROAS = 100 / marja bruta (%)",
    formulaDescription:
      "ROAS-ul de break-even porneste din marja bruta disponibila pentru marketing si arata pragul minim la care campania nu mai pierde bani.",
    howToSteps: [
      "Introdu marja bruta disponibila dupa costurile directe.",
      "Citeste ROAS-ul minim necesar pentru break-even.",
      "Compara rezultatul cu ROAS-ul real al campaniilor tale.",
    ],
    inputs: [
      {
        name: "grossMarginPercent",
        label: "Marja bruta disponibila",
        type: "number",
        unit: "%",
        min: 0.1,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 35,
      },
    ],
    outputs: [
      { name: "breakEvenRoas", label: "Break-even ROAS", decimals: 2 },
      { name: "adBudgetShare", label: "Pondere maxima ads", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const grossMarginPercent = Math.max(parseNumber(values.grossMarginPercent), 0.1);
      return {
        breakEvenRoas: round(100 / grossMarginPercent, 2),
        adBudgetShare: round(grossMarginPercent, 2),
      };
    },
  },
  aov: {
    key: "aov",
    title: "Calculator AOV",
    slug: "calculator-aov",
    categorySlug: "business",
    summary:
      "Calculeaza valoarea medie a comenzii pornind de la venit si numarul total de comenzi.",
    formulaName: "Average Order Value",
    formulaExpression: "AOV = venit total / numar comenzi",
    formulaDescription:
      "AOV-ul arata cati bani aduce in medie o comanda si ajuta la interpretarea mai buna a funnel-ului comercial.",
    howToSteps: [
      "Introdu venitul total din perioada analizata.",
      "Introdu numarul total de comenzi.",
      "Citeste valoarea medie pe comanda.",
    ],
    inputs: [
      {
        name: "revenue",
        label: "Venit total",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 180000,
      },
      {
        name: "orders",
        label: "Numar comenzi",
        type: "number",
        unit: "comenzi",
        min: 1,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 1200,
      },
    ],
    outputs: [{ name: "aov", label: "AOV", unit: "lei", decimals: 2 }],
    compute: (values) => {
      const revenue = parseNumber(values.revenue);
      const orders = Math.max(parseNumber(values.orders), 1);
      return {
        aov: round(revenue / orders, 2),
      };
    },
  },
  "conversion-rate": {
    key: "conversion-rate",
    title: "Calculator rata de conversie",
    slug: "calculator-rata-de-conversie",
    categorySlug: "business",
    summary:
      "Calculeaza rata de conversie pornind de la vizitatori si conversii.",
    formulaName: "Rata de conversie",
    formulaExpression: "Conversion rate (%) = conversii / vizitatori x 100",
    formulaDescription:
      "Rata de conversie arata ce procent din trafic face pasul dorit: comanda, lead sau alta actiune.",
    howToSteps: [
      "Introdu numarul total de vizitatori sau sesiuni.",
      "Introdu numarul de conversii.",
      "Citeste procentul de conversie.",
    ],
    inputs: [
      {
        name: "visitors",
        label: "Vizitatori",
        type: "number",
        unit: "vizitatori",
        min: 1,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 25000,
      },
      {
        name: "conversions",
        label: "Conversii",
        type: "number",
        unit: "conversii",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 650,
      },
    ],
    outputs: [
      { name: "conversionRate", label: "Rata de conversie", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const visitors = Math.max(parseNumber(values.visitors), 1);
      const conversions = parseNumber(values.conversions);
      return {
        conversionRate: round((conversions / visitors) * 100, 2),
      };
    },
  },
  cpl: {
    key: "cpl",
    title: "Calculator CPL",
    slug: "calculator-cpl",
    categorySlug: "business",
    summary:
      "Calculeaza costul per lead pornind de la bugetul de marketing si numarul de lead-uri generate.",
    formulaName: "Cost per lead",
    formulaExpression: "CPL = cost marketing / lead-uri",
    formulaDescription:
      "CPL-ul arata cat platesti in medie pentru un lead si este util cand compari canale sau campanii.",
    howToSteps: [
      "Introdu costul total al campaniei.",
      "Introdu lead-urile generate.",
      "Citeste costul per lead.",
    ],
    inputs: [
      {
        name: "marketingCost",
        label: "Cost marketing",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 8500,
      },
      {
        name: "leads",
        label: "Lead-uri",
        type: "number",
        unit: "lead-uri",
        min: 1,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 210,
      },
    ],
    outputs: [{ name: "cpl", label: "CPL", unit: "lei", decimals: 2 }],
    compute: (values) => {
      const marketingCost = parseNumber(values.marketingCost);
      const leads = Math.max(parseNumber(values.leads), 1);
      return {
        cpl: round(marketingCost / leads, 2),
      };
    },
  },
  cac: {
    key: "cac",
    title: "Calculator CAC",
    slug: "calculator-cac",
    categorySlug: "business",
    summary:
      "Calculeaza costul de achizitie al unui client pornind de la costurile comerciale si numarul de clienti noi.",
    formulaName: "Customer acquisition cost",
    formulaExpression: "CAC = cost total achizitie / clienti noi",
    formulaDescription:
      "CAC-ul arata cat te costa in medie sa transformi prospectii in clienti noi intr-o perioada.",
    howToSteps: [
      "Introdu costurile de marketing si vanzari atribuite perioadei.",
      "Introdu numarul de clienti noi.",
      "Citeste costul mediu de achizitie per client.",
    ],
    inputs: [
      {
        name: "acquisitionCost",
        label: "Cost total achizitie",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 42000,
      },
      {
        name: "newCustomers",
        label: "Clienti noi",
        type: "number",
        unit: "clienti",
        min: 1,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 140,
      },
    ],
    outputs: [{ name: "cac", label: "CAC", unit: "lei", decimals: 2 }],
    compute: (values) => {
      const acquisitionCost = parseNumber(values.acquisitionCost);
      const newCustomers = Math.max(parseNumber(values.newCustomers), 1);
      return {
        cac: round(acquisitionCost / newCustomers, 2),
      };
    },
  },
  "target-revenue": {
    key: "target-revenue",
    title: "Calculator venit tinta",
    slug: "calculator-venit-tinta",
    categorySlug: "business",
    summary:
      "Estimeaza venitul necesar pentru a acoperi costurile fixe si profitul tinta la o anumita marja.",
    formulaName: "Venit tinta",
    formulaExpression: "Venit tinta = (costuri fixe + profit tinta) / marja bruta",
    formulaDescription:
      "Calculatorul porneste din marja disponibila si arata ce venit trebuie atins pentru a sustine costurile si obiectivul de profit.",
    howToSteps: [
      "Introdu costurile fixe lunare sau ale perioadei.",
      "Introdu profitul tinta dorit.",
      "Introdu marja bruta disponibila.",
    ],
    inputs: [
      {
        name: "fixedCosts",
        label: "Costuri fixe",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 60000,
      },
      {
        name: "targetProfit",
        label: "Profit tinta",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 30000,
      },
      {
        name: "grossMarginPercent",
        label: "Marja bruta",
        type: "number",
        unit: "%",
        min: 0.1,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 40,
      },
    ],
    outputs: [{ name: "targetRevenue", label: "Venit tinta", unit: "lei", decimals: 2 }],
    compute: (values) => {
      const fixedCosts = parseNumber(values.fixedCosts);
      const targetProfit = parseNumber(values.targetProfit);
      const grossMarginPercent = Math.max(parseNumber(values.grossMarginPercent), 0.1);
      return {
        targetRevenue: round((fixedCosts + targetProfit) / (grossMarginPercent / 100), 2),
      };
    },
  },
  "gross-profit": {
    key: "gross-profit",
    title: "Calculator profit brut",
    slug: "calculator-profit-brut",
    categorySlug: "business",
    summary:
      "Calculeaza profitul brut si marja bruta pornind de la venit si costuri directe.",
    formulaName: "Profit brut",
    formulaExpression: "Profit brut = venit - costuri directe",
    formulaDescription:
      "Profitul brut arata ce ramane dupa ce scazi costurile direct legate de livrarea produsului sau serviciului.",
    howToSteps: [
      "Introdu venitul din perioada analizata.",
      "Introdu costurile directe aferente.",
      "Citeste profitul brut si marja bruta.",
    ],
    inputs: [
      {
        name: "revenue",
        label: "Venit",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 150000,
      },
      {
        name: "directCosts",
        label: "Costuri directe",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 90000,
      },
    ],
    outputs: [
      { name: "grossProfit", label: "Profit brut", unit: "lei", decimals: 2 },
      { name: "grossMargin", label: "Marja bruta", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const revenue = Math.max(parseNumber(values.revenue), 0.01);
      const directCosts = parseNumber(values.directCosts);
      const grossProfit = revenue - directCosts;
      return {
        grossProfit: round(grossProfit, 2),
        grossMargin: round((grossProfit / revenue) * 100, 2),
      };
    },
  },
  "net-profit": {
    key: "net-profit",
    title: "Calculator profit net",
    slug: "calculator-profit-net",
    categorySlug: "business",
    summary:
      "Calculeaza profitul net orientativ pornind de la venit si costul total al perioadei.",
    formulaName: "Profit net",
    formulaExpression: "Profit net = venit total - cost total",
    formulaDescription:
      "Calculatorul arata ce ramane dupa ce scazi toate costurile incluse in scenariul analizat.",
    howToSteps: [
      "Introdu venitul total.",
      "Introdu costurile totale ale perioadei.",
      "Citeste profitul net si marja neta orientativa.",
    ],
    inputs: [
      {
        name: "revenue",
        label: "Venit",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 150000,
      },
      {
        name: "totalCosts",
        label: "Cost total",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 118000,
      },
    ],
    outputs: [
      { name: "netProfit", label: "Profit net", unit: "lei", decimals: 2 },
      { name: "netMargin", label: "Marja neta", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const revenue = Math.max(parseNumber(values.revenue), 0.01);
      const totalCosts = parseNumber(values.totalCosts);
      const netProfit = revenue - totalCosts;
      return {
        netProfit: round(netProfit, 2),
        netMargin: round((netProfit / revenue) * 100, 2),
      };
    },
  },
  "inventory-turnover": {
    key: "inventory-turnover",
    title: "Calculator rotatie stoc",
    slug: "calculator-rotatie-stoc",
    categorySlug: "business",
    summary:
      "Calculeaza de cate ori se roteste stocul intr-o perioada pornind de la costul marfii vandute si stocul mediu.",
    formulaName: "Rotatie stoc",
    formulaExpression: "Rotatie stoc = cost marfa vanduta / stoc mediu",
    formulaDescription:
      "Rotatia stocului arata cat de repede se transforma stocul in vanzari pe durata unei perioade analizate.",
    howToSteps: [
      "Introdu costul marfii vandute in perioada analizata.",
      "Introdu stocul mediu.",
      "Citeste numarul de rotatii si zilele medii pe stoc.",
    ],
    inputs: [
      {
        name: "cogs",
        label: "Cost marfa vanduta",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 420000,
      },
      {
        name: "averageInventory",
        label: "Stoc mediu",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 70000,
      },
      {
        name: "daysInPeriod",
        label: "Zile in perioada",
        type: "number",
        unit: "zile",
        min: 1,
        max: 366,
        step: 1,
        required: true,
        defaultValue: 30,
      },
    ],
    outputs: [
      { name: "inventoryTurnover", label: "Rotatie stoc", decimals: 2 },
      { name: "daysOfInventory", label: "Zile medii pe stoc", unit: "zile", decimals: 2 },
    ],
    compute: (values) => {
      const cogs = parseNumber(values.cogs);
      const averageInventory = Math.max(parseNumber(values.averageInventory), 0.01);
      const daysInPeriod = Math.max(parseNumber(values.daysInPeriod), 1);
      const inventoryTurnover = cogs / averageInventory;
      return {
        inventoryTurnover: round(inventoryTurnover, 2),
        daysOfInventory: round(daysInPeriod / inventoryTurnover, 2),
      };
    },
  },
  "appliance-electricity-cost": {
    key: "appliance-electricity-cost",
    title: "Calculator consum aparat electric",
    slug: "calculator-consum-aparat-electric",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza consumul lunar si costul anual pentru un aparat electric pornind de la putere si timp de utilizare.",
    formulaName: "Consum aparat electric",
    formulaExpression: "kWh = (W / 1000) x ore x zile; cost = kWh x pret/kWh",
    formulaDescription:
      "Calculatorul transforma puterea si timpul de utilizare intr-un consum estimat si il convertește in cost.",
    howToSteps: [
      "Introdu puterea aparatului in wati.",
      "Introdu numarul de ore folosite pe zi si zilele din luna.",
      "Citeste consumul lunar si costul estimat.",
    ],
    inputs: [
      { name: "powerWatts", label: "Putere aparat", type: "number", unit: "W", min: 1, max: 20000, step: 1, required: true, defaultValue: 1800 },
      { name: "hoursPerDay", label: "Ore pe zi", type: "number", unit: "ore", min: 0.1, max: 24, step: 0.1, required: true, defaultValue: 2 },
      { name: "daysPerMonth", label: "Zile pe luna", type: "number", unit: "zile", min: 1, max: 31, step: 1, required: true, defaultValue: 30 },
      { name: "pricePerKwh", label: "Pret energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
    ],
    outputs: [
      { name: "monthlyKwh", label: "Consum lunar", unit: "kWh", decimals: 2 },
      { name: "monthlyCost", label: "Cost lunar", unit: "lei", decimals: 2 },
      { name: "annualCost", label: "Cost anual", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const powerWatts = parseNumber(values.powerWatts);
      const hoursPerDay = parseNumber(values.hoursPerDay);
      const daysPerMonth = parseNumber(values.daysPerMonth);
      const pricePerKwh = parseNumber(values.pricePerKwh);
      const monthlyKwh = (powerWatts / 1000) * hoursPerDay * daysPerMonth;
      const monthlyCost = monthlyKwh * pricePerKwh;
      return {
        monthlyKwh: round(monthlyKwh, 2),
        monthlyCost: round(monthlyCost, 2),
        annualCost: round(monthlyCost * 12, 2),
      };
    },
  },
  "monthly-electricity-bill": {
    key: "monthly-electricity-bill",
    title: "Calculator factura curent",
    slug: "calculator-factura-curent",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza factura lunara si costul anual pornind de la consumul total si pretul pe kWh.",
    formulaName: "Factura de curent",
    formulaExpression: "Factura = consum lunar x pret/kWh + costuri fixe",
    formulaDescription:
      "Calculatorul foloseste consumul lunar total, pretul energiei si un eventual cost fix pentru a estima factura.",
    howToSteps: [
      "Introdu consumul lunar total in kWh.",
      "Introdu pretul pe kWh si costurile fixe lunare, daca vrei.",
      "Citeste factura estimata si costul anual.",
    ],
    inputs: [
      { name: "monthlyConsumptionKwh", label: "Consum lunar", type: "number", unit: "kWh", min: 0.1, max: 100000, step: 0.1, required: true, defaultValue: 280 },
      { name: "pricePerKwh", label: "Pret energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
      { name: "fixedMonthlyFees", label: "Costuri fixe", type: "number", unit: "lei", min: 0, max: 10000, step: 0.01, required: true, defaultValue: 12 },
    ],
    outputs: [
      { name: "monthlyBill", label: "Factura lunara", unit: "lei", decimals: 2 },
      { name: "annualBill", label: "Cost anual", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyConsumptionKwh = parseNumber(values.monthlyConsumptionKwh);
      const pricePerKwh = parseNumber(values.pricePerKwh);
      const fixedMonthlyFees = parseNumber(values.fixedMonthlyFees);
      const monthlyBill = monthlyConsumptionKwh * pricePerKwh + fixedMonthlyFees;
      return {
        monthlyBill: round(monthlyBill, 2),
        annualBill: round(monthlyBill * 12, 2),
      };
    },
  },
  "solar-system-size": {
    key: "solar-system-size",
    title: "Calculator necesar sistem fotovoltaic",
    slug: "calculator-necesar-sistem-fotovoltaic",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza puterea sistemului fotovoltaic necesar pornind de la consumul anual si procentul de acoperire dorit.",
    formulaName: "Dimensionare sistem FV",
    formulaExpression: "kWp necesari = (consum anual x acoperire) / productie specifica",
    formulaDescription:
      "Calculatorul raporteaza consumul anual la productia specifica estimata pentru a aproxima puterea sistemului.",
    howToSteps: [
      "Introdu consumul anual total.",
      "Alege procentul de acoperire dorit.",
      "Introdu productia specifica estimata in kWh/kWp/an.",
    ],
    inputs: [
      { name: "annualConsumptionKwh", label: "Consum anual", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 4200 },
      { name: "coveragePercent", label: "Acoperire dorita", type: "number", unit: "%", min: 1, max: 100, step: 1, required: true, defaultValue: 90 },
      { name: "specificYield", label: "Productie specifica", type: "number", unit: "kWh/kWp/an", min: 100, max: 3000, step: 1, required: true, defaultValue: 1350 },
    ],
    outputs: [
      { name: "requiredSystemKwp", label: "Sistem necesar", unit: "kWp", decimals: 2 },
    ],
    compute: (values) => {
      const annualConsumptionKwh = parseNumber(values.annualConsumptionKwh);
      const coveragePercent = parseNumber(values.coveragePercent);
      const specificYield = Math.max(parseNumber(values.specificYield), 1);
      return {
        requiredSystemKwp: round((annualConsumptionKwh * (coveragePercent / 100)) / specificYield, 2),
      };
    },
  },
  "solar-production": {
    key: "solar-production",
    title: "Calculator productie fotovoltaica",
    slug: "calculator-productie-fotovoltaica",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza productia anuala si lunara medie a unui sistem fotovoltaic pornind de la puterea instalata si randamentul local.",
    formulaName: "Productie fotovoltaica",
    formulaExpression: "Productie anuala = kWp instalati x productie specifica",
    formulaDescription:
      "Calculatorul foloseste puterea instalata si productia specifica anuala pentru a aproxima productia sistemului.",
    howToSteps: [
      "Introdu puterea instalata in kWp.",
      "Introdu productia specifica estimata.",
      "Citeste productia anuala si media lunara.",
    ],
    inputs: [
      { name: "systemSizeKwp", label: "Putere instalata", type: "number", unit: "kWp", min: 0.1, max: 1000, step: 0.1, required: true, defaultValue: 5.5 },
      { name: "specificYield", label: "Productie specifica", type: "number", unit: "kWh/kWp/an", min: 100, max: 3000, step: 1, required: true, defaultValue: 1350 },
      { name: "performanceFactor", label: "Factor performanta", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 92 },
    ],
    outputs: [
      { name: "annualProduction", label: "Productie anuala", unit: "kWh/an", decimals: 0 },
      { name: "monthlyAverageProduction", label: "Medie lunara", unit: "kWh/luna", decimals: 0 },
    ],
    compute: (values) => {
      const systemSizeKwp = parseNumber(values.systemSizeKwp);
      const specificYield = parseNumber(values.specificYield);
      const performanceFactor = parseNumber(values.performanceFactor) / 100;
      const annualProduction = systemSizeKwp * specificYield * performanceFactor;
      return {
        annualProduction: round(annualProduction, 0),
        monthlyAverageProduction: round(annualProduction / 12, 0),
      };
    },
  },
  "solar-panel-count": {
    key: "solar-panel-count",
    title: "Calculator numar panouri fotovoltaice",
    slug: "calculator-numar-panouri-fotovoltaice",
    categorySlug: "energie-pentru-casa",
    summary:
      "Arata cate panouri si ce suprafata aproximativa iti trebuie pentru puterea dorita.",
    formulaName: "Numar panouri",
    formulaExpression: "Numar panouri = putere dorita / putere panou",
    formulaDescription:
      "Calculatorul transforma puterea tinta a sistemului in numar de panouri si suprafata ocupata estimata.",
    howToSteps: [
      "Introdu puterea sistemului dorit in kWp.",
      "Introdu puterea unui panou si suprafata aproximativa per panou.",
      "Citeste numarul de panouri si suprafata ocupata.",
    ],
    inputs: [
      { name: "targetSystemKwp", label: "Sistem dorit", type: "number", unit: "kWp", min: 0.1, max: 1000, step: 0.1, required: true, defaultValue: 6 },
      { name: "panelPowerWatts", label: "Putere panou", type: "number", unit: "W", min: 100, max: 1000, step: 1, required: true, defaultValue: 450 },
      { name: "panelArea", label: "Suprafata / panou", type: "number", unit: "mp", min: 0.5, max: 5, step: 0.01, required: true, defaultValue: 2.1 },
    ],
    outputs: [
      { name: "panelCount", label: "Numar panouri", unit: "panouri", decimals: 0 },
      { name: "roofAreaNeeded", label: "Suprafata aproximativa", unit: "mp", decimals: 2 },
    ],
    compute: (values) => {
      const targetSystemKwp = parseNumber(values.targetSystemKwp);
      const panelPowerWatts = Math.max(parseNumber(values.panelPowerWatts), 1);
      const panelArea = parseNumber(values.panelArea);
      const panelCount = Math.ceil((targetSystemKwp * 1000) / panelPowerWatts);
      return {
        panelCount,
        roofAreaNeeded: round(panelCount * panelArea, 2),
      };
    },
  },
  "solar-payback": {
    key: "solar-payback",
    title: "Calculator amortizare panouri fotovoltaice",
    slug: "calculator-amortizare-panouri-fotovoltaice",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza in cati ani se amortizeaza un sistem fotovoltaic pornind de la cost, economii si mentenanta.",
    formulaName: "Amortizare sistem FV",
    formulaExpression: "Ani amortizare = investitie neta / economie anuala neta",
    formulaDescription:
      "Calculatorul compara investitia neta cu economiile anuale ramase dupa mentenanta estimata.",
    howToSteps: [
      "Introdu costul total si eventualul sprijin sau grant.",
      "Introdu economiile anuale estimate si mentenanta anuala.",
      "Citeste investitia neta si anii de amortizare.",
    ],
    inputs: [
      { name: "systemCost", label: "Cost sistem", type: "number", unit: "lei", min: 1, max: 100000000, step: 1, required: true, defaultValue: 32000 },
      { name: "grantValue", label: "Grant / subventie", type: "number", unit: "lei", min: 0, max: 100000000, step: 1, required: true, defaultValue: 0 },
      { name: "annualSavings", label: "Economii anuale", type: "number", unit: "lei/an", min: 0.01, max: 100000000, step: 1, required: true, defaultValue: 5200 },
      { name: "annualMaintenance", label: "Mentenanta anuala", type: "number", unit: "lei/an", min: 0, max: 1000000, step: 1, required: true, defaultValue: 300 },
    ],
    outputs: [
      { name: "netInvestment", label: "Investitie neta", unit: "lei", decimals: 2 },
      { name: "paybackYears", label: "Amortizare", unit: "ani", decimals: 2 },
    ],
    compute: (values) => {
      const systemCost = parseNumber(values.systemCost);
      const grantValue = parseNumber(values.grantValue);
      const annualSavings = parseNumber(values.annualSavings);
      const annualMaintenance = parseNumber(values.annualMaintenance);
      const netInvestment = Math.max(systemCost - grantValue, 0);
      const netAnnualSavings = Math.max(annualSavings - annualMaintenance, 0.01);
      return {
        netInvestment: round(netInvestment, 2),
        paybackYears: round(netInvestment / netAnnualSavings, 2),
      };
    },
  },
  "ac-btu": {
    key: "ac-btu",
    title: "Calculator BTU aer conditionat",
    slug: "calculator-btu-aer-conditionat",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza capacitatea necesara pentru aer conditionat pornind de la suprafata, inaltime si nivelul de insorire.",
    formulaName: "Necesar BTU",
    formulaExpression: "BTU estimat = suprafata x factor baza x factori de ajustare",
    formulaDescription:
      "Calculatorul foloseste suprafata camerei si factori simpli de ajustare pentru a aproxima capacitatea BTU potrivita.",
    howToSteps: [
      "Introdu suprafata camerei si inaltimea.",
      "Alege nivelul de insorire si izolatia.",
      "Citeste necesarul BTU si echivalentul aproximativ in kW.",
    ],
    inputs: [
      { name: "area", label: "Suprafata", type: "number", unit: "mp", min: 1, max: 1000, step: 0.1, required: true, defaultValue: 26 },
      { name: "ceilingHeight", label: "Inaltime", type: "number", unit: "m", min: 2, max: 5, step: 0.1, required: true, defaultValue: 2.6 },
      { name: "sunFactor", label: "Factor insorire", type: "number", unit: "%", min: 80, max: 140, step: 1, required: true, defaultValue: 110 },
      { name: "insulationFactor", label: "Factor izolatie", type: "number", unit: "%", min: 85, max: 125, step: 1, required: true, defaultValue: 100 },
    ],
    outputs: [
      { name: "requiredBtu", label: "BTU recomandat", unit: "BTU/h", decimals: 0 },
      { name: "requiredKw", label: "Putere echivalenta", unit: "kW", decimals: 2 },
    ],
    compute: (values) => {
      const area = parseNumber(values.area);
      const ceilingHeight = parseNumber(values.ceilingHeight);
      const sunFactor = parseNumber(values.sunFactor) / 100;
      const insulationFactor = parseNumber(values.insulationFactor) / 100;
      const baseBtu = area * (ceilingHeight / 2.6) * 600;
      const requiredBtu = baseBtu * sunFactor * insulationFactor;
      return {
        requiredBtu: round(requiredBtu, 0),
        requiredKw: round(requiredBtu / 3412, 2),
      };
    },
  },
  "heating-load": {
    key: "heating-load",
    title: "Calculator necesar caldura locuinta",
    slug: "calculator-necesar-caldura-locuinta",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza necesarul de caldura pornind de la volum, izolatie si diferenta de temperatura.",
    formulaName: "Necesar termic",
    formulaExpression: "kW = volum x coeficient pierderi x deltaT / 1000",
    formulaDescription:
      "Calculatorul foloseste volumul si un coeficient simplificat de pierderi pentru a aproxima necesarul termic.",
    howToSteps: [
      "Introdu suprafata si inaltimea locuintei.",
      "Introdu diferenta de temperatura dorita si coeficientul de pierderi.",
      "Citeste necesarul termic estimat.",
    ],
    inputs: [
      { name: "area", label: "Suprafata", type: "number", unit: "mp", min: 1, max: 2000, step: 0.1, required: true, defaultValue: 120 },
      { name: "ceilingHeight", label: "Inaltime", type: "number", unit: "m", min: 2, max: 5, step: 0.1, required: true, defaultValue: 2.6 },
      { name: "temperatureDelta", label: "Delta temperatura", type: "number", unit: "°C", min: 1, max: 60, step: 1, required: true, defaultValue: 25 },
      { name: "heatLossCoefficient", label: "Coeficient pierderi", type: "number", unit: "W/mc°C", min: 0.1, max: 3, step: 0.01, required: true, defaultValue: 0.6 },
    ],
    outputs: [
      { name: "heatingLoadKw", label: "Necesar termic", unit: "kW", decimals: 2 },
    ],
    compute: (values) => {
      const area = parseNumber(values.area);
      const ceilingHeight = parseNumber(values.ceilingHeight);
      const temperatureDelta = parseNumber(values.temperatureDelta);
      const heatLossCoefficient = parseNumber(values.heatLossCoefficient);
      const volume = area * ceilingHeight;
      return {
        heatingLoadKw: round((volume * heatLossCoefficient * temperatureDelta) / 1000, 2),
      };
    },
  },
  "heat-pump-size": {
    key: "heat-pump-size",
    title: "Calculator dimensionare pompa de caldura",
    slug: "calculator-dimensionare-pompa-de-caldura",
    categorySlug: "energie-pentru-casa",
    summary:
      "Porneste de la necesarul termic si adauga o marja prudenta pentru a aproxima puterea pompei de caldura.",
    formulaName: "Dimensionare pompa de caldura",
    formulaExpression: "Putere recomandata = necesar termic x factor de siguranta",
    formulaDescription:
      "Calculatorul aplica un factor de siguranta peste necesarul termic pentru a aproxima puterea recomandata.",
    howToSteps: [
      "Introdu necesarul termic estimat.",
      "Alege marja de siguranta.",
      "Citeste puterea recomandata a pompei.",
    ],
    inputs: [
      { name: "heatingLoadKw", label: "Necesar termic", type: "number", unit: "kW", min: 0.1, max: 200, step: 0.1, required: true, defaultValue: 8.5 },
      { name: "safetyFactor", label: "Marja siguranta", type: "number", unit: "%", min: 100, max: 150, step: 1, required: true, defaultValue: 115 },
    ],
    outputs: [
      { name: "recommendedHeatPumpKw", label: "Pompa recomandata", unit: "kW", decimals: 2 },
    ],
    compute: (values) => {
      const heatingLoadKw = parseNumber(values.heatingLoadKw);
      const safetyFactor = parseNumber(values.safetyFactor) / 100;
      return {
        recommendedHeatPumpKw: round(heatingLoadKw * safetyFactor, 2),
      };
    },
  },
  "solar-battery-size": {
    key: "solar-battery-size",
    title: "Calculator baterie fotovoltaica",
    slug: "calculator-baterie-fotovoltaica",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza capacitatea unei baterii pornind de la consumul zilnic, orele de backup si adancimea de descarcare.",
    formulaName: "Capacitate baterie",
    formulaExpression: "Capacitate nominala = energie necesara / DoD",
    formulaDescription:
      "Calculatorul foloseste energia pe care vrei sa o acoperi in backup si adancimea de descarcare pentru a aproxima bateria necesara.",
    howToSteps: [
      "Introdu consumul mediu zilnic sau consumul care trebuie acoperit.",
      "Introdu ce procent din consum vrei in backup si adancimea de descarcare.",
      "Citeste capacitatea utila si capacitatea nominala estimata.",
    ],
    inputs: [
      { name: "dailyConsumptionKwh", label: "Consum zilnic", type: "number", unit: "kWh/zi", min: 0.1, max: 1000, step: 0.1, required: true, defaultValue: 12 },
      { name: "backupCoveragePercent", label: "Acoperire backup", type: "number", unit: "%", min: 1, max: 100, step: 1, required: true, defaultValue: 70 },
      { name: "depthOfDischarge", label: "Adancime descarcare", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 90 },
    ],
    outputs: [
      { name: "usableBatteryKwh", label: "Energie utila", unit: "kWh", decimals: 2 },
      { name: "nominalBatteryKwh", label: "Capacitate nominala", unit: "kWh", decimals: 2 },
    ],
    compute: (values) => {
      const dailyConsumptionKwh = parseNumber(values.dailyConsumptionKwh);
      const backupCoveragePercent = parseNumber(values.backupCoveragePercent) / 100;
      const depthOfDischarge = Math.max(parseNumber(values.depthOfDischarge), 1) / 100;
      const usableBatteryKwh = dailyConsumptionKwh * backupCoveragePercent;
      return {
        usableBatteryKwh: round(usableBatteryKwh, 2),
        nominalBatteryKwh: round(usableBatteryKwh / depthOfDischarge, 2),
      };
    },
  },
  "fridge-electricity-cost": {
    key: "fridge-electricity-cost",
    title: "Calculator consum frigider",
    slug: "calculator-consum-frigider",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza costul lunar si anual al frigiderului pornind de la consumul zilnic mediu.",
    formulaName: "Consum frigider",
    formulaExpression: "Consum lunar = kWh/zi x zile; cost = consum x pret/kWh",
    formulaDescription:
      "Calculatorul foloseste consumul mediu zilnic pentru a estima costul lunar si anual al frigiderului.",
    howToSteps: [
      "Introdu consumul mediu zilnic al frigiderului.",
      "Introdu pretul energiei electrice.",
      "Citeste costul lunar si anual estimat.",
    ],
    inputs: [
      { name: "dailyConsumptionKwh", label: "Consum zilnic", type: "number", unit: "kWh/zi", min: 0.01, max: 20, step: 0.01, required: true, defaultValue: 1.1 },
      { name: "pricePerKwh", label: "Pret energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
    ],
    outputs: [
      { name: "monthlyCost", label: "Cost lunar", unit: "lei", decimals: 2 },
      { name: "annualCost", label: "Cost anual", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const dailyConsumptionKwh = parseNumber(values.dailyConsumptionKwh);
      const pricePerKwh = parseNumber(values.pricePerKwh);
      const monthlyCost = dailyConsumptionKwh * 30 * pricePerKwh;
      return {
        monthlyCost: round(monthlyCost, 2),
        annualCost: round(monthlyCost * 12, 2),
      };
    },
  },
  "boiler-electricity-cost": {
    key: "boiler-electricity-cost",
    title: "Calculator consum boiler electric",
    slug: "calculator-consum-boiler-electric",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza energia si costul pentru incalzirea apei in boiler pornind de la volum si diferenta de temperatura.",
    formulaName: "Consum boiler",
    formulaExpression:
      "kWh = litri x deltaT x 0.001163 / eficienta x cicluri",
    formulaDescription:
      "Calculatorul foloseste energia necesara pentru incalzirea apei si o ajusteaza cu eficienta sistemului.",
    howToSteps: [
      "Introdu volumul de apa incalzit intr-un ciclu.",
      "Introdu diferenta de temperatura si numarul de cicluri.",
      "Citeste consumul si costul zilnic/lunar.",
    ],
    inputs: [
      { name: "litersPerCycle", label: "Litri / ciclu", type: "number", unit: "litri", min: 1, max: 1000, step: 1, required: true, defaultValue: 80 },
      { name: "temperatureRise", label: "Delta temperatura", type: "number", unit: "°C", min: 1, max: 80, step: 1, required: true, defaultValue: 35 },
      { name: "cyclesPerDay", label: "Cicluri / zi", type: "number", unit: "cicluri", min: 0.1, max: 20, step: 0.1, required: true, defaultValue: 1.2 },
      { name: "efficiencyPercent", label: "Eficienta", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 92 },
      { name: "pricePerKwh", label: "Pret energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
    ],
    outputs: [
      { name: "dailyKwh", label: "Consum zilnic", unit: "kWh", decimals: 2 },
      { name: "monthlyCost", label: "Cost lunar", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const litersPerCycle = parseNumber(values.litersPerCycle);
      const temperatureRise = parseNumber(values.temperatureRise);
      const cyclesPerDay = parseNumber(values.cyclesPerDay);
      const efficiencyPercent = Math.max(parseNumber(values.efficiencyPercent), 1) / 100;
      const pricePerKwh = parseNumber(values.pricePerKwh);
      const dailyKwh =
        (litersPerCycle * temperatureRise * 0.001163 * cyclesPerDay) / efficiencyPercent;
      return {
        dailyKwh: round(dailyKwh, 2),
        monthlyCost: round(dailyKwh * 30 * pricePerKwh, 2),
      };
    },
  },
  "ac-electricity-cost": {
    key: "ac-electricity-cost",
    title: "Calculator consum aer conditionat",
    slug: "calculator-consum-aer-conditionat",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza costul aerului conditionat pornind de la puterea medie consumata si timpul de functionare.",
    formulaName: "Consum aer conditionat",
    formulaExpression: "kWh = (kW medii x ore/zi x zile); cost = kWh x pret/kWh",
    formulaDescription:
      "Calculatorul leaga puterea medie absorbita de durata de functionare pentru a estima costul real.",
    howToSteps: [
      "Introdu puterea medie absorbita a aparatului.",
      "Introdu orele de functionare si numarul de zile.",
      "Citeste costul lunar si sezonier.",
    ],
    inputs: [
      { name: "averagePowerKw", label: "Putere medie absorbita", type: "number", unit: "kW", min: 0.1, max: 20, step: 0.01, required: true, defaultValue: 0.9 },
      { name: "hoursPerDay", label: "Ore / zi", type: "number", unit: "ore", min: 0.1, max: 24, step: 0.1, required: true, defaultValue: 8 },
      { name: "daysPerMonth", label: "Zile / luna", type: "number", unit: "zile", min: 1, max: 31, step: 1, required: true, defaultValue: 30 },
      { name: "pricePerKwh", label: "Pret energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
    ],
    outputs: [
      { name: "monthlyKwh", label: "Consum lunar", unit: "kWh", decimals: 2 },
      { name: "monthlyCost", label: "Cost lunar", unit: "lei", decimals: 2 },
      { name: "seasonCost", label: "Cost pentru 4 luni", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const averagePowerKw = parseNumber(values.averagePowerKw);
      const hoursPerDay = parseNumber(values.hoursPerDay);
      const daysPerMonth = parseNumber(values.daysPerMonth);
      const pricePerKwh = parseNumber(values.pricePerKwh);
      const monthlyKwh = averagePowerKw * hoursPerDay * daysPerMonth;
      const monthlyCost = monthlyKwh * pricePerKwh;
      return {
        monthlyKwh: round(monthlyKwh, 2),
        monthlyCost: round(monthlyCost, 2),
        seasonCost: round(monthlyCost * 4, 2),
      };
    },
  },
  "led-savings": {
    key: "led-savings",
    title: "Calculator economie becuri LED",
    slug: "calculator-economie-becuri-led",
    categorySlug: "energie-pentru-casa",
    summary:
      "Compara costul anual al becurilor clasice cu LED si estimeaza economia obtinuta.",
    formulaName: "Economie LED",
    formulaExpression:
      "Economii = (consum vechi - consum LED) x ore x zile x pret/kWh",
    formulaDescription:
      "Calculatorul compara doua puteri de iluminat pentru acelasi numar de becuri si acelasi timp de utilizare.",
    howToSteps: [
      "Introdu puterea becurilor vechi si a becurilor LED.",
      "Introdu numarul de becuri si timpul de folosire.",
      "Citeste economia anuala si perioada de recuperare.",
    ],
    inputs: [
      { name: "oldBulbWatts", label: "Putere bec vechi", type: "number", unit: "W", min: 1, max: 1000, step: 1, required: true, defaultValue: 60 },
      { name: "ledBulbWatts", label: "Putere LED", type: "number", unit: "W", min: 1, max: 1000, step: 1, required: true, defaultValue: 9 },
      { name: "bulbCount", label: "Numar becuri", type: "number", unit: "becuri", min: 1, max: 500, step: 1, required: true, defaultValue: 12 },
      { name: "hoursPerDay", label: "Ore / zi", type: "number", unit: "ore", min: 0.1, max: 24, step: 0.1, required: true, defaultValue: 5 },
      { name: "pricePerKwh", label: "Pret energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
      { name: "upgradeCost", label: "Cost upgrade LED", type: "number", unit: "lei", min: 0, max: 100000, step: 1, required: true, defaultValue: 180 },
    ],
    outputs: [
      { name: "annualSavings", label: "Economii anuale", unit: "lei", decimals: 2 },
      { name: "paybackMonths", label: "Recuperare investitie", unit: "luni", decimals: 1 },
    ],
    compute: (values) => {
      const oldBulbWatts = parseNumber(values.oldBulbWatts);
      const ledBulbWatts = parseNumber(values.ledBulbWatts);
      const bulbCount = parseNumber(values.bulbCount);
      const hoursPerDay = parseNumber(values.hoursPerDay);
      const pricePerKwh = parseNumber(values.pricePerKwh);
      const upgradeCost = parseNumber(values.upgradeCost);
      const annualOldKwh = (oldBulbWatts / 1000) * bulbCount * hoursPerDay * 365;
      const annualLedKwh = (ledBulbWatts / 1000) * bulbCount * hoursPerDay * 365;
      const annualSavings = (annualOldKwh - annualLedKwh) * pricePerKwh;
      return {
        annualSavings: round(annualSavings, 2),
        paybackMonths: round(upgradeCost / Math.max(annualSavings / 12, 0.01), 1),
      };
    },
  },
  "solar-roof-area": {
    key: "solar-roof-area",
    title: "Calculator suprafata acoperis pentru panouri",
    slug: "calculator-suprafata-acoperis-panouri",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza cate panouri si ce putere maxima incap pe suprafata utila a acoperisului.",
    formulaName: "Capacitate dupa suprafata acoperisului",
    formulaExpression: "Panouri maxime = suprafata utila / suprafata panou",
    formulaDescription:
      "Calculatorul transforma suprafata utila in numar de panouri si putere maxima instalabila.",
    howToSteps: [
      "Introdu suprafata utila reala a acoperisului.",
      "Introdu suprafata si puterea unui panou.",
      "Citeste numarul maxim de panouri si puterea totala.",
    ],
    inputs: [
      { name: "usableRoofArea", label: "Suprafata utila", type: "number", unit: "mp", min: 1, max: 10000, step: 0.1, required: true, defaultValue: 42 },
      { name: "panelArea", label: "Suprafata panou", type: "number", unit: "mp", min: 0.5, max: 5, step: 0.01, required: true, defaultValue: 2.1 },
      { name: "panelPowerWatts", label: "Putere panou", type: "number", unit: "W", min: 100, max: 1000, step: 1, required: true, defaultValue: 450 },
    ],
    outputs: [
      { name: "maxPanels", label: "Panouri maxime", unit: "panouri", decimals: 0 },
      { name: "maxSystemKwp", label: "Putere maxima", unit: "kWp", decimals: 2 },
    ],
    compute: (values) => {
      const usableRoofArea = parseNumber(values.usableRoofArea);
      const panelArea = Math.max(parseNumber(values.panelArea), 0.01);
      const panelPowerWatts = parseNumber(values.panelPowerWatts);
      const maxPanels = Math.floor(usableRoofArea / panelArea);
      return {
        maxPanels,
        maxSystemKwp: round((maxPanels * panelPowerWatts) / 1000, 2),
      };
    },
  },
  "solar-inverter-size": {
    key: "solar-inverter-size",
    title: "Calculator putere invertor fotovoltaic",
    slug: "calculator-putere-invertor-fotovoltaic",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza puterea invertorului pornind de la puterea DC a sistemului si raportul DC/AC dorit.",
    formulaName: "Dimensionare invertor",
    formulaExpression: "Invertor AC = kWp DC / raport DC-AC",
    formulaDescription:
      "Calculatorul foloseste puterea sistemului si un raport DC/AC pentru a aproxima invertorul potrivit.",
    howToSteps: [
      "Introdu puterea sistemului in kWp.",
      "Introdu raportul DC/AC dorit.",
      "Citeste puterea aproximativa a invertorului.",
    ],
    inputs: [
      { name: "systemSizeKwp", label: "Sistem DC", type: "number", unit: "kWp", min: 0.1, max: 1000, step: 0.1, required: true, defaultValue: 6.3 },
      { name: "dcAcRatio", label: "Raport DC/AC", type: "number", min: 0.5, max: 2, step: 0.01, required: true, defaultValue: 1.15 },
    ],
    outputs: [
      { name: "recommendedInverterKw", label: "Invertor recomandat", unit: "kW", decimals: 2 },
    ],
    compute: (values) => {
      const systemSizeKwp = parseNumber(values.systemSizeKwp);
      const dcAcRatio = Math.max(parseNumber(values.dcAcRatio), 0.01);
      return {
        recommendedInverterKw: round(systemSizeKwp / dcAcRatio, 2),
      };
    },
  },
  "solar-self-consumption": {
    key: "solar-self-consumption",
    title: "Calculator autoconsum fotovoltaic",
    slug: "calculator-autoconsum-fotovoltaic",
    categorySlug: "energie-pentru-casa",
    summary:
      "Imparte productia fotovoltaica intre autoconsum si energie injectata, apoi o raporteaza la consumul casei.",
    formulaName: "Autoconsum si injectare",
    formulaExpression:
      "Autoconsum = productie x procent autoconsum; injectare = productie - autoconsum",
    formulaDescription:
      "Calculatorul estimeaza cat din productie folosesti direct si cat ajunge in retea.",
    howToSteps: [
      "Introdu productia anuala estimata.",
      "Introdu procentul de autoconsum dorit sau observat.",
      "Citeste energia autoconsumata, injectata si acoperirea consumului.",
    ],
    inputs: [
      { name: "annualProductionKwh", label: "Productie anuala", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 6800 },
      { name: "annualConsumptionKwh", label: "Consum anual", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 4200 },
      { name: "selfConsumptionPercent", label: "Autoconsum", type: "number", unit: "%", min: 1, max: 100, step: 1, required: true, defaultValue: 45 },
    ],
    outputs: [
      { name: "selfConsumedKwh", label: "Autoconsum", unit: "kWh/an", decimals: 0 },
      { name: "exportedKwh", label: "Injectat in retea", unit: "kWh/an", decimals: 0 },
      { name: "consumptionCoverage", label: "Acoperire consum", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const annualProductionKwh = parseNumber(values.annualProductionKwh);
      const annualConsumptionKwh = Math.max(parseNumber(values.annualConsumptionKwh), 0.01);
      const selfConsumptionPercent = parseNumber(values.selfConsumptionPercent) / 100;
      const selfConsumedKwh = annualProductionKwh * selfConsumptionPercent;
      const exportedKwh = annualProductionKwh - selfConsumedKwh;
      return {
        selfConsumedKwh: round(selfConsumedKwh, 0),
        exportedKwh: round(exportedKwh, 0),
        consumptionCoverage: round((selfConsumedKwh / annualConsumptionKwh) * 100, 2),
      };
    },
  },
  "ups-runtime": {
    key: "ups-runtime",
    title: "Calculator autonomie UPS",
    slug: "calculator-autonomie-ups",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza cate ore de backup obtii dintr-o baterie sau un UPS la o anumita sarcina.",
    formulaName: "Autonomie UPS",
    formulaExpression:
      "Ore = (Ah x V x DoD x eficienta) / W sarcina",
    formulaDescription:
      "Calculatorul foloseste energia disponibila in baterie si puterea consumatorilor pentru a aproxima autonomia.",
    howToSteps: [
      "Introdu tensiunea, capacitatea bateriei si sarcina in wati.",
      "Introdu eficienta si adancimea de descarcare.",
      "Citeste autonomia estimata in ore si minute.",
    ],
    inputs: [
      { name: "batteryVoltage", label: "Tensiune baterie", type: "number", unit: "V", min: 1, max: 500, step: 1, required: true, defaultValue: 24 },
      { name: "batteryCapacityAh", label: "Capacitate baterie", type: "number", unit: "Ah", min: 1, max: 10000, step: 1, required: true, defaultValue: 100 },
      { name: "loadWatts", label: "Sarcina", type: "number", unit: "W", min: 1, max: 100000, step: 1, required: true, defaultValue: 300 },
      { name: "efficiencyPercent", label: "Eficienta", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 90 },
      { name: "depthOfDischarge", label: "Adancime descarcare", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 80 },
    ],
    outputs: [
      { name: "runtimeHours", label: "Autonomie", unit: "ore", decimals: 2 },
      { name: "runtimeMinutes", label: "Autonomie", unit: "minute", decimals: 0 },
    ],
    compute: (values) => {
      const batteryVoltage = parseNumber(values.batteryVoltage);
      const batteryCapacityAh = parseNumber(values.batteryCapacityAh);
      const loadWatts = Math.max(parseNumber(values.loadWatts), 0.01);
      const efficiencyPercent = parseNumber(values.efficiencyPercent) / 100;
      const depthOfDischarge = parseNumber(values.depthOfDischarge) / 100;
      const runtimeHours =
        (batteryVoltage * batteryCapacityAh * efficiencyPercent * depthOfDischarge) /
        loadWatts;
      return {
        runtimeHours: round(runtimeHours, 2),
        runtimeMinutes: round(runtimeHours * 60, 0),
      };
    },
  },
  "heating-cost-comparison": {
    key: "heating-cost-comparison",
    title: "Calculator cost incalzire gaz vs pompa de caldura",
    slug: "calculator-cost-incalzire-gaz-vs-pompa-de-caldura",
    categorySlug: "energie-pentru-casa",
    summary:
      "Compara costul anual al incalzirii intre gaz si pompa de caldura pornind de la necesarul termic.",
    formulaName: "Comparatie cost incalzire",
    formulaExpression:
      "Cost gaz = necesar / eficienta x pret gaz; Cost pompa = necesar / COP x pret energie",
    formulaDescription:
      "Calculatorul raporteaza aceeasi nevoie de caldura la doua tehnologii diferite pentru a compara costul anual.",
    howToSteps: [
      "Introdu necesarul anual de caldura.",
      "Introdu pretul gazului, eficienta centralei, pretul energiei si COP-ul pompei.",
      "Citeste costurile anuale si diferenta.",
    ],
    inputs: [
      { name: "annualHeatNeedKwh", label: "Necesar anual", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 14000 },
      { name: "gasPricePerKwh", label: "Pret gaz", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.38 },
      { name: "boilerEfficiencyPercent", label: "Eficienta centrala", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 92 },
      { name: "electricityPricePerKwh", label: "Pret energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
      { name: "heatPumpCop", label: "COP pompa", type: "number", min: 1, max: 10, step: 0.1, required: true, defaultValue: 3.4 },
    ],
    outputs: [
      { name: "gasAnnualCost", label: "Cost anual gaz", unit: "lei", decimals: 2 },
      { name: "heatPumpAnnualCost", label: "Cost anual pompa", unit: "lei", decimals: 2 },
      { name: "annualDifference", label: "Diferenta anuala", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const annualHeatNeedKwh = parseNumber(values.annualHeatNeedKwh);
      const gasPricePerKwh = parseNumber(values.gasPricePerKwh);
      const boilerEfficiencyPercent = Math.max(parseNumber(values.boilerEfficiencyPercent), 1) / 100;
      const electricityPricePerKwh = parseNumber(values.electricityPricePerKwh);
      const heatPumpCop = Math.max(parseNumber(values.heatPumpCop), 0.1);
      const gasAnnualCost = (annualHeatNeedKwh / boilerEfficiencyPercent) * gasPricePerKwh;
      const heatPumpAnnualCost = (annualHeatNeedKwh / heatPumpCop) * electricityPricePerKwh;
      return {
        gasAnnualCost: round(gasAnnualCost, 2),
        heatPumpAnnualCost: round(heatPumpAnnualCost, 2),
        annualDifference: round(gasAnnualCost - heatPumpAnnualCost, 2),
      };
    },
  },
  "solar-co2-savings": {
    key: "solar-co2-savings",
    title: "Calculator economie CO2 panouri fotovoltaice",
    slug: "calculator-economie-co2-panouri-fotovoltaice",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimeaza emisiile evitate anual pornind de la productia fotovoltaica si factorul de emisii folosit.",
    formulaName: "CO2 evitat",
    formulaExpression: "CO2 evitat = productie anuala x factor emisii",
    formulaDescription:
      "Calculatorul transforma energia produsa din panouri intr-o estimare simplificata a emisiilor evitate.",
    howToSteps: [
      "Introdu productia anuala estimata a sistemului.",
      "Introdu factorul de emisii folosit pentru comparatie.",
      "Citeste emisiile evitate in kg si tone.",
    ],
    inputs: [
      { name: "annualProductionKwh", label: "Productie anuala", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 6800 },
      { name: "emissionFactor", label: "Factor emisii", type: "number", unit: "kg CO2/kWh", min: 0.01, max: 2, step: 0.01, required: true, defaultValue: 0.3 },
    ],
    outputs: [
      { name: "avoidedKgCo2", label: "CO2 evitat", unit: "kg/an", decimals: 0 },
      { name: "avoidedTonsCo2", label: "CO2 evitat", unit: "tone/an", decimals: 2 },
    ],
    compute: (values) => {
      const annualProductionKwh = parseNumber(values.annualProductionKwh);
      const emissionFactor = parseNumber(values.emissionFactor);
      const avoidedKgCo2 = annualProductionKwh * emissionFactor;
      return {
        avoidedKgCo2: round(avoidedKgCo2, 0),
        avoidedTonsCo2: round(avoidedKgCo2 / 1000, 2),
      };
    },
  },
  "price-per-sqm": {
    key: "price-per-sqm",
    title: "Calculator pret pe mp",
    slug: "calculator-pret-pe-mp",
    categorySlug: "imobiliare",
    summary:
      "Calculeaza pretul pe metru patrat pornind de la pretul total al proprietatii si suprafata utila.",
    formulaName: "Pret pe metru patrat",
    formulaExpression: "Pret/mp = pret total / suprafata utila",
    formulaDescription:
      "Calculatorul imparte pretul total al proprietatii la suprafata utila pentru a obtine un reper comparabil intre anunturi sau scenarii.",
    howToSteps: [
      "Introdu pretul total cerut sau negociat.",
      "Introdu suprafata utila folosita in comparatie.",
      "Citeste pretul pe mp si foloseste-l pentru a compara proprietati similare.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Pret total",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 620000,
      },
      {
        name: "usableArea",
        label: "Suprafata utila",
        type: "number",
        unit: "mp",
        min: 1,
        max: 10000,
        step: 0.1,
        required: true,
        defaultValue: 72,
      },
    ],
    outputs: [{ name: "pricePerSqm", label: "Pret pe mp", unit: "lei/mp", decimals: 2 }],
    compute: (values) => {
      const purchasePrice = parseNumber(values.purchasePrice);
      const usableArea = Math.max(parseNumber(values.usableArea), 0.01);
      return {
        pricePerSqm: round(purchasePrice / usableArea, 2),
      };
    },
  },
  "property-down-payment": {
    key: "property-down-payment",
    title: "Calculator avans locuinta",
    slug: "calculator-avans-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Transforma procentul de avans intr-o suma concreta si arata cat ramane de finantat pentru achizitia unei locuinte.",
    formulaName: "Avans locuinta",
    formulaExpression:
      "Avans = pret total x procent avans; suma finantata = pret total - avans",
    formulaDescription:
      "Calculatorul transforma rapid procentul de avans intr-o suma concreta si estimeaza partea ramasa pentru finantare.",
    howToSteps: [
      "Introdu pretul total al proprietatii.",
      "Introdu procentul de avans pe care vrei sa-l testezi.",
      "Citeste suma avansului si suma care ramane de finantat.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Pret proprietate",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 580000,
      },
      {
        name: "downPaymentPercent",
        label: "Procent avans",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 15,
      },
    ],
    outputs: [
      { name: "downPaymentAmount", label: "Avans", unit: "lei", decimals: 2 },
      { name: "financedAmount", label: "Suma finantata", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const purchasePrice = Math.max(parseNumber(values.purchasePrice), 0.01);
      const downPaymentPercent = parseNumber(values.downPaymentPercent);
      const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
      return {
        downPaymentAmount: round(downPaymentAmount, 2),
        financedAmount: round(purchasePrice - downPaymentAmount, 2),
      };
    },
  },
  "property-total-purchase-cost": {
    key: "property-total-purchase-cost",
    title: "Calculator cost total achizitie locuinta",
    slug: "calculator-cost-total-achizitie-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Leaga pretul locuintei de taxele si costurile initiale, renovare, mobilare si o marja de rezerva.",
    formulaName: "Cost total proiect imobiliar",
    formulaExpression:
      "Cost total = pret proprietate + costuri inchidere + renovare + mobilare + rezerva",
    formulaDescription:
      "Calculatorul separa pretul proprietatii de costurile initiale suplimentare si aplica o rezerva simpla pentru bugetare mai prudenta.",
    howToSteps: [
      "Introdu pretul proprietatii si costurile de inchidere estimate.",
      "Adauga bugetul pentru renovare si mobilare.",
      "Alege o marja de rezerva si citeste costul total estimat.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Pret proprietate",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 620000,
      },
      {
        name: "closingCosts",
        label: "Costuri inchidere",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 24000,
      },
      {
        name: "renovationBudget",
        label: "Buget renovare",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 45000,
      },
      {
        name: "furnishingBudget",
        label: "Buget mobilare",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 30000,
      },
      {
        name: "contingencyPercent",
        label: "Rezerva buget",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 10,
      },
    ],
    outputs: [
      { name: "baseProjectCost", label: "Cost proiect", unit: "lei", decimals: 2 },
      { name: "contingencyAmount", label: "Rezerva", unit: "lei", decimals: 2 },
      { name: "totalProjectCost", label: "Cost total", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const purchasePrice = parseNumber(values.purchasePrice);
      const closingCosts = parseNumber(values.closingCosts);
      const renovationBudget = parseNumber(values.renovationBudget);
      const furnishingBudget = parseNumber(values.furnishingBudget);
      const contingencyPercent = parseNumber(values.contingencyPercent);
      const extras = closingCosts + renovationBudget + furnishingBudget;
      const contingencyAmount = extras * (contingencyPercent / 100);
      const baseProjectCost = purchasePrice + extras;
      return {
        baseProjectCost: round(baseProjectCost, 2),
        contingencyAmount: round(contingencyAmount, 2),
        totalProjectCost: round(baseProjectCost + contingencyAmount, 2),
      };
    },
  },
  "rent-vs-buy": {
    key: "rent-vs-buy",
    title: "Calculator chirie vs cumparare",
    slug: "calculator-chirie-vs-cumparare",
    categorySlug: "imobiliare",
    summary:
      "Compara costul cumulat al chiriei cu costul unui scenariu de proprietate pe acelasi interval de timp.",
    formulaName: "Comparatie chirie vs cumparare",
    formulaExpression:
      "Chirie totala = chirie lunara x 12 x ani; Cost proprietate = cost initial + cost lunar x 12 x ani",
    formulaDescription:
      "Calculatorul compara rapid doua scenarii de locuire folosind acelasi orizont de timp si aceeasi unitate monetara.",
    howToSteps: [
      "Introdu chiria lunara si costul lunar al scenariului de proprietate.",
      "Adauga costul initial al cumpararii si perioada de comparatie.",
      "Citeste costul cumulat pentru ambele scenarii si diferenta dintre ele.",
    ],
    inputs: [
      {
        name: "monthlyRent",
        label: "Chirie lunara",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 3200,
      },
      {
        name: "monthlyOwnershipCost",
        label: "Cost lunar proprietate",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 3800,
      },
      {
        name: "upfrontBuyingCost",
        label: "Cost initial cumparare",
        type: "number",
        unit: "lei",
        min: 0,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 95000,
      },
      {
        name: "years",
        label: "Perioada comparata",
        type: "number",
        unit: "ani",
        min: 1,
        max: 50,
        step: 1,
        required: true,
        defaultValue: 7,
      },
    ],
    outputs: [
      { name: "totalRentCost", label: "Cost total chirie", unit: "lei", decimals: 2 },
      {
        name: "totalOwnershipCost",
        label: "Cost total proprietate",
        unit: "lei",
        decimals: 2,
      },
      { name: "difference", label: "Diferenta", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyRent = parseNumber(values.monthlyRent);
      const monthlyOwnershipCost = parseNumber(values.monthlyOwnershipCost);
      const upfrontBuyingCost = parseNumber(values.upfrontBuyingCost);
      const years = Math.max(parseNumber(values.years), 1);
      const totalRentCost = monthlyRent * 12 * years;
      const totalOwnershipCost = upfrontBuyingCost + monthlyOwnershipCost * 12 * years;
      return {
        totalRentCost: round(totalRentCost, 2),
        totalOwnershipCost: round(totalOwnershipCost, 2),
        difference: round(totalOwnershipCost - totalRentCost, 2),
      };
    },
  },
  "renovation-budget": {
    key: "renovation-budget",
    title: "Calculator buget renovare",
    slug: "calculator-buget-renovare",
    categorySlug: "imobiliare",
    summary:
      "Estimeaza bugetul de renovare pornind de la suprafata, costul pe mp si o rezerva pentru surprizele din lucrare.",
    formulaName: "Buget renovare",
    formulaExpression: "Buget = suprafata x cost/mp + rezerva",
    formulaDescription:
      "Calculatorul foloseste un cost mediu pe mp si adauga o rezerva procentuala pentru a aproxima mai prudent bugetul de renovare.",
    howToSteps: [
      "Introdu suprafata care intra in renovare.",
      "Introdu costul estimat pe mp si rezerva dorita.",
      "Citeste bugetul de baza, rezerva si totalul proiectului.",
    ],
    inputs: [
      {
        name: "area",
        label: "Suprafata renovata",
        type: "number",
        unit: "mp",
        min: 1,
        max: 10000,
        step: 0.1,
        required: true,
        defaultValue: 68,
      },
      {
        name: "costPerSqm",
        label: "Cost estimat pe mp",
        type: "number",
        unit: "lei/mp",
        min: 0,
        max: 100000,
        step: 1,
        required: true,
        defaultValue: 900,
      },
      {
        name: "contingencyPercent",
        label: "Rezerva",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 12,
      },
    ],
    outputs: [
      { name: "baseBudget", label: "Buget de baza", unit: "lei", decimals: 2 },
      { name: "contingencyAmount", label: "Rezerva", unit: "lei", decimals: 2 },
      { name: "totalBudget", label: "Buget total", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const area = parseNumber(values.area);
      const costPerSqm = parseNumber(values.costPerSqm);
      const contingencyPercent = parseNumber(values.contingencyPercent);
      const baseBudget = area * costPerSqm;
      const contingencyAmount = baseBudget * (contingencyPercent / 100);
      return {
        baseBudget: round(baseBudget, 2),
        contingencyAmount: round(contingencyAmount, 2),
        totalBudget: round(baseBudget + contingencyAmount, 2),
      };
    },
  },
  "furniture-budget": {
    key: "furniture-budget",
    title: "Calculator buget mobilare",
    slug: "calculator-buget-mobilare",
    categorySlug: "imobiliare",
    summary:
      "Estimeaza bugetul de mobilare si electrocasnice pornind de la numarul de camere si o rezerva de buget.",
    formulaName: "Buget mobilare",
    formulaExpression: "Buget = camere x buget/camera + electrocasnice + rezerva",
    formulaDescription:
      "Calculatorul transforma o estimare pe camera intr-un buget total si adauga separat costul pentru electrocasnice si o marja de rezerva.",
    howToSteps: [
      "Introdu numarul de camere si bugetul estimat per camera.",
      "Adauga bugetul pentru electrocasnice si rezerva dorita.",
      "Citeste bugetul de baza si totalul recomandat.",
    ],
    inputs: [
      {
        name: "rooms",
        label: "Numar camere",
        type: "number",
        unit: "camere",
        min: 1,
        max: 30,
        step: 1,
        required: true,
        defaultValue: 3,
      },
      {
        name: "budgetPerRoom",
        label: "Buget / camera",
        type: "number",
        unit: "lei",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 9000,
      },
      {
        name: "appliancesBudget",
        label: "Electrocasnice",
        type: "number",
        unit: "lei",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 18000,
      },
      {
        name: "contingencyPercent",
        label: "Rezerva",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 8,
      },
    ],
    outputs: [
      { name: "baseBudget", label: "Buget de baza", unit: "lei", decimals: 2 },
      { name: "contingencyAmount", label: "Rezerva", unit: "lei", decimals: 2 },
      { name: "totalBudget", label: "Buget total", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const rooms = Math.max(parseNumber(values.rooms), 1);
      const budgetPerRoom = parseNumber(values.budgetPerRoom);
      const appliancesBudget = parseNumber(values.appliancesBudget);
      const contingencyPercent = parseNumber(values.contingencyPercent);
      const baseBudget = rooms * budgetPerRoom + appliancesBudget;
      const contingencyAmount = baseBudget * (contingencyPercent / 100);
      return {
        baseBudget: round(baseBudget, 2),
        contingencyAmount: round(contingencyAmount, 2),
        totalBudget: round(baseBudget + contingencyAmount, 2),
      };
    },
  },
  "monthly-home-budget": {
    key: "monthly-home-budget",
    title: "Calculator buget lunar locuinta",
    slug: "calculator-buget-lunar-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Aduna chiria sau rata cu utilitatile, administrarea, mentenanta si asigurarea pentru a vedea costul lunar total al locuirii.",
    formulaName: "Buget lunar locuinta",
    formulaExpression:
      "Cost lunar total = rata sau chirie + utilitati + administrare + mentenanta + asigurare",
    formulaDescription:
      "Calculatorul aduna principalele costuri recurente ale unei locuinte pentru a oferi o imagine mai realista a presiunii lunare asupra bugetului.",
    howToSteps: [
      "Introdu rata sau chiria lunara.",
      "Adauga utilitatile si celelalte costuri recurente.",
      "Citeste costul lunar si anual al locuintei.",
    ],
    inputs: [
      {
        name: "housingCost",
        label: "Rata sau chirie",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 3400,
      },
      {
        name: "utilities",
        label: "Utilitati",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 850,
      },
      {
        name: "associationFees",
        label: "Administrare",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 250,
      },
      {
        name: "maintenanceReserve",
        label: "Rezerva mentenanta",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 300,
      },
      {
        name: "insurance",
        label: "Asigurare",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 70,
      },
    ],
    outputs: [
      { name: "monthlyTotal", label: "Cost lunar total", unit: "lei", decimals: 2 },
      { name: "annualTotal", label: "Cost anual", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const housingCost = parseNumber(values.housingCost);
      const utilities = parseNumber(values.utilities);
      const associationFees = parseNumber(values.associationFees);
      const maintenanceReserve = parseNumber(values.maintenanceReserve);
      const insurance = parseNumber(values.insurance);
      const monthlyTotal =
        housingCost + utilities + associationFees + maintenanceReserve + insurance;
      return {
        monthlyTotal: round(monthlyTotal, 2),
        annualTotal: round(monthlyTotal * 12, 2),
      };
    },
  },
  "price-negotiation": {
    key: "price-negotiation",
    title: "Calculator negociere pret proprietate",
    slug: "calculator-negociere-pret-proprietate",
    categorySlug: "imobiliare",
    summary:
      "Arata rapid pretul negociat si economia obtinuta pornind de la pretul cerut si discountul estimat.",
    formulaName: "Negociere pret",
    formulaExpression: "Pret negociat = pret cerut x (1 - discount%); economie = diferenta",
    formulaDescription:
      "Calculatorul transforma un discount procentual intr-o economie concreta si intr-un pret final de comparat cu alte anunturi.",
    howToSteps: [
      "Introdu pretul cerut al proprietatii.",
      "Introdu discountul pe care vrei sa-l testezi.",
      "Citeste pretul negociat si economia potentiala.",
    ],
    inputs: [
      {
        name: "askingPrice",
        label: "Pret cerut",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 590000,
      },
      {
        name: "discountPercent",
        label: "Discount negociat",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 4,
      },
    ],
    outputs: [
      { name: "negotiatedPrice", label: "Pret negociat", unit: "lei", decimals: 2 },
      { name: "savingsAmount", label: "Economie", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const askingPrice = Math.max(parseNumber(values.askingPrice), 0.01);
      const discountPercent = parseNumber(values.discountPercent);
      const negotiatedPrice = askingPrice * (1 - discountPercent / 100);
      return {
        negotiatedPrice: round(negotiatedPrice, 2),
        savingsAmount: round(askingPrice - negotiatedPrice, 2),
      };
    },
  },
  "space-per-person": {
    key: "space-per-person",
    title: "Calculator spatiu pe persoana",
    slug: "calculator-spatiu-pe-persoana",
    categorySlug: "imobiliare",
    summary:
      "Raporteaza suprafata utila si numarul de camere la numarul de persoane din locuinta pentru o comparatie mai practica.",
    formulaName: "Spatiu pe persoana",
    formulaExpression:
      "mp/persoana = suprafata utila / persoane; camere/persoana = camere / persoane",
    formulaDescription:
      "Calculatorul transforma suprafata si numarul de camere intr-un reper simplu pentru compararea configuratiilor de locuire.",
    howToSteps: [
      "Introdu suprafata utila si numarul de camere.",
      "Introdu numarul de persoane care vor folosi locuinta.",
      "Citeste suprafata si camerele disponibile per persoana.",
    ],
    inputs: [
      {
        name: "usableArea",
        label: "Suprafata utila",
        type: "number",
        unit: "mp",
        min: 1,
        max: 10000,
        step: 0.1,
        required: true,
        defaultValue: 76,
      },
      {
        name: "rooms",
        label: "Numar camere",
        type: "number",
        unit: "camere",
        min: 1,
        max: 30,
        step: 1,
        required: true,
        defaultValue: 3,
      },
      {
        name: "residents",
        label: "Numar persoane",
        type: "number",
        unit: "persoane",
        min: 1,
        max: 20,
        step: 1,
        required: true,
        defaultValue: 3,
      },
    ],
    outputs: [
      { name: "sqmPerPerson", label: "mp per persoana", unit: "mp", decimals: 2 },
      { name: "roomsPerPerson", label: "Camere per persoana", decimals: 2 },
    ],
    compute: (values) => {
      const usableArea = parseNumber(values.usableArea);
      const rooms = parseNumber(values.rooms);
      const residents = Math.max(parseNumber(values.residents), 1);
      return {
        sqmPerPerson: round(usableArea / residents, 2),
        roomsPerPerson: round(rooms / residents, 2),
      };
    },
  },
  "mortgage-buffer": {
    key: "mortgage-buffer",
    title: "Calculator buffer rata locuinta",
    slug: "calculator-buffer-rata-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Arata ce spatiu ramane in buget dupa costul locuintei si o rezerva minima de siguranta.",
    formulaName: "Buffer dupa costul locuintei",
    formulaExpression:
      "Buffer = venit net - cost locuinta; buffer dupa rezerva = buffer - venit x rezerva%",
    formulaDescription:
      "Calculatorul nu spune daca o locuinta este automat accesibila, dar arata rapid cat spatiu lunar mai ramane dupa costul principal si o rezerva prudenta.",
    howToSteps: [
      "Introdu venitul lunar net al gospodariei.",
      "Introdu costul lunar al locuintei si rezerva de siguranta dorita.",
      "Citeste ponderea locuintei in venit si bufferul ramas dupa rezerva.",
    ],
    inputs: [
      {
        name: "householdNetIncome",
        label: "Venit net gospodarie",
        type: "number",
        unit: "lei/luna",
        min: 0.01,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 12000,
      },
      {
        name: "monthlyHousingCost",
        label: "Cost lunar locuinta",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 4200,
      },
      {
        name: "reservePercent",
        label: "Rezerva minima",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 15,
      },
    ],
    outputs: [
      { name: "housingSharePercent", label: "Pondere locuinta", unit: "%", decimals: 2 },
      { name: "monthlyBuffer", label: "Buffer ramas", unit: "lei", decimals: 2 },
      { name: "bufferAfterReserve", label: "Buffer dupa rezerva", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const householdNetIncome = Math.max(parseNumber(values.householdNetIncome), 0.01);
      const monthlyHousingCost = parseNumber(values.monthlyHousingCost);
      const reservePercent = parseNumber(values.reservePercent);
      const monthlyBuffer = householdNetIncome - monthlyHousingCost;
      const reserveAmount = householdNetIncome * (reservePercent / 100);
      return {
        housingSharePercent: round((monthlyHousingCost / householdNetIncome) * 100, 2),
        monthlyBuffer: round(monthlyBuffer, 2),
        bufferAfterReserve: round(monthlyBuffer - reserveAmount, 2),
      };
    },
  },
  "rental-yield": {
    key: "rental-yield",
    title: "Calculator randament chirie",
    slug: "calculator-randament-chirie",
    categorySlug: "imobiliare",
    summary:
      "Calculeaza randamentul brut si net din chirie pornind de la pretul proprietatii, chiria lunara si costurile anuale.",
    formulaName: "Randament chirie",
    formulaExpression:
      "Randament brut = chirie anuala / pret; randament net = (chirie anuala - costuri) / pret",
    formulaDescription:
      "Calculatorul separa randamentul brut de cel net pentru a arata mai clar ce ramane dupa costurile recurente.",
    howToSteps: [
      "Introdu pretul proprietatii si chiria lunara estimata.",
      "Adauga costurile anuale recurente asociate inchirierii.",
      "Citeste randamentul brut, randamentul net si venitul net anual.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Pret proprietate",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 520000,
      },
      {
        name: "monthlyRent",
        label: "Chirie lunara",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 2800,
      },
      {
        name: "annualCosts",
        label: "Costuri anuale",
        type: "number",
        unit: "lei/an",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 7000,
      },
    ],
    outputs: [
      { name: "grossYieldPercent", label: "Randament brut", unit: "%", decimals: 2 },
      { name: "netYieldPercent", label: "Randament net", unit: "%", decimals: 2 },
      { name: "annualNetIncome", label: "Venit net anual", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const purchasePrice = Math.max(parseNumber(values.purchasePrice), 0.01);
      const monthlyRent = parseNumber(values.monthlyRent);
      const annualCosts = parseNumber(values.annualCosts);
      const annualRent = monthlyRent * 12;
      const annualNetIncome = annualRent - annualCosts;
      return {
        grossYieldPercent: round((annualRent / purchasePrice) * 100, 2),
        netYieldPercent: round((annualNetIncome / purchasePrice) * 100, 2),
        annualNetIncome: round(annualNetIncome, 2),
      };
    },
  },
  "cash-on-cash-return": {
    key: "cash-on-cash-return",
    title: "Calculator cash-on-cash return",
    slug: "calculator-cash-on-cash-return",
    categorySlug: "imobiliare",
    summary:
      "Compara fluxul anual de numerar cu banii proprii investiti intr-o proprietate pentru a estima randamentul cash-on-cash.",
    formulaName: "Cash-on-cash return",
    formulaExpression: "CoC = flux net anual / capital propriu investit",
    formulaDescription:
      "Calculatorul raporteaza fluxul net anual la banii proprii blocati in achizitie, renovare si costuri initiale.",
    howToSteps: [
      "Introdu fluxul net anual estimat dupa costuri.",
      "Introdu capitalul propriu investit in proiect.",
      "Citeste randamentul cash-on-cash si echivalentul lunar al fluxului.",
    ],
    inputs: [
      {
        name: "annualNetCashFlow",
        label: "Flux net anual",
        type: "number",
        unit: "lei/an",
        min: -100000000,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 18500,
      },
      {
        name: "cashInvested",
        label: "Capital propriu investit",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 170000,
      },
    ],
    outputs: [
      { name: "cashOnCashReturn", label: "Cash-on-cash return", unit: "%", decimals: 2 },
      { name: "monthlyCashFlow", label: "Flux net lunar", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const annualNetCashFlow = parseNumber(values.annualNetCashFlow);
      const cashInvested = Math.max(parseNumber(values.cashInvested), 0.01);
      return {
        cashOnCashReturn: round((annualNetCashFlow / cashInvested) * 100, 2),
        monthlyCashFlow: round(annualNetCashFlow / 12, 2),
      };
    },
  },
  "vacancy-loss": {
    key: "vacancy-loss",
    title: "Calculator pierdere din vacanta",
    slug: "calculator-pierdere-din-vacanta-la-inchiriere",
    categorySlug: "imobiliare",
    summary:
      "Estimeaza cat venit se pierde anual din lunile sau procentele de neocupare ale unei proprietati de inchiriat.",
    formulaName: "Pierdere din vacanta",
    formulaExpression:
      "Pierdere anuala = chirie anuala potentiala x rata de neocupare",
    formulaDescription:
      "Calculatorul transforma rata de neocupare intr-o pierdere anuala usor de comparat cu randamentul sau cu costurile fixe ale proprietatii.",
    howToSteps: [
      "Introdu chiria lunara potentiala.",
      "Introdu rata de neocupare estimata.",
      "Citeste pierderea anuala si chiria efectiv colectata.",
    ],
    inputs: [
      {
        name: "monthlyRent",
        label: "Chirie lunara potentiala",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 3200,
      },
      {
        name: "vacancyRate",
        label: "Rata de neocupare",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 8,
      },
    ],
    outputs: [
      {
        name: "annualVacancyLoss",
        label: "Pierdere anuala",
        unit: "lei/an",
        decimals: 2,
      },
      {
        name: "collectedAnnualRent",
        label: "Chirie anuala colectata",
        unit: "lei/an",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const monthlyRent = parseNumber(values.monthlyRent);
      const vacancyRate = parseNumber(values.vacancyRate);
      const annualPotentialRent = monthlyRent * 12;
      const annualVacancyLoss = annualPotentialRent * (vacancyRate / 100);
      return {
        annualVacancyLoss: round(annualVacancyLoss, 2),
        collectedAnnualRent: round(annualPotentialRent - annualVacancyLoss, 2),
      };
    },
  },
  "rent-increase": {
    key: "rent-increase",
    title: "Calculator crestere chirie",
    slug: "calculator-crestere-chirie",
    categorySlug: "imobiliare",
    summary:
      "Proiecteaza cum se schimba chiria lunara in timp cand aplici un ritm anual de crestere.",
    formulaName: "Crestere chirie",
    formulaExpression: "Chirie viitoare = chirie curenta x (1 + crestere)^ani",
    formulaDescription:
      "Calculatorul foloseste o crestere anuala compusa pentru a arata cum evolueaza chiria intr-un interval de timp ales.",
    howToSteps: [
      "Introdu chiria lunara curenta.",
      "Introdu cresterea anuala si numarul de ani.",
      "Citeste chiria lunara proiectata si cresterea absoluta.",
    ],
    inputs: [
      {
        name: "currentRent",
        label: "Chirie curenta",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 2800,
      },
      {
        name: "annualIncreasePercent",
        label: "Crestere anuala",
        type: "number",
        unit: "%",
        min: -50,
        max: 200,
        step: 0.1,
        required: true,
        defaultValue: 4,
      },
      {
        name: "years",
        label: "Ani",
        type: "number",
        unit: "ani",
        min: 1,
        max: 50,
        step: 1,
        required: true,
        defaultValue: 5,
      },
    ],
    outputs: [
      { name: "projectedRent", label: "Chirie proiectata", unit: "lei/luna", decimals: 2 },
      { name: "increaseAmount", label: "Crestere absoluta", unit: "lei/luna", decimals: 2 },
    ],
    compute: (values) => {
      const currentRent = parseNumber(values.currentRent);
      const annualIncreasePercent = parseNumber(values.annualIncreasePercent) / 100;
      const years = Math.max(parseNumber(values.years), 1);
      const projectedRent = currentRent * (1 + annualIncreasePercent) ** years;
      return {
        projectedRent: round(projectedRent, 2),
        increaseAmount: round(projectedRent - currentRent, 2),
      };
    },
  },
  "property-flip-margin": {
    key: "property-flip-margin",
    title: "Calculator marja flip imobiliar",
    slug: "calculator-marja-flip-imobiliar",
    categorySlug: "imobiliare",
    summary:
      "Compara costul total al unui proiect de revanzare cu pretul de iesire pentru a estima profitul si marja.",
    formulaName: "Marja flip imobiliar",
    formulaExpression: "Profit = pret vanzare - cost total; Marja = profit / pret vanzare",
    formulaDescription:
      "Calculatorul aduna pretul de achizitie, renovarea si costurile de detinere pentru a vedea ce ramane la vanzare.",
    howToSteps: [
      "Introdu pretul de achizitie, renovarea si costurile de detinere.",
      "Introdu pretul de vanzare estimat.",
      "Citeste costul total, profitul si marja proiectului.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Pret achizitie",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 400000,
      },
      {
        name: "renovationCost",
        label: "Cost renovare",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 70000,
      },
      {
        name: "holdingCosts",
        label: "Costuri detinere",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 18000,
      },
      {
        name: "salePrice",
        label: "Pret vanzare",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 560000,
      },
    ],
    outputs: [
      { name: "totalCost", label: "Cost total", unit: "lei", decimals: 2 },
      { name: "profit", label: "Profit estimat", unit: "lei", decimals: 2 },
      { name: "marginPercent", label: "Marja", unit: "%", decimals: 2 },
    ],
    compute: (values) => {
      const purchasePrice = parseNumber(values.purchasePrice);
      const renovationCost = parseNumber(values.renovationCost);
      const holdingCosts = parseNumber(values.holdingCosts);
      const salePrice = Math.max(parseNumber(values.salePrice), 0.01);
      const totalCost = purchasePrice + renovationCost + holdingCosts;
      const profit = salePrice - totalCost;
      return {
        totalCost: round(totalCost, 2),
        profit: round(profit, 2),
        marginPercent: round((profit / salePrice) * 100, 2),
      };
    },
  },
  "property-management-fee": {
    key: "property-management-fee",
    title: "Calculator cost administrare proprietate",
    slug: "calculator-cost-administrare-proprietate",
    categorySlug: "imobiliare",
    summary:
      "Estimeaza costul administrarii unei proprietati de inchiriat pornind de la chirie, comision si costurile fixe de operare.",
    formulaName: "Cost administrare proprietate",
    formulaExpression: "Cost administrare = chirie x comision + cost fix",
    formulaDescription:
      "Calculatorul aduna comisionul variabil aplicat la chirie cu costurile fixe de administrare pentru a estima costul anual.",
    howToSteps: [
      "Introdu chiria lunara estimata si procentul de administrare.",
      "Adauga eventualele costuri fixe lunare.",
      "Citeste costul lunar si anual al administrarii.",
    ],
    inputs: [
      {
        name: "monthlyRent",
        label: "Chirie lunara",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 3000,
      },
      {
        name: "managementPercent",
        label: "Comision administrare",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 8,
      },
      {
        name: "monthlyFixedAdmin",
        label: "Cost fix lunar",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 120,
      },
    ],
    outputs: [
      { name: "monthlyManagementCost", label: "Cost lunar", unit: "lei/luna", decimals: 2 },
      { name: "annualManagementCost", label: "Cost anual", unit: "lei/an", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyRent = parseNumber(values.monthlyRent);
      const managementPercent = parseNumber(values.managementPercent);
      const monthlyFixedAdmin = parseNumber(values.monthlyFixedAdmin);
      const monthlyManagementCost = monthlyRent * (managementPercent / 100) + monthlyFixedAdmin;
      return {
        monthlyManagementCost: round(monthlyManagementCost, 2),
        annualManagementCost: round(monthlyManagementCost * 12, 2),
      };
    },
  },
  "closing-cost-share": {
    key: "closing-cost-share",
    title: "Calculator pondere costuri inchidere",
    slug: "calculator-pondere-costuri-inchidere",
    categorySlug: "imobiliare",
    summary:
      "Arata ce pondere au costurile de inchidere in pretul proprietatii si cat capital total trebuie alocat la start.",
    formulaName: "Pondere costuri inchidere",
    formulaExpression:
      "Pondere = costuri inchidere / pret proprietate; total initial = pret + costuri",
    formulaDescription:
      "Calculatorul transforma costurile de inchidere intr-o pondere usor de comparat intre scenarii si arata capitalul initial total.",
    howToSteps: [
      "Introdu pretul proprietatii si costurile de inchidere estimate.",
      "Citeste ponderea lor in pret si suma totala alocata la start.",
      "Compara mai multe scenarii daca ai variante diferite de finantare sau tranzactie.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Pret proprietate",
        type: "number",
        unit: "lei",
        min: 0.01,
        max: 1000000000,
        step: 1,
        required: true,
        defaultValue: 480000,
      },
      {
        name: "closingCosts",
        label: "Costuri inchidere",
        type: "number",
        unit: "lei",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 22000,
      },
    ],
    outputs: [
      { name: "closingCostShare", label: "Pondere costuri", unit: "%", decimals: 2 },
      { name: "totalInitialCost", label: "Cost initial total", unit: "lei", decimals: 2 },
    ],
    compute: (values) => {
      const purchasePrice = Math.max(parseNumber(values.purchasePrice), 0.01);
      const closingCosts = parseNumber(values.closingCosts);
      return {
        closingCostShare: round((closingCosts / purchasePrice) * 100, 2),
        totalInitialCost: round(purchasePrice + closingCosts, 2),
      };
    },
  },
  "room-rental-income": {
    key: "room-rental-income",
    title: "Calculator venit inchiriere pe camera",
    slug: "calculator-venit-inchiriere-pe-camera",
    categorySlug: "imobiliare",
    summary:
      "Estimeaza venitul lunar si anual cand inchiriezi pe camera, pornind de la numarul de camere, chiria per camera si gradul de ocupare.",
    formulaName: "Venit inchiriere pe camera",
    formulaExpression:
      "Venit lunar = camere x chirie/camera x ocupare; venit anual = venit lunar x 12",
    formulaDescription:
      "Calculatorul foloseste numarul de camere si gradul de ocupare pentru a aproxima venitul posibil din inchirierea pe camera.",
    howToSteps: [
      "Introdu numarul de camere inchiriate si chiria lunara per camera.",
      "Introdu gradul de ocupare mediu.",
      "Citeste venitul lunar si anual estimat.",
    ],
    inputs: [
      {
        name: "roomsRented",
        label: "Camere inchiriate",
        type: "number",
        unit: "camere",
        min: 1,
        max: 30,
        step: 1,
        required: true,
        defaultValue: 3,
      },
      {
        name: "rentPerRoom",
        label: "Chirie / camera",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 1100,
      },
      {
        name: "occupancyPercent",
        label: "Grad ocupare",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 92,
      },
    ],
    outputs: [
      { name: "monthlyIncome", label: "Venit lunar", unit: "lei/luna", decimals: 2 },
      { name: "annualIncome", label: "Venit anual", unit: "lei/an", decimals: 2 },
    ],
    compute: (values) => {
      const roomsRented = Math.max(parseNumber(values.roomsRented), 1);
      const rentPerRoom = parseNumber(values.rentPerRoom);
      const occupancyPercent = parseNumber(values.occupancyPercent) / 100;
      const monthlyIncome = roomsRented * rentPerRoom * occupancyPercent;
      return {
        monthlyIncome: round(monthlyIncome, 2),
        annualIncome: round(monthlyIncome * 12, 2),
      };
    },
  },
  "service-charge-budget": {
    key: "service-charge-budget",
    title: "Calculator costuri recurente proprietate",
    slug: "calculator-costuri-recurente-proprietate",
    categorySlug: "imobiliare",
    summary:
      "Aduna administrarea, reparatiile si asigurarea pentru a vedea costul anual recurent al unei proprietati.",
    formulaName: "Costuri recurente proprietate",
    formulaExpression:
      "Cost anual = administrare lunara x 12 + reparatii anuale + asigurare anuala",
    formulaDescription:
      "Calculatorul este util pentru bugetarea costurilor recurente atunci cand compari randamentul sau presiunea pe cash-flow.",
    howToSteps: [
      "Introdu costul lunar de administrare.",
      "Adauga reparatiile si asigurarea anuala.",
      "Citeste costul anual total si media lunara aferenta.",
    ],
    inputs: [
      {
        name: "monthlyServiceCharge",
        label: "Administrare lunara",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 1000000,
        step: 1,
        required: true,
        defaultValue: 260,
      },
      {
        name: "annualRepairs",
        label: "Reparatii anuale",
        type: "number",
        unit: "lei/an",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 3500,
      },
      {
        name: "annualInsurance",
        label: "Asigurare anuala",
        type: "number",
        unit: "lei/an",
        min: 0,
        max: 100000000,
        step: 1,
        required: true,
        defaultValue: 850,
      },
    ],
    outputs: [
      { name: "annualTotal", label: "Cost anual", unit: "lei/an", decimals: 2 },
      { name: "monthlyAverage", label: "Medie lunara", unit: "lei/luna", decimals: 2 },
    ],
    compute: (values) => {
      const monthlyServiceCharge = parseNumber(values.monthlyServiceCharge);
      const annualRepairs = parseNumber(values.annualRepairs);
      const annualInsurance = parseNumber(values.annualInsurance);
      const annualTotal = monthlyServiceCharge * 12 + annualRepairs + annualInsurance;
      return {
        annualTotal: round(annualTotal, 2),
        monthlyAverage: round(annualTotal / 12, 2),
      };
    },
  },
  "rental-break-even-occupancy": {
    key: "rental-break-even-occupancy",
    title: "Calculator grad ocupare break-even",
    slug: "calculator-grad-ocupare-break-even",
    categorySlug: "imobiliare",
    summary:
      "Arata ce grad minim de ocupare iti trebuie ca sa acoperi costurile fixe lunare ale unei proprietati de inchiriat.",
    formulaName: "Grad ocupare break-even",
    formulaExpression:
      "Ocupare break-even = costuri fixe lunare / venit potential lunar",
    formulaDescription:
      "Calculatorul transforma costurile fixe si chiria potentiala intr-un prag minim de ocupare util pentru scenarii prudente.",
    howToSteps: [
      "Introdu costurile fixe lunare ale proprietatii.",
      "Introdu venitul lunar potential la ocupare completa.",
      "Citeste pragul minim de ocupare si bufferul ramas la ocupare completa.",
    ],
    inputs: [
      {
        name: "monthlyFixedCosts",
        label: "Costuri fixe lunare",
        type: "number",
        unit: "lei/luna",
        min: 0,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 2400,
      },
      {
        name: "monthlyPotentialRent",
        label: "Venit potential lunar",
        type: "number",
        unit: "lei/luna",
        min: 0.01,
        max: 10000000,
        step: 1,
        required: true,
        defaultValue: 3600,
      },
    ],
    outputs: [
      {
        name: "breakEvenOccupancyPercent",
        label: "Ocupare break-even",
        unit: "%",
        decimals: 2,
      },
      {
        name: "monthlyBufferAtFullOccupancy",
        label: "Buffer la ocupare completa",
        unit: "lei/luna",
        decimals: 2,
      },
    ],
    compute: (values) => {
      const monthlyFixedCosts = parseNumber(values.monthlyFixedCosts);
      const monthlyPotentialRent = Math.max(parseNumber(values.monthlyPotentialRent), 0.01);
      return {
        breakEvenOccupancyPercent: round(
          (monthlyFixedCosts / monthlyPotentialRent) * 100,
          2
        ),
        monthlyBufferAtFullOccupancy: round(
          monthlyPotentialRent - monthlyFixedCosts,
          2
        ),
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
