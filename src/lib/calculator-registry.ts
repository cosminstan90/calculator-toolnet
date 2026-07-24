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
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Calculează indicele de masă corporală pornind de la greutate și înălțime.",
    formulaName: "Indicele de masă corporală",
    formulaExpression: "BMI = greutate (kg) / [înălțime (m)]^2",
    formulaDescription:
      "Indicele de masă corporală împarte greutatea exprimată în kilograme la pătratul înălțimii exprimate în metri.",
    howToSteps: [
      "Introdu greutatea în kilograme.",
      "Introdu înălțimea în centimetri.",
      "Citește BMI-ul calculat automat și compară-l cu intervalele standard.",
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
        label: "Înălțime",
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
    title: "Calculator metabolism bazal (BMR)",
    slug: "calculator-metabolism-bazal",
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Estimează metabolismul bazal prin formula Mifflin-St Jeor.",
    formulaName: "Mifflin-St Jeor",
    formulaExpression:
      "BMR bărbați = 10W + 6.25H - 5A + 5; BMR femei = 10W + 6.25H - 5A - 161",
    formulaDescription:
      "Formula Mifflin-St Jeor folosește greutatea, înălțimea, vârsta și sexul pentru a estima necesarul energetic în repaus.",
    howToSteps: [
      "Selectează sexul biologic pentru formula de bază.",
      "Completează vârsta, greutatea și înălțimea.",
      "Rezultatul arată câte calorii ar consuma corpul în repaus pe parcursul unei zile.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Bărbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "age",
        label: "Vârsta",
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
        label: "Înălțime",
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
    title: "Calculator necesar caloric zilnic (TDEE)",
    slug: "calculator-necesar-caloric-zilnic",
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Combină BMR-ul cu activitatea zilnică pentru a estima caloriile de menținere.",
    formulaName: "TDEE = BMR x factor de activitate",
    formulaExpression: "TDEE = BMR x nivel de activitate",
    formulaDescription:
      "Total Daily Energy Expenditure înmulțește metabolismul bazal cu un factor care reflectă activitatea ta obișnuită.",
    howToSteps: [
      "Introdu aceleași date de bază folosite pentru BMR.",
      "Alege nivelul de activitate care descrie media săptămânii.",
      "Rezultatul indică aportul caloric orientativ pentru menținere.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Bărbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "age",
        label: "Vârsta",
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
        label: "Înălțime",
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
          { label: "Ușor activ", value: "light" },
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
    title: "Calculator calorii pentru slăbire",
    slug: "calculator-calorii-slabire",
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Transformă TDEE-ul într-o țintă zilnică de calorii pentru deficit controlat.",
    formulaName: "Target caloric pentru deficit",
    formulaExpression: "Calorii țintă = TDEE x factor deficit",
    formulaDescription:
      "Poți porni de la TDEE și aplica un factor orientativ în funcție de viteză de slăbire dorită.",
    howToSteps: [
      "Introdu TDEE-ul estimat sau rezultat din calculatorul dedicat.",
      "Alege ritmul dorit pentru deficit.",
      "Rezultatul îți arată aportul caloric și deficitul zilnic aproximativ.",
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
        label: "Calorii țintă",
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
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Estimează aportul zilnic de proteine pe baza greutatii și a obiectivului.",
    formulaName: "Proteine zilnice",
    formulaExpression: "Proteine = greutate x factor în funcție de obiectiv",
    formulaDescription:
      "Aportul de proteine este de obicei exprimat în grame per kilogram corp, iar factorul depinde de obiectivul principal.",
    howToSteps: [
      "Introdu greutatea actuală.",
      "Alege obiectivul principal.",
      "Citește rezultatul în grame pe zi și distribuie-l pe mesele principale.",
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
          { label: "Menținere", value: "maintenance" },
          { label: "Slăbire", value: "cut" },
          { label: "Creștere musculară", value: "gain" },
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
    title: "Calculator procent grăsime corporală",
    slug: "calculator-grasime-corporala",
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Estimează procentul de grăsime corporală folosind formula US Navy.",
    formulaName: "US Navy Body Fat",
    formulaExpression:
      "Bărbați: 495 / (1.0324 - 0.19077 * log10(talie-gât) + 0.15456 * log10(înălțime)) - 450; Femei: 495 / (1.29579 - 0.35004 * log10(talie+sold-gât) + 0.22100 * log10(înălțime)) - 450",
    formulaDescription:
      "Formula US Navy folosește circumferințe corporale și înălțimea pentru a estima procentul de grăsime corporală.",
    howToSteps: [
      "Selectează sexul.",
      "Introdu înălțimea și circumferințele cerute.",
      "Citește estimarea procentului de grăsime corporală.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Bărbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "heightCm",
        label: "Înălțime",
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
        label: "Circumferința gât",
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
        label: "Circumferința talie",
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
        label: "Circumferința sold",
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
        label: "Grăsime corporală estimată",
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
    title: "Calculator greutate ideală",
    slug: "calculator-greutate-ideala",
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Estimează greutatea ideală folosind formula Devine.",
    formulaName: "Formula Devine",
    formulaExpression:
      "Bărbați: 50 + 2.3 x (înălțime în inch - 60); Femei: 45.5 + 2.3 x (înălțime în inch - 60)",
    formulaDescription:
      "Formula Devine este folosită frecvent ca reper orientativ pentru greutatea ideală în funcție de înălțime și sex.",
    howToSteps: [
      "Selectează sexul.",
      "Introdu înălțimea în centimetri.",
      "Citește greutatea ideală estimată.",
    ],
    inputs: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        defaultValue: "male",
        options: [
          { label: "Bărbat", value: "male" },
          { label: "Femeie", value: "female" },
        ],
      },
      {
        name: "heightCm",
        label: "Înălțime",
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
        label: "Greutate ideală estimată",
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
    title: "Calculator aport zilnic de apă",
    slug: "calculator-aport-zilnic-apa",
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Estimează aportul zilnic de apă în funcție de greutate.",
    formulaName: "Necesar orientativ de apă",
    formulaExpression: "Apa (ml/zi) = greutate (kg) x 35",
    formulaDescription:
      "O regulă simplă și frecvent folosită este 35 ml de apă pe kilogram corp, ajustată ulterior după climă și activitate.",
    howToSteps: [
      "Introdu greutatea actuală.",
      "Calculatorul estimează necesarul zilnic în mililitri și litri.",
      "Ajustează după activitate, temperatură și particularități personale.",
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
    title: "Calculator repetare maximă (1RM)",
    slug: "calculator-repetare-maxima-1rm",
    categorySlug: "nutritie-si-antrenament",
    summary:
      "Estimează repetarea maximă folosind formula Epley.",
    formulaName: "Formula Epley",
    formulaExpression: "1RM = greutate x (1 + repetări / 30)",
    formulaDescription:
      "Formula Epley este una dintre cele mai simple metode pentru a estima greutatea maximă pe o singură repetare pornind de la o serie submaximală.",
    howToSteps: [
      "Introdu greutatea ridicată.",
      "Introdu numărul de repetări realizate.",
      "Citește 1RM-ul estimat și procentele utile pentru antrenament.",
    ],
    inputs: [
      {
        name: "weightKg",
        label: "Greutate ridicată",
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
        label: "Repetări",
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
      "Calculează consumul mediu în litri la 100 km.",
    formulaName: "Consum mediu auto",
    formulaExpression: "Consum (l/100 km) = litri consumați / kilometri x 100",
    formulaDescription:
      "Formula standard pentru consumul mediu pornește de la litrii consumați și distanță parcursă.",
    howToSteps: [
      "Introdu distanță parcursă.",
      "Introdu litrii consumați pe acea distanță.",
      "Rezultatul afișează consumul mediu raportat la 100 km.",
    ],
    inputs: [
      {
        name: "distanceKm",
        label: "Distanță",
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
    title: "Calculator cost călătorie auto",
    slug: "calculator-cost-calatorie-auto",
    categorySlug: "auto",
    summary:
      "Estimează litrii necesari și costul carburantului pentru un drum.",
    formulaName: "Cost călătorie auto",
    formulaExpression:
      "Litri necesari = distanță x consum / 100; cost = litri necesari x preț/litru",
    formulaDescription:
      "Pornești de la consumul mediu exprimat în l/100 km și de la prețul carburantului pentru a estima costul unui traseu.",
    howToSteps: [
      "Introdu distanță călătoriei.",
      "Completează consumul mediu al mașinii.",
      "Adaugă prețul pe litru și citește costul estimat.",
    ],
    inputs: [
      {
        name: "distanceKm",
        label: "Distanță",
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
        label: "Preț carburant",
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
      "Află cât te costă carburantul pe fiecare kilometru parcurs.",
    formulaName: "Cost pe kilometru",
    formulaExpression: "Cost/km = (consum l/100 km x preț/litru) / 100",
    formulaDescription:
      "Formula transformă consumul mediu și prețul carburantului într-un cost mediu pe kilometru.",
    howToSteps: [
      "Introdu consumul mediu.",
      "Introdu prețul carburantului pe litru.",
      "Citește costul estimat pentru 1 km și 100 km.",
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
        label: "Preț carburant",
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
    title: "Calculator timp călătorie",
    slug: "calculator-timp-calatorie",
    categorySlug: "auto",
    summary:
      "Estimează durata unui drum în funcție de distanță și viteză medie.",
    formulaName: "Timp = distanță / viteză",
    formulaExpression: "Timp (ore) = distanță (km) / viteză medie (km/h)",
    formulaDescription:
      "Durata unei călătorii se estimează împărțind distanță la viteză medie realistă.",
    howToSteps: [
      "Introdu distanță traseului.",
      "Introdu viteză medie estimată.",
      "Citește durata în ore și minute.",
    ],
    inputs: [
      {
        name: "distanceKm",
        label: "Distanță",
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
        label: "Viteză medie",
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
    title: "Convertor KW în CP",
    slug: "convertor-kw-in-cp",
    categorySlug: "energie",
    summary:
      "Convertește kilowați în cai putere și invers.",
    formulaName: "Conversie KW <-> CP",
    formulaExpression: "CP = kW x 1.35962; kW = CP / 1.35962",
    formulaDescription:
      "Conversia dintre kilowați și cai putere folosește un factor fix de aproximativ 1.35962.",
    howToSteps: [
      "Alege direcția conversiei.",
      "Introdu valoarea inițială.",
      "Citește imediat valoarea convertită.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Direcția conversiei",
        type: "select",
        required: true,
        defaultValue: "kw-to-cp",
        options: [
          { label: "kW în CP", value: "kw-to-cp" },
          { label: "CP în kW", value: "cp-to-kw" },
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
      "Estimează consumul lunar și costul energiei electrice.",
    formulaName: "Cost consum electric",
    formulaExpression:
      "kWh/zi = (W / 1000) x ore; cost = kWh x preț pe kWh",
    formulaDescription:
      "Pornești de la puterea aparatului, durata de funcționare și prețul energiei pentru a estima costuri lunare și anuale.",
    howToSteps: [
      "Introdu puterea aparatului în wați.",
      "Completează numărul de ore de utilizare pe zi.",
      "Adaugă prețul pe kWh și citește consumul lunar și costul estimat.",
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
        label: "Preț energie",
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
    title: "Convertor amperi în wați",
    slug: "convertor-amperi-in-wati",
    categorySlug: "energie",
    summary:
      "Convertește amperi în wați pornind de la tensiune.",
    formulaName: "Putere electrică",
    formulaExpression: "W = A x V",
    formulaDescription:
      "În curent continuu sau în estimari simple, puterea în wați este produsul dintre intensitate și tensiune.",
    howToSteps: [
      "Introdu amperii.",
      "Introdu tensiunea în volti.",
      "Citește puterea rezultată în wați și kilowați.",
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
    title: "Calculator W în kWh",
    slug: "calculator-wati-in-kwh",
    categorySlug: "energie",
    summary:
      "Transformă puterea în wați și timpul de funcționare în consum energetic.",
    formulaName: "Consum energetic",
    formulaExpression: "kWh = (W / 1000) x ore",
    formulaDescription:
      "Pentru a estima consumul energetic, puterea în wați se convertește în kilowați și se înmulțește cu numărul de ore.",
    howToSteps: [
      "Introdu puterea aparatului în wați.",
      "Introdu numărul de ore de funcționare.",
      "Citește consumul rezultat în kWh.",
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
        label: "Timp de funcționare",
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
    title: "Convertor kg în lb",
    slug: "convertor-kg-in-lb",
    categorySlug: "conversii",
    summary:
      "Convertește kilograme în livre și invers.",
    formulaName: "Conversie masă",
    formulaExpression: "lb = kg x 2.20462; kg = lb / 2.20462",
    formulaDescription:
      "Conversia dintre kilograme și livre folosește factorul fix 2.20462.",
    howToSteps: [
      "Alege sensul conversiei.",
      "Introdu valoarea inițială.",
      "Citește rezultatul convertit automat.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Direcția conversiei",
        type: "select",
        required: true,
        defaultValue: "kg-to-lb",
        options: [
          { label: "kg în lb", value: "kg-to-lb" },
          { label: "lb în kg", value: "lb-to-kg" },
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
    title: "Convertor cm în inch",
    slug: "convertor-cm-in-inch",
    categorySlug: "conversii",
    summary:
      "Convertește centimetri în inch și invers.",
    formulaName: "Conversie lungime",
    formulaExpression: "inch = cm / 2.54; cm = inch x 2.54",
    formulaDescription:
      "Conversia dintre centimetri și inch folosește raportul fix de 2.54 centimetri pentru un inch.",
    howToSteps: [
      "Alege sensul conversiei.",
      "Introdu valoarea inițială.",
      "Citește rezultatul convertit automat.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Direcția conversiei",
        type: "select",
        required: true,
        defaultValue: "cm-to-inch",
        options: [
          { label: "cm în inch", value: "cm-to-inch" },
          { label: "inch în cm", value: "inch-to-cm" },
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
      "Convertește temperaturile din Celsius în Fahrenheit și invers.",
    formulaName: "Conversie temperatură",
    formulaExpression: "F = C x 9/5 + 32; C = (F - 32) x 5/9",
    formulaDescription:
      "Cele două formule standard convertesc temperaturile între cele mai folosite scari în contexte internaționale.",
    howToSteps: [
      "Alege sensul conversiei.",
      "Introdu temperatură inițială.",
      "Citește rezultatul convertit automat.",
    ],
    inputs: [
      {
        name: "mode",
        label: "Direcția conversiei",
        type: "select",
        required: true,
        defaultValue: "c-to-f",
        options: [
          { label: "Celsius în Fahrenheit", value: "c-to-f" },
          { label: "Fahrenheit în Celsius", value: "f-to-c" },
        ],
      },
      {
        name: "value",
        label: "Temperatură",
        type: "number",
        step: 0.1,
        required: true,
        defaultValue: 25,
      },
    ],
    outputs: [
      {
        name: "convertedValue",
        label: "Temperatură convertită",
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
    title: "Calculator procent din număr",
    slug: "calculator-procent-din-numar",
    categorySlug: "finante",
    summary:
      "Calculează rapid cât înseamnă un procent dintr-o valoare dată.",
    formulaName: "Procent din număr",
    formulaExpression: "Rezultat = valoare x procent / 100",
    formulaDescription:
      "Formula standard pentru procent din număr înmulțește valoarea de bază cu procentul și împarte rezultatul la 100.",
    howToSteps: [
      "Introdu valoarea de bază.",
      "Introdu procentul pe care vrei să îl aplici.",
      "Citește imediat suma rezultată.",
    ],
    inputs: [
      {
        name: "baseValue",
        label: "Valoare de bază",
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
    title: "Calculator diferență procentuală",
    slug: "calculator-diferenta-procentuala",
    categorySlug: "finante",
    summary:
      "Arată cu cât a crescut sau a scăzut o valoare în procente între două momente.",
    formulaName: "Diferență procentuală",
    formulaExpression: "Variație (%) = (valoare nouă - valoare veche) / valoare veche x 100",
    formulaDescription:
      "Diferență procentuală compară valoarea nouă cu cea inițială și arată ritmul de creștere sau scădere în procente.",
    howToSteps: [
      "Introdu valoarea inițială.",
      "Introdu valoarea nouă.",
      "Citește diferență absolută și variația procentuală.",
    ],
    inputs: [
      {
        name: "initialValue",
        label: "Valoare inițială",
        type: "number",
        min: 0.01,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 100,
      },
      {
        name: "newValue",
        label: "Valoare nouă",
        type: "number",
        min: 0,
        max: 1000000000,
        step: 0.01,
        required: true,
        defaultValue: 125,
      },
    ],
    outputs: [
      { name: "absoluteChange", label: "Diferență absolută", decimals: 2 },
      { name: "percentageChange", label: "Diferență procentuală", unit: "%", decimals: 2 },
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
      "Află valoarea inițială atunci când știi rezultatul final și procentul de creștere sau reducere.",
    formulaName: "Procent invers",
    formulaExpression:
      "Valoare inițială = valoare finală / (1 +/- procent / 100)",
    formulaDescription:
      "Calculatorul inversează o creștere sau o reducere procentuală pentru a estima valoarea de pornire.",
    howToSteps: [
      "Alege dacă procentul a fost aplicat ca reducere sau ca majorare.",
      "Introdu valoarea finală și procentul folosit.",
      "Citește valoarea inițială estimată.",
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
        label: "Valoare finală",
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
      { name: "initialValue", label: "Valoare inițială", decimals: 2 },
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
      "Calculează valoarea reducerii și prețul final după aplicarea unui discount procentual.",
    formulaName: "Discount procentual",
    formulaExpression: "Reducere = preț initial x procent / 100; preț final = preț initial - reducere",
    formulaDescription:
      "Discountul procentual pornește de la prețul initial și scade procentul selectat pentru a obține reducerea și prețul final.",
    howToSteps: [
      "Introdu prețul initial.",
      "Introdu procentul de discount.",
      "Citește reducerea și prețul final.",
    ],
    inputs: [
      {
        name: "initialPrice",
        label: "Preț initial",
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
      { name: "finalPrice", label: "Preț final", unit: "lei", decimals: 2 },
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
      "Adaugă TVA peste o sumă netă și afișează separat baza, TVA-ul și totalul.",
    formulaName: "TVA adaugat peste net",
    formulaExpression: "TVA = baza netă x cota TVA / 100; total = baza netă + TVA",
    formulaDescription:
      "Calculatorul TVA pornește de la suma netă și aplică cota de TVA pentru a obține valoarea taxei și totalul cu TVA inclus.",
    howToSteps: [
      "Introdu suma netă.",
      "Alege sau introdu cota TVA.",
      "Citește TVA-ul și suma totală cu TVA.",
    ],
    inputs: [
      {
        name: "netAmount",
        label: "Suma fără TVA",
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
      "Scoate TVA-ul dintr-o sumă brută și afișează baza netă și taxa corespunzătoare.",
    formulaName: "TVA scos din brut",
    formulaExpression: "Baza netă = suma brută / (1 + cota TVA / 100); TVA = suma brută - baza netă",
    formulaDescription:
      "Calculatorul TVA invers pornește de la totalul cu TVA inclus și separă baza netă de componentă fiscală.",
    howToSteps: [
      "Introdu suma cu TVA inclus.",
      "Alege sau introdu cota TVA.",
      "Citește baza netă și valoarea TVA-ului inclus.",
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
      { name: "netAmount", label: "Suma fără TVA", unit: "lei", decimals: 2 },
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
    title: "Calculator dobânda compusă",
    slug: "calculator-dobanda-compusa",
    categorySlug: "finante",
    summary:
      "Estimează valoarea viitoare a unei sume investite cu dobânda compusă.",
    formulaName: "Dobânda compusă",
    formulaExpression: "FV = principal x (1 + rata / capitalizări)^ (capitalizări x ani)",
    formulaDescription:
      "Dobânda compusă crește capitalul initial prin reinvestirea câștigurilor la fiecare perioada de capitalizare.",
    howToSteps: [
      "Introdu suma inițială.",
      "Introdu rata anuală, numărul de ani și frecvența capitalizării.",
      "Citește valoarea finală și câștigul total.",
    ],
    inputs: [
      {
        name: "principal",
        label: "Suma inițială",
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
        label: "Dobânda anuală",
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
        label: "Capitalizări pe an",
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
      { name: "interestEarned", label: "Dobânda acumulată", unit: "lei", decimals: 2 },
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
      "Estimează cât se adună în timp din economii lunare recurente, cu sau fără dobânda.",
    formulaName: "Valoare viitoare a unei anuități",
    formulaExpression:
      "FV = contribuție lunară x [((1 + rata lunară)^luni - 1) / rata lunară]",
    formulaDescription:
      "Economiile lunare recurente pot fi proiectate în timp folosind rata lunară a dobânzii și numărul total de luni.",
    howToSteps: [
      "Introdu suma economisită lunar.",
      "Introdu dobânda anuală și numărul de ani.",
      "Citește totalul acumulat și contribuția proprie.",
    ],
    inputs: [
      {
        name: "monthlyContribution",
        label: "Economisire lunară",
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
        label: "Dobânda anuală",
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
      { name: "totalContributions", label: "Contribuții proprii", unit: "lei", decimals: 2 },
      { name: "interestEarned", label: "Dobânda acumulată", unit: "lei", decimals: 2 },
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
      "Arată câți bani trebuie să pui lunar pentru a atinge o țintă financiară într-un anumit termen.",
    formulaName: "Contribuție lunară pentru obiectiv",
    formulaExpression:
      "Contribuție = țintă x rata lunară / ((1 + rata lunară)^luni - 1)",
    formulaDescription:
      "Calculatorul inversează formula valorii viitoare pentru a estima economisirea lunară necesară către o țintă finală.",
    howToSteps: [
      "Introdu suma pe care vrei să o strângi.",
      "Introdu dobânda anuală și perioada.",
      "Citește contribuția lunară necesară.",
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
        label: "Dobânda anuală",
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
      { name: "monthlyContribution", label: "Economisire lunară necesară", unit: "lei", decimals: 2 },
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
      "Estimează rata lunară, costul total și dobânda totală pentru un credit cu rambursare în rate egale.",
    formulaName: "Rata lunară anuitate",
    formulaExpression:
      "Rata = credit x rata lunară / (1 - (1 + rata lunară)^-luni)",
    formulaDescription:
      "Pentru creditele cu rate egale, rata lunară se calculează pornind de la suma împrumutată, dobânda anuală și numărul total de luni.",
    howToSteps: [
      "Introdu suma împrumutată.",
      "Introdu dobânda anuală și perioada creditului.",
      "Citește rata lunară, costul total și dobânda plătită.",
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
        label: "Dobânda anuală",
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
      { name: "monthlyPayment", label: "Rata lunară", unit: "lei", decimals: 2 },
      { name: "totalCost", label: "Cost total", unit: "lei", decimals: 2 },
      { name: "totalInterest", label: "Dobânda totală", unit: "lei", decimals: 2 },
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
    title: "Calculator suprafață cameră",
    slug: "calculator-suprafata-camera",
    categorySlug: "constructii",
    summary:
      "Calculează suprafață și perimetrul unei camere pornind de la lungime și lățime.",
    formulaName: "Suprafață și perimetru dreptunghi",
    formulaExpression: "Suprafață = lungime x lățime; Perimetru = 2 x (lungime + lățime)",
    formulaDescription:
      "Formula standard pentru o cameră dreptunghiulară folosește lungimea și lățimea pentru a estima suprafață utilă și perimetrul.",
    howToSteps: [
      "Introdu lungimea camerei în metri.",
      "Introdu lățimea camerei în metri.",
      "Citește suprafață și perimetrul rezultate.",
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
        label: "Lățime",
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
      { name: "areaSqm", label: "Suprafață", unit: "mp", decimals: 2 },
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
      "Estimează volumul de beton necesar pentru fundații, plăci sau alte turnări simple.",
    formulaName: "Volum dreptunghiular",
    formulaExpression: "Volum = lungime x lățime x grosime",
    formulaDescription:
      "Volumul de beton pentru o formă simplă se estimează înmulțind lungimea și lățimea în metri cu grosimea exprimată în metri.",
    howToSteps: [
      "Introdu lungimea și lățimea zonei în metri.",
      "Introdu grosimea stratului în centimetri.",
      "Citește volumul rezultat în metri cubi și litri.",
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
        label: "Lățime",
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
      "Estimează câtă vopsea îți trebuie în funcție de suprafață, numărul de straturi și acoperirea declarată.",
    formulaName: "Necesar vopsea",
    formulaExpression: "Litri necesari = (suprafață x straturi) / acoperire pe litru",
    formulaDescription:
      "Necesarul de vopsea se estimează împărțind suprafață totală ajustată cu numărul de straturi la acoperirea declarată de produs.",
    howToSteps: [
      "Introdu suprafață de vopsit în metri pătrați.",
      "Alege câte straturi vrei să aplici și acoperirea produsului.",
      "Citește litrii necesari și numărul estimat de găleți de 10 litri.",
    ],
    inputs: [
      {
        name: "areaSqm",
        label: "Suprafață",
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
        label: "Număr straturi",
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
      { name: "litersNeeded", label: "Vopsea necesară", unit: "l", decimals: 2 },
      { name: "buckets10L", label: "Găleți de 10 l", decimals: 0 },
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
    title: "Calculator necesar gresie și faianță",
    slug: "calculator-necesar-gresie-faianta",
    categorySlug: "constructii",
    summary:
      "Estimează suprafață cu pierderi și numărul de cutii pentru gresie sau faianță.",
    formulaName: "Necesar finisaj cu pierderi",
    formulaExpression: "Suprafață necesară = suprafață x (1 + pierderi); cutii = suprafață necesară / acoperire cutie",
    formulaDescription:
      "Necesarul de gresie sau faianță se estimează adăugând un procent de pierderi peste suprafață utilă și împărțind apoi la acoperirea unei cutii.",
    howToSteps: [
      "Introdu suprafață totală de acoperit.",
      "Alege procentul de pierderi și acoperirea unei cutii.",
      "Citește suprafață ajustată și numărul de cutii necesare.",
    ],
    inputs: [
      {
        name: "areaSqm",
        label: "Suprafață",
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
      { name: "requiredAreaSqm", label: "Suprafață ajustată", unit: "mp", decimals: 2 },
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
      "Estimează numărul de pachete de parchet necesare pentru o cameră sau o zonă de lucru.",
    formulaName: "Necesar parchet cu rezervă",
    formulaExpression: "Suprafață necesară = suprafață x (1 + rezervă); pachete = suprafață necesară / acoperire pachet",
    formulaDescription:
      "Necesarul de parchet se calculează pe baza suprafeței, a rezervei pentru taieturi și a acoperirii declarate pe pachet.",
    howToSteps: [
      "Introdu suprafață de acoperit.",
      "Introdu procentul de rezervă și acoperirea pe pachet.",
      "Citește suprafață ajustată și numărul de pachete necesare.",
    ],
    inputs: [
      {
        name: "areaSqm",
        label: "Suprafață",
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
        label: "Rezervă pentru taieturi",
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
      { name: "requiredAreaSqm", label: "Suprafață ajustată", unit: "mp", decimals: 2 },
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
    title: "Calculator cost rețetă (food cost)",
    slug: "calculator-cost-reteta",
    categorySlug: "afaceri",
    summary:
      "Calculează food cost-ul și profitul brut pe porție pornind de la costul ingredientelor și prețul de vânzare.",
    formulaName: "Cost rețetă",
    formulaExpression: "Cost rețetă (%) = cost ingrediente / preț vânzare x 100",
    formulaDescription:
      "Costul rețetei raportează costul ingredientelor la prețul de vânzare pentru a arăta ce pondere consuma materia prima din prețul final.",
    howToSteps: [
      "Introdu costul ingredientelor pentru o porție.",
      "Introdu prețul de vânzare al portiei.",
      "Citește procentul costului de rețetă și profitul brut rezultat.",
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
        label: "Preț de vânzare",
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
    categorySlug: "afaceri",
    summary:
      "Calculează marja de profit și profitul brut pornind de la cost și prețul de vânzare.",
    formulaName: "Marja profit",
    formulaExpression: "Marja (%) = (preț vânzare - cost) / preț vânzare x 100",
    formulaDescription:
      "Marja de profit arată ce procent din prețul de vânzare rămâne după ce scazi costul direct.",
    howToSteps: [
      "Introdu costul produsului sau serviciului.",
      "Introdu prețul de vânzare.",
      "Citește profitul brut și marja rezultată.",
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
        label: "Preț de vânzare",
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
    title: "Calculator adaos comercial",
    slug: "calculator-adaos-comercial",
    categorySlug: "afaceri",
    summary:
      "Calculează markup-ul comercial pornind de la cost și prețul de vânzare.",
    formulaName: "Markup comercial",
    formulaExpression: "Markup (%) = (preț vânzare - cost) / cost x 100",
    formulaDescription:
      "Markup-ul arată cu cât ai crescut costul de bază pentru a ajunge la prețul de vânzare.",
    howToSteps: [
      "Introdu costul direct.",
      "Introdu prețul de vânzare.",
      "Citește markup-ul și profitul brut rezultat.",
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
        label: "Preț de vânzare",
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
    title: "Calculator prag rentabilitate",
    slug: "calculator-prag-rentabilitate",
    categorySlug: "afaceri",
    summary:
      "Estimează pragul de rentabilitate în unități pornind de la costuri fixe, cost variabil și preț de vânzare.",
    formulaName: "Prag de rentabilitate",
    formulaExpression: "Prag rentabilitate unități = costuri fixe / (preț de vânzare - cost variabil/unitate)",
    formulaDescription:
      "Pragul de rentabilitate arată câte unități trebuie să vinzi până când acoperi costurile fixe și nu mai ești pe pierdere.",
    howToSteps: [
      "Introdu costurile fixe totale.",
      "Introdu prețul de vânzare și costul variabil per unitate.",
      "Citește contribuția pe unitate și pragul de rentabilitate estimat.",
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
        label: "Preț de vânzare/unitate",
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
      { name: "contributionPerUnit", label: "Contribuție/unitate", unit: "lei", decimals: 2 },
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
    categorySlug: "afaceri",
    summary:
      "Calculează rentabilitatea unei investiții pornind de la costul investiției și câștigul obținut.",
    formulaName: "Return on Investment",
    formulaExpression: "ROI (%) = (câștig net / investiție) x 100",
    formulaDescription:
      "ROI-ul compară câștigul net ramas după recuperarea investiției cu suma investită initial.",
    howToSteps: [
      "Introdu costul investiției.",
      "Introdu încasările sau valoarea obținută.",
      "Citește profitul net și ROI-ul rezultat.",
    ],
    inputs: [
      {
        name: "investmentCost",
        label: "Investiție",
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
        label: "Valoare obținută",
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
    title: "Calculator creștere salarială",
    slug: "calculator-crestere-salariala",
    categorySlug: "salarii-si-taxe",
    summary:
      "Compară salariul actual cu salariul țintă și vezi diferență în lei și în procente.",
    formulaName: "Creștere salarială",
    formulaExpression:
      "Diferență = salariu țintă - salariu actual; Creștere (%) = diferență / salariu actual x 100",
    formulaDescription:
      "Calculatorul transformă diferență dintre salariul actual și cel țintă într-o creștere absolută și procentuală.",
    howToSteps: [
      "Introdu salariul actual.",
      "Introdu salariul țintă sau oferta nouă.",
      "Citește creșterea în lei și în procente.",
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
        label: "Salariu țintă",
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
      { name: "increaseAmount", label: "Creștere în lei", unit: "lei", decimals: 2 },
      { name: "increasePercent", label: "Creștere procentuală", unit: "%", decimals: 2 },
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
      "Transformă salariul lunar într-un tarif orar orientativ, pornind de la numărul de ore lucrate.",
    formulaName: "Tarif orar",
    formulaExpression: "Tarif orar = venit lunar / ore lucrate în lună",
    formulaDescription:
      "Tariful orar rezultă din împărțirea venitului lunar la numărul total de ore lucrate în aceeași perioada.",
    howToSteps: [
      "Introdu venitul lunar pe care vrei să-l transformi în tarif orar.",
      "Introdu numărul de ore lucrate în lună.",
      "Citește valoarea orientativă pe oră.",
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
    title: "Calculator ore lucrate pe lună",
    slug: "calculator-ore-lucrate-pe-luna",
    categorySlug: "salarii-si-taxe",
    summary:
      "Estimează numărul total de ore lucrate într-o lună pe baza zilelor lucrătoare și a programului zilnic.",
    formulaName: "Ore lucrate pe lună",
    formulaExpression: "Ore lunare = zile lucrătoare x ore pe zi",
    formulaDescription:
      "Numărul total de ore lucrate într-o lună se obține înmulțind zilele lucrătoare cu durata programului zilnic.",
    howToSteps: [
      "Introdu numărul de zile lucrătoare relevante pentru luna analizată.",
      "Introdu numărul de ore lucrate într-o zi obișnuită.",
      "Citește totalul de ore pentru luna respectivă.",
    ],
    inputs: [
      {
        name: "workDays",
        label: "Zile lucrătoare",
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
      "Transformă venitul lunar într-o estimare anuală și permite adăugarea bonusurilor sau a lunilor suplimentare.",
    formulaName: "Venit anual",
    formulaExpression: "Venit anual = venit lunar x luni plătite + bonusuri",
    formulaDescription:
      "Venitul anual rezultă din înmulțirea venitului lunar cu numărul de luni plătite, la care se pot adaugă bonusuri sau venituri suplimentare.",
    howToSteps: [
      "Introdu venitul lunar mediu.",
      "Alege numărul de luni plătite sau valoarea suplimentară pentru bonusuri.",
      "Citește venitul anual estimat.",
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
        label: "Luni plătite",
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
      "Pornește de la brut și net pentru a vedea diferență absolută și rata efectiva de taxare.",
    formulaName: "Taxare efectiva",
    formulaExpression:
      "Taxe totale = brut - net; Taxare efectiva (%) = taxe totale / brut x 100",
    formulaDescription:
      "Calculatorul compară venitul brut cu venitul net pentru a estima rapid cât reprezintă taxele și contribuțiile în termeni absoluți și procentuali.",
    howToSteps: [
      "Introdu venitul brut.",
      "Introdu venitul net corespunzător.",
      "Citește suma taxelor și rata efectiva rezultată.",
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
      { name: "taxAmount", label: "Taxe și contribuții", unit: "lei", decimals: 2 },
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
    title: "Calculator rata maximă suportabilă",
    slug: "calculator-rata-maxima-suportabila",
    categorySlug: "credite-si-economii",
    summary:
      "Estimează rata lunară maximă și suma finanțabilă pornind de la venit, cheltuieli, dobânda și perioada.",
    formulaName: "Rata suportabilă și suma finanțabilă",
    formulaExpression:
      "Rata maximă = venit net x grad de îndatorare - alte rate; Suma finanțabilă = rata x [1 - (1 + i)^-n] / i",
    formulaDescription:
      "Calculatorul pornește de la un prag de îndatorare ales de utilizator și transformă rata lunară maximă într-o estimare a sumei care poate fi finanțată.",
    howToSteps: [
      "Introdu venitul lunar net și ratele existente.",
      "Alege pragul de îndatorare, dobânda și perioada creditului.",
      "Citește rata maximă și suma finanțabilă estimată.",
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
        label: "Grad de îndatorare",
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
        label: "Dobânda anuală",
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
      { name: "maxPayment", label: "Rata maximă", unit: "lei", decimals: 2 },
      { name: "maxLoanAmount", label: "Suma finanțabilă", unit: "lei", decimals: 2 },
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
    title: "Calculator grad de îndatorare",
    slug: "calculator-grad-de-indatorare",
    categorySlug: "credite-si-economii",
    summary:
      "Arată ce procent din venitul lunar este deja consumat de rate și plăți recurente.",
    formulaName: "Debt-to-income",
    formulaExpression: "Grad de îndatorare = plăți lunare recurente / venit lunar x 100",
    formulaDescription:
      "Gradul de îndatorare compară toate platile recurente de datorii cu venitul disponibil într-o lună obișnuită.",
    howToSteps: [
      "Introdu venitul lunar relevant pentru comparație.",
      "Introdu totalul ratelor sau plăților recurente.",
      "Citește procentul de îndatorare rezultat.",
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
        label: "Plăți recurente",
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
      { name: "debtToIncome", label: "Grad de îndatorare", unit: "%", decimals: 2 },
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
      "Estimează rata lunară, suma totală plătită și dobânda totală pentru un credit în rate egale.",
    formulaName: "Cost total credit",
    formulaExpression:
      "Rata = credit x rata lunară / (1 - (1 + rata lunară)^-luni); Cost total = rata x luni",
    formulaDescription:
      "Calculatorul folosește formula anuității pentru a transforma suma împrumutată, dobânda și perioada în cost lunar și cost total.",
    howToSteps: [
      "Introdu suma împrumutată.",
      "Introdu dobânda anuală și perioada în luni.",
      "Citește rata lunară, costul total și dobânda totală.",
    ],
    inputs: [
      {
        name: "principal",
        label: "Suma împrumutată",
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
        label: "Dobânda anuală",
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
      { name: "monthlyPayment", label: "Rata lunară", unit: "lei", decimals: 2 },
      { name: "totalCost", label: "Cost total", unit: "lei", decimals: 2 },
      { name: "totalInterest", label: "Dobânda totală", unit: "lei", decimals: 2 },
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
    title: "Calculator economie refinanțare",
    slug: "calculator-economie-refinantare",
    categorySlug: "credite-si-economii",
    summary:
      "Compară rata veche cu rata nouă și estimează economia lunară, economia totală și pragul de recuperare a costurilor.",
    formulaName: "Economii refinanțare",
    formulaExpression:
      "Economie lunară = rata veche - rata nouă; Economie netă = economie lunară x luni rămase - cost refinanțare",
    formulaDescription:
      "Calculatorul compară direct cele două scenarii de plată și arată în cât timp se recuperează costul refinanțării.",
    howToSteps: [
      "Introdu rata veche, rata nouă și lunile rămase.",
      "Adaugă costul refinanțării.",
      "Citește economia lunară, economia netă și pragul de recuperare.",
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
        label: "Rata nouă",
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
        label: "Luni rămase",
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
        label: "Cost refinanțare",
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
      { name: "monthlySavings", label: "Economie lunară", unit: "lei", decimals: 2 },
      { name: "netSavings", label: "Economie netă", unit: "lei", decimals: 2 },
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
    title: "Calculator fond de urgență",
    slug: "calculator-fond-de-urgenta",
    categorySlug: "credite-si-economii",
    summary:
      "Estimează mărimea fondului de urgență pornind de la cheltuielile lunare și numărul de luni de acoperire dorit.",
    formulaName: "Fond de urgență",
    formulaExpression: "Fond de urgență = cheltuieli lunare x luni de acoperire",
    formulaDescription:
      "Fondul de urgență este estimat simplu, prin înmulțirea cheltuielilor lunare esențiale cu perioada de acoperire dorită.",
    howToSteps: [
      "Introdu cheltuielile lunare esențiale.",
      "Alege câte luni vrei să acoperi.",
      "Citește suma-țintă pentru fondul de urgență.",
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
    title: "Calculator dobânda economii",
    slug: "calculator-dobanda-economii",
    categorySlug: "credite-si-economii",
    summary:
      "Estimează valoarea finală a economiilor pornind de la suma inițială, contribuție lunară, dobânda și perioada.",
    formulaName: "Valoare viitoare economii",
    formulaExpression:
      "FV = suma inițială x (1 + i)^n + contribuție lunară x [((1 + i)^n - 1) / i]",
    formulaDescription:
      "Calculatorul combină capitalul initial cu depunerile lunare și capitalizarea dobânzii pentru a estima evoluția economiilor.",
    howToSteps: [
      "Introdu suma inițială și contribuția lunară.",
      "Adaugă dobânda anuală și perioada.",
      "Citește valoarea finală și câștigul total din dobânda.",
    ],
    inputs: [
      {
        name: "initialAmount",
        label: "Suma inițială",
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
        label: "Contribuție lunară",
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
        label: "Dobânda anuală",
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
      { name: "futureValue", label: "Valoare finală", unit: "lei", decimals: 2 },
      { name: "interestEarned", label: "Dobânda acumulată", unit: "lei", decimals: 2 },
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
      "Estimează cât se poate acumula pentru pensie dintr-o contribuție lunară, un randament anual și un orizont lung de timp.",
    formulaName: "Economii pentru pensie",
    formulaExpression:
      "FV = contribuție lunară x [((1 + i)^n - 1) / i], cu capitalizare lunară",
    formulaDescription:
      "Calculatorul proiectează acumularea unei contribuții lunare recurente pe termen lung, folosind o rată anuală de creștere aleasă de utilizator.",
    howToSteps: [
      "Introdu contribuția lunară pe care o poți susține.",
      "Alege numărul de ani și randamentul anual orientativ.",
      "Citește suma finală estimată la finalul perioadei.",
    ],
    inputs: [
      {
        name: "monthlyContribution",
        label: "Contribuție lunară",
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
        label: "Ani până la obiectiv",
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
      "Estimează în câte luni poți ajunge la o țintă pornind de la suma inițială, contribuție lunară și dobânda.",
    formulaName: "Termen obiectiv economisire",
    formulaExpression:
      "Termenul se obține iterativ până când suma acumulată depășește țintă dorită.",
    formulaDescription:
      "Calculatorul simulează evoluția lunară a economiilor până când valoarea acumulată atinge sau depășește obiectivul final.",
    howToSteps: [
      "Introdu țintă finală, suma inițială și contribuția lunară.",
      "Adaugă dobânda anuală orientativă.",
      "Citește numărul de luni și anii necesari pentru a atinge obiectivul.",
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
        label: "Suma inițială",
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
        label: "Contribuție lunară",
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
        label: "Dobânda anuală",
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
      { name: "monthsToGoal", label: "Luni până la obiectiv", unit: "luni", decimals: 0 },
      { name: "yearsToGoal", label: "Ani până la obiectiv", unit: "ani", decimals: 2 },
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
      "Compară costul total al două scenarii de finanțare pornind de la avans, rate lunare și costuri finale.",
    formulaName: "Comparație leasing vs credit",
    formulaExpression:
      "Cost total = avans + rata lunară x luni + cost final; Diferență = scenariul A - scenariul B",
    formulaDescription:
      "Calculatorul compară două scenarii de finanțare la nivel de cost total, folosind aceeași perioada pentru o evaluare rapidă.",
    howToSteps: [
      "Introdu avansul, rata și costul final pentru leasing.",
      "Introdu aceleași valori pentru credit.",
      "Citește costul total și diferență dintre scenarii.",
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
        label: "Valoare reziduală",
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
        label: "Perioada comparată",
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
      { name: "difference", label: "Diferență", unit: "lei", decimals: 2 },
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
      "Calculează avansul necesar și suma finanțată pornind de la prețul total și procentul de avans.",
    formulaName: "Avans și suma finanțată",
    formulaExpression: "Avans = preț total x procent avans; Suma finanțată = preț total - avans",
    formulaDescription:
      "Calculatorul transformă un procent de avans într-o sumă concretă și arată ce parte rămâne de finanțat.",
    howToSteps: [
      "Introdu prețul total al achiziției.",
      "Introdu procentul de avans dorit sau cerut.",
      "Citește suma avansului și suma rămasă pentru finanțare.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Preț total",
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
      { name: "financedAmount", label: "Suma finanțată", unit: "lei", decimals: 2 },
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
    title: "Calculator randament publicitate (ROAS)",
    slug: "calculator-randament-publicitate",
    categorySlug: "afaceri",
    summary:
      "Calculează ROAS-ul pornind de la bugetul de advertising și venitul atribuit campaniei.",
    formulaName: "ROAS",
    formulaExpression: "ROAS = venit atribuit / buget ads",
    formulaDescription:
      "ROAS-ul arată de câte ori recuperezi bugetul de advertising prin venitul generat de campanie.",
    howToSteps: [
      "Introdu bugetul de advertising consumat.",
      "Introdu venitul atribuit campaniei.",
      "Citește multiplicatorul ROAS și venitul generat pentru fiecare leu investit.",
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
    title: "Calculator prag ROAS rentabil",
    slug: "calculator-prag-roas-rentabil",
    categorySlug: "afaceri",
    summary:
      "Arată ROAS-ul minim necesar pentru a acoperi costul variabil și pentru a nu rămâne pe pierdere.",
    formulaName: "Prag ROAS rentabil",
    formulaExpression: "Prag ROAS rentabil = 100 / marja brută (%)",
    formulaDescription:
      "ROAS-ul de break-even pornește din marja brută disponibilă pentru marketing și arată pragul minim la care campania nu mai pierde bani.",
    howToSteps: [
      "Introdu marja brută disponibilă după costurile directe.",
      "Citește ROAS-ul minim necesar pentru break-even.",
      "Compară rezultatul cu ROAS-ul real al campaniilor tale.",
    ],
    inputs: [
      {
        name: "grossMarginPercent",
        label: "Marja brută disponibilă",
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
      { name: "adBudgetShare", label: "Pondere maximă ads", unit: "%", decimals: 2 },
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
    title: "Calculator valoare medie comanda (AOV)",
    slug: "calculator-valoare-medie-comanda",
    categorySlug: "afaceri",
    summary:
      "Calculează valoarea medie a comenzii pornind de la venit și numărul total de comenzi.",
    formulaName: "Valoare medie comanda",
    formulaExpression: "AOV = venit total / număr comenzi",
    formulaDescription:
      "AOV-ul arată câți bani aduce în medie o comandă și ajută la interpretarea mai bună a funnel-ului comercial.",
    howToSteps: [
      "Introdu venitul total din perioada analizată.",
      "Introdu numărul total de comenzi.",
      "Citește valoarea medie pe comanda.",
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
        label: "Număr comenzi",
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
    categorySlug: "afaceri",
    summary:
      "Calculează rata de conversie pornind de la vizitatori și conversii.",
    formulaName: "Rata de conversie",
    formulaExpression: "Conversion rate (%) = conversii / vizitatori x 100",
    formulaDescription:
      "Rata de conversie arată ce procent din trafic face pasul dorit: comanda, lead sau alta acțiune.",
    howToSteps: [
      "Introdu numărul total de vizitatori sau sesiuni.",
      "Introdu numărul de conversii.",
      "Citește procentul de conversie.",
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
    title: "Calculator cost prospect (CPL)",
    slug: "calculator-cost-prospect",
    categorySlug: "afaceri",
    summary:
      "Calculează costul per lead pornind de la bugetul de marketing și numărul de lead-uri generate.",
    formulaName: "Cost per lead",
    formulaExpression: "CPL = cost marketing / lead-uri",
    formulaDescription:
      "CPL-ul arată cât platești în medie pentru un lead și este util când compari canale sau campanii.",
    howToSteps: [
      "Introdu costul total al campaniei.",
      "Introdu lead-urile generate.",
      "Citește costul per lead.",
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
    title: "Calculator cost achiziție client (CAC)",
    slug: "calculator-cost-achizitie-client",
    categorySlug: "afaceri",
    summary:
      "Calculează costul de achiziție al unui client pornind de la costurile comerciale și numărul de clienți noi.",
    formulaName: "Cost achiziție client",
    formulaExpression: "CAC = cost total achiziție / clienți noi",
    formulaDescription:
      "CAC-ul arată cât te costă în medie să transformi prospecții în clienți noi într-o perioadă.",
    howToSteps: [
      "Introdu costurile de marketing și vânzări atribuite perioadei.",
      "Introdu numărul de clienți noi.",
      "Citește costul mediu de achiziție per client.",
    ],
    inputs: [
      {
        name: "acquisitionCost",
        label: "Cost total achiziție",
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
        label: "Clienți noi",
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
    title: "Calculator venit țintă",
    slug: "calculator-venit-tinta",
    categorySlug: "afaceri",
    summary:
      "Estimează venitul necesar pentru a acoperi costurile fixe și profitul țintă la o anumită marja.",
    formulaName: "Venit țintă",
    formulaExpression: "Venit țintă = (costuri fixe + profit țintă) / marja brută",
    formulaDescription:
      "Calculatorul pornește din marja disponibilă și arată ce venit trebuie atins pentru a susține costurile și obiectivul de profit.",
    howToSteps: [
      "Introdu costurile fixe lunare sau ale perioadei.",
      "Introdu profitul țintă dorit.",
      "Introdu marja brută disponibilă.",
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
        label: "Profit țintă",
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
        label: "Marja brută",
        type: "number",
        unit: "%",
        min: 0.1,
        max: 100,
        step: 0.1,
        required: true,
        defaultValue: 40,
      },
    ],
    outputs: [{ name: "targetRevenue", label: "Venit țintă", unit: "lei", decimals: 2 }],
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
    categorySlug: "afaceri",
    summary:
      "Calculează profitul brut și marja brută pornind de la venit și costuri directe.",
    formulaName: "Profit brut",
    formulaExpression: "Profit brut = venit - costuri directe",
    formulaDescription:
      "Profitul brut arată ce rămâne după ce scazi costurile direct legate de livrarea produsului sau serviciului.",
    howToSteps: [
      "Introdu venitul din perioada analizată.",
      "Introdu costurile directe aferente.",
      "Citește profitul brut și marja brută.",
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
      { name: "grossMargin", label: "Marja brută", unit: "%", decimals: 2 },
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
    categorySlug: "afaceri",
    summary:
      "Calculează profitul net orientativ pornind de la venit și costul total al perioadei.",
    formulaName: "Profit net",
    formulaExpression: "Profit net = venit total - cost total",
    formulaDescription:
      "Calculatorul arată ce rămâne după ce scazi toate costurile incluse în scenariul analizat.",
    howToSteps: [
      "Introdu venitul total.",
      "Introdu costurile totale ale perioadei.",
      "Citește profitul net și marja netă orientativă.",
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
      { name: "netMargin", label: "Marja netă", unit: "%", decimals: 2 },
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
    title: "Calculator rotație stoc",
    slug: "calculator-rotatie-stoc",
    categorySlug: "afaceri",
    summary:
      "Calculează de câte ori se rotește stocul într-o perioadă pornind de la costul mărfii vândute și stocul mediu.",
    formulaName: "Rotație stoc",
    formulaExpression: "Rotație stoc = cost marfă vândută / stoc mediu",
    formulaDescription:
      "Rotația stocului arată cât de repede se transformă stocul în vânzări pe durata unei perioade analizate.",
    howToSteps: [
      "Introdu costul mărfii vândute în perioada analizată.",
      "Introdu stocul mediu.",
      "Citește numărul de rotații și zilele medii pe stoc.",
    ],
    inputs: [
      {
        name: "cogs",
        label: "Cost marfă vândută",
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
        label: "Zile în perioada",
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
      { name: "inventoryTurnover", label: "Rotație stoc", decimals: 2 },
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
      "Estimează consumul lunar și costul anual pentru un aparat electric pornind de la putere și timp de utilizare.",
    formulaName: "Consum aparat electric",
    formulaExpression: "kWh = (W / 1000) x ore x zile; cost = kWh x preț/kWh",
    formulaDescription:
      "Calculatorul transformă puterea și timpul de utilizare într-un consum estimat și îl convertește în cost.",
    howToSteps: [
      "Introdu puterea aparatului în wați.",
      "Introdu numărul de ore folosite pe zi și zilele din lună.",
      "Citește consumul lunar și costul estimat.",
    ],
    inputs: [
      { name: "powerWatts", label: "Putere aparat", type: "number", unit: "W", min: 1, max: 20000, step: 1, required: true, defaultValue: 1800 },
      { name: "hoursPerDay", label: "Ore pe zi", type: "number", unit: "ore", min: 0.1, max: 24, step: 0.1, required: true, defaultValue: 2 },
      { name: "daysPerMonth", label: "Zile pe lună", type: "number", unit: "zile", min: 1, max: 31, step: 1, required: true, defaultValue: 30 },
      { name: "pricePerKwh", label: "Preț energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
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
      "Estimează factura lunară și costul anual pornind de la consumul total și prețul pe kWh.",
    formulaName: "Factura de curent",
    formulaExpression: "Factura = consum lunar x preț/kWh + costuri fixe",
    formulaDescription:
      "Calculatorul folosește consumul lunar total, prețul energiei și un eventual cost fix pentru a estima factura.",
    howToSteps: [
      "Introdu consumul lunar total în kWh.",
      "Introdu prețul pe kWh și costurile fixe lunare, dacă vrei.",
      "Citește factura estimată și costul anual.",
    ],
    inputs: [
      { name: "monthlyConsumptionKwh", label: "Consum lunar", type: "number", unit: "kWh", min: 0.1, max: 100000, step: 0.1, required: true, defaultValue: 280 },
      { name: "pricePerKwh", label: "Preț energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
      { name: "fixedMonthlyFees", label: "Costuri fixe", type: "number", unit: "lei", min: 0, max: 10000, step: 0.01, required: true, defaultValue: 12 },
    ],
    outputs: [
      { name: "monthlyBill", label: "Factura lunară", unit: "lei", decimals: 2 },
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
      "Estimează puterea sistemului fotovoltaic necesar pornind de la consumul anual și procentul de acoperire dorit.",
    formulaName: "Dimensionare sistem FV",
    formulaExpression: "kWp necesari = (consum anual x acoperire) / producție specifică",
    formulaDescription:
      "Calculatorul raportează consumul anual la producția specifică estimată pentru a aproxima puterea sistemului.",
    howToSteps: [
      "Introdu consumul anual total.",
      "Alege procentul de acoperire dorit.",
      "Introdu producția specifică estimată în kWh/kWp/an.",
    ],
    inputs: [
      { name: "annualConsumptionKwh", label: "Consum anual", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 4200 },
      { name: "coveragePercent", label: "Acoperire dorită", type: "number", unit: "%", min: 1, max: 100, step: 1, required: true, defaultValue: 90 },
      { name: "specificYield", label: "Producție specifică", type: "number", unit: "kWh/kWp/an", min: 100, max: 3000, step: 1, required: true, defaultValue: 1350 },
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
    title: "Calculator producție fotovoltaică",
    slug: "calculator-productie-fotovoltaica",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimează producția anuală și lunară medie a unui sistem fotovoltaic pornind de la puterea instalată și randamentul local.",
    formulaName: "Producție fotovoltaică",
    formulaExpression: "Producție anuală = kWp instalați x producție specifică",
    formulaDescription:
      "Calculatorul folosește puterea instalată și producția specifică anuală pentru a aproxima producția sistemului.",
    howToSteps: [
      "Introdu puterea instalată în kWp.",
      "Introdu producția specifică estimată.",
      "Citește producția anuală și media lunară.",
    ],
    inputs: [
      { name: "systemSizeKwp", label: "Putere instalată", type: "number", unit: "kWp", min: 0.1, max: 1000, step: 0.1, required: true, defaultValue: 5.5 },
      { name: "specificYield", label: "Producție specifică", type: "number", unit: "kWh/kWp/an", min: 100, max: 3000, step: 1, required: true, defaultValue: 1350 },
      { name: "performanceFactor", label: "Factor performanță", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 92 },
    ],
    outputs: [
      { name: "annualProduction", label: "Producție anuală", unit: "kWh/an", decimals: 0 },
      { name: "monthlyAverageProduction", label: "Medie lunară", unit: "kWh/luna", decimals: 0 },
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
    title: "Calculator număr panouri fotovoltaice",
    slug: "calculator-numar-panouri-fotovoltaice",
    categorySlug: "energie-pentru-casa",
    summary:
      "Arată câte panouri și ce suprafață aproximativă îți trebuie pentru puterea dorită.",
    formulaName: "Număr panouri",
    formulaExpression: "Număr panouri = putere dorită / putere panou",
    formulaDescription:
      "Calculatorul transformă puterea țintă a sistemului în număr de panouri și suprafață ocupată estimată.",
    howToSteps: [
      "Introdu puterea sistemului dorit în kWp.",
      "Introdu puterea unui panou și suprafață aproximativă per panou.",
      "Citește numărul de panouri și suprafață ocupată.",
    ],
    inputs: [
      { name: "targetSystemKwp", label: "Sistem dorit", type: "number", unit: "kWp", min: 0.1, max: 1000, step: 0.1, required: true, defaultValue: 6 },
      { name: "panelPowerWatts", label: "Putere panou", type: "number", unit: "W", min: 100, max: 1000, step: 1, required: true, defaultValue: 450 },
      { name: "panelArea", label: "Suprafață / panou", type: "number", unit: "mp", min: 0.5, max: 5, step: 0.01, required: true, defaultValue: 2.1 },
    ],
    outputs: [
      { name: "panelCount", label: "Număr panouri", unit: "panouri", decimals: 0 },
      { name: "roofAreaNeeded", label: "Suprafață aproximativă", unit: "mp", decimals: 2 },
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
      "Estimează în câți ani se amortizează un sistem fotovoltaic pornind de la cost, economii și mentenanță.",
    formulaName: "Amortizare sistem FV",
    formulaExpression: "Ani amortizare = investiție netă / economie anuală netă",
    formulaDescription:
      "Calculatorul compară investiția netă cu economiile anuale rămase după mentenanță estimată.",
    howToSteps: [
      "Introdu costul total și eventualul sprijin sau grant.",
      "Introdu economiile anuale estimate și mentenanță anuală.",
      "Citește investiția netă și anii de amortizare.",
    ],
    inputs: [
      { name: "systemCost", label: "Cost sistem", type: "number", unit: "lei", min: 1, max: 100000000, step: 1, required: true, defaultValue: 32000 },
      { name: "grantValue", label: "Grant / subvenție", type: "number", unit: "lei", min: 0, max: 100000000, step: 1, required: true, defaultValue: 0 },
      { name: "annualSavings", label: "Economii anuale", type: "number", unit: "lei/an", min: 0.01, max: 100000000, step: 1, required: true, defaultValue: 5200 },
      { name: "annualMaintenance", label: "Mentenanță anuală", type: "number", unit: "lei/an", min: 0, max: 1000000, step: 1, required: true, defaultValue: 300 },
    ],
    outputs: [
      { name: "netInvestment", label: "Investiție netă", unit: "lei", decimals: 2 },
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
    title: "Calculator BTU aer condiționat",
    slug: "calculator-btu-aer-conditionat",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimează capacitatea necesară pentru aer condiționat pornind de la suprafață, înălțime și nivelul de însorire.",
    formulaName: "Necesar BTU",
    formulaExpression: "BTU estimat = suprafață x factor baza x factori de ajustare",
    formulaDescription:
      "Calculatorul folosește suprafață camerei și factori simpli de ajustare pentru a aproxima capacitatea BTU potrivită.",
    howToSteps: [
      "Introdu suprafață camerei și înălțimea.",
      "Alege nivelul de însorire și izolația.",
      "Citește necesarul BTU și echivalentul aproximativ în kW.",
    ],
    inputs: [
      { name: "area", label: "Suprafață", type: "number", unit: "mp", min: 1, max: 1000, step: 0.1, required: true, defaultValue: 26 },
      { name: "ceilingHeight", label: "Înălțime", type: "number", unit: "m", min: 2, max: 5, step: 0.1, required: true, defaultValue: 2.6 },
      { name: "sunFactor", label: "Factor însorire", type: "number", unit: "%", min: 80, max: 140, step: 1, required: true, defaultValue: 110 },
      { name: "insulationFactor", label: "Factor izolație", type: "number", unit: "%", min: 85, max: 125, step: 1, required: true, defaultValue: 100 },
    ],
    outputs: [
      { name: "requiredBtu", label: "BTU recomandat", unit: "BTU/h", decimals: 0 },
      { name: "requiredKw", label: "Putere echivalentă", unit: "kW", decimals: 2 },
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
    title: "Calculator necesar căldură locuință",
    slug: "calculator-necesar-caldura-locuinta",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimează necesarul de căldură pornind de la volum, izolație și diferență de temperatură.",
    formulaName: "Necesar termic",
    formulaExpression: "kW = volum x coeficient pierderi x deltaT / 1000",
    formulaDescription:
      "Calculatorul folosește volumul și un coeficient simplificat de pierderi pentru a aproxima necesarul termic.",
    howToSteps: [
      "Introdu suprafață și înălțimea locuinței.",
      "Introdu diferență de temperatură dorită și coeficientul de pierderi.",
      "Citește necesarul termic estimat.",
    ],
    inputs: [
      { name: "area", label: "Suprafață", type: "number", unit: "mp", min: 1, max: 2000, step: 0.1, required: true, defaultValue: 120 },
      { name: "ceilingHeight", label: "Înălțime", type: "number", unit: "m", min: 2, max: 5, step: 0.1, required: true, defaultValue: 2.6 },
      { name: "temperatureDelta", label: "Delta temperatură", type: "number", unit: "°C", min: 1, max: 60, step: 1, required: true, defaultValue: 25 },
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
    title: "Calculator dimensionare pompă de căldură",
    slug: "calculator-dimensionare-pompa-de-caldura",
    categorySlug: "energie-pentru-casa",
    summary:
      "Pornește de la necesarul termic și adaugă o marjă prudentă pentru a aproxima puterea pompei de căldură.",
    formulaName: "Dimensionare pompă de căldură",
    formulaExpression: "Putere recomandată = necesar termic x factor de siguranță",
    formulaDescription:
      "Calculatorul aplică un factor de siguranță peste necesarul termic pentru a aproxima puterea recomandată.",
    howToSteps: [
      "Introdu necesarul termic estimat.",
      "Alege marja de siguranță.",
      "Citește puterea recomandată a pompei.",
    ],
    inputs: [
      { name: "heatingLoadKw", label: "Necesar termic", type: "number", unit: "kW", min: 0.1, max: 200, step: 0.1, required: true, defaultValue: 8.5 },
      { name: "safetyFactor", label: "Marja siguranță", type: "number", unit: "%", min: 100, max: 150, step: 1, required: true, defaultValue: 115 },
    ],
    outputs: [
      { name: "recommendedHeatPumpKw", label: "Pompă recomandată", unit: "kW", decimals: 2 },
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
    title: "Calculator baterie fotovoltaică",
    slug: "calculator-baterie-fotovoltaica",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimează capacitatea unei baterii pornind de la consumul zilnic, orele de backup și adâncimea de descărcare.",
    formulaName: "Capacitate baterie",
    formulaExpression: "Capacitate nominală = energie necesară / DoD",
    formulaDescription:
      "Calculatorul folosește energia pe care vrei să o acoperi în backup și adâncimea de descărcare pentru a aproxima bateria necesară.",
    howToSteps: [
      "Introdu consumul mediu zilnic sau consumul care trebuie acoperit.",
      "Introdu ce procent din consum vrei în backup și adâncimea de descărcare.",
      "Citește capacitatea utilă și capacitatea nominală estimată.",
    ],
    inputs: [
      { name: "dailyConsumptionKwh", label: "Consum zilnic", type: "number", unit: "kWh/zi", min: 0.1, max: 1000, step: 0.1, required: true, defaultValue: 12 },
      { name: "backupCoveragePercent", label: "Acoperire backup", type: "number", unit: "%", min: 1, max: 100, step: 1, required: true, defaultValue: 70 },
      { name: "depthOfDischarge", label: "Adâncime descărcare", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 90 },
    ],
    outputs: [
      { name: "usableBatteryKwh", label: "Energie utilă", unit: "kWh", decimals: 2 },
      { name: "nominalBatteryKwh", label: "Capacitate nominală", unit: "kWh", decimals: 2 },
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
      "Estimează costul lunar și anual al frigiderului pornind de la consumul zilnic mediu.",
    formulaName: "Consum frigider",
    formulaExpression: "Consum lunar = kWh/zi x zile; cost = consum x preț/kWh",
    formulaDescription:
      "Calculatorul folosește consumul mediu zilnic pentru a estima costul lunar și anual al frigiderului.",
    howToSteps: [
      "Introdu consumul mediu zilnic al frigiderului.",
      "Introdu prețul energiei electrice.",
      "Citește costul lunar și anual estimat.",
    ],
    inputs: [
      { name: "dailyConsumptionKwh", label: "Consum zilnic", type: "number", unit: "kWh/zi", min: 0.01, max: 20, step: 0.01, required: true, defaultValue: 1.1 },
      { name: "pricePerKwh", label: "Preț energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
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
      "Estimează energia și costul pentru încălzirea apei în boiler pornind de la volum și diferență de temperatură.",
    formulaName: "Consum boiler",
    formulaExpression:
      "kWh = litri x deltaT x 0.001163 / eficiență x cicluri",
    formulaDescription:
      "Calculatorul folosește energia necesară pentru încălzirea apei și o ajustează cu eficiență sistemului.",
    howToSteps: [
      "Introdu volumul de apă încălzit într-un ciclu.",
      "Introdu diferență de temperatură și numărul de cicluri.",
      "Citește consumul și costul zilnic/lunar.",
    ],
    inputs: [
      { name: "litersPerCycle", label: "Litri / ciclu", type: "number", unit: "litri", min: 1, max: 1000, step: 1, required: true, defaultValue: 80 },
      { name: "temperatureRise", label: "Delta temperatură", type: "number", unit: "°C", min: 1, max: 80, step: 1, required: true, defaultValue: 35 },
      { name: "cyclesPerDay", label: "Cicluri / zi", type: "number", unit: "cicluri", min: 0.1, max: 20, step: 0.1, required: true, defaultValue: 1.2 },
      { name: "efficiencyPercent", label: "Eficiență", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 92 },
      { name: "pricePerKwh", label: "Preț energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
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
    title: "Calculator consum aer condiționat",
    slug: "calculator-consum-aer-conditionat",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimează costul aerului condiționat pornind de la puterea medie consumată și timpul de funcționare.",
    formulaName: "Consum aer condiționat",
    formulaExpression: "kWh = (kW medii x ore/zi x zile); cost = kWh x preț/kWh",
    formulaDescription:
      "Calculatorul leagă puterea medie absorbită de durata de funcționare pentru a estima costul real.",
    howToSteps: [
      "Introdu puterea medie absorbită a aparatului.",
      "Introdu orele de funcționare și numărul de zile.",
      "Citește costul lunar și sezonier.",
    ],
    inputs: [
      { name: "averagePowerKw", label: "Putere medie absorbită", type: "number", unit: "kW", min: 0.1, max: 20, step: 0.01, required: true, defaultValue: 0.9 },
      { name: "hoursPerDay", label: "Ore / zi", type: "number", unit: "ore", min: 0.1, max: 24, step: 0.1, required: true, defaultValue: 8 },
      { name: "daysPerMonth", label: "Zile / lună", type: "number", unit: "zile", min: 1, max: 31, step: 1, required: true, defaultValue: 30 },
      { name: "pricePerKwh", label: "Preț energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
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
      "Compară costul anual al becurilor clasice cu LED și estimează economia obținută.",
    formulaName: "Economie LED",
    formulaExpression:
      "Economii = (consum vechi - consum LED) x ore x zile x preț/kWh",
    formulaDescription:
      "Calculatorul compară două puteri de iluminat pentru același număr de becuri și același timp de utilizare.",
    howToSteps: [
      "Introdu puterea becurilor vechi și a becurilor LED.",
      "Introdu numărul de becuri și timpul de folosire.",
      "Citește economia anuală și perioada de recuperare.",
    ],
    inputs: [
      { name: "oldBulbWatts", label: "Putere bec vechi", type: "number", unit: "W", min: 1, max: 1000, step: 1, required: true, defaultValue: 60 },
      { name: "ledBulbWatts", label: "Putere LED", type: "number", unit: "W", min: 1, max: 1000, step: 1, required: true, defaultValue: 9 },
      { name: "bulbCount", label: "Număr becuri", type: "number", unit: "becuri", min: 1, max: 500, step: 1, required: true, defaultValue: 12 },
      { name: "hoursPerDay", label: "Ore / zi", type: "number", unit: "ore", min: 0.1, max: 24, step: 0.1, required: true, defaultValue: 5 },
      { name: "pricePerKwh", label: "Preț energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
      { name: "upgradeCost", label: "Cost upgrade LED", type: "number", unit: "lei", min: 0, max: 100000, step: 1, required: true, defaultValue: 180 },
    ],
    outputs: [
      { name: "annualSavings", label: "Economii anuale", unit: "lei", decimals: 2 },
      { name: "paybackMonths", label: "Recuperare investiție", unit: "luni", decimals: 1 },
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
    title: "Calculator suprafață acoperiș pentru panouri",
    slug: "calculator-suprafata-acoperis-panouri",
    categorySlug: "energie-pentru-casa",
    summary:
      "Estimează câte panouri și ce putere maximă încap pe suprafață utilă a acoperișului.",
    formulaName: "Capacitate după suprafață acoperișului",
    formulaExpression: "Panouri maxime = suprafață utilă / suprafață panou",
    formulaDescription:
      "Calculatorul transformă suprafață utilă în număr de panouri și putere maximă instalabilă.",
    howToSteps: [
      "Introdu suprafață utilă reală a acoperișului.",
      "Introdu suprafață și puterea unui panou.",
      "Citește numărul maxim de panouri și puterea totală.",
    ],
    inputs: [
      { name: "usableRoofArea", label: "Suprafață utilă", type: "number", unit: "mp", min: 1, max: 10000, step: 0.1, required: true, defaultValue: 42 },
      { name: "panelArea", label: "Suprafață panou", type: "number", unit: "mp", min: 0.5, max: 5, step: 0.01, required: true, defaultValue: 2.1 },
      { name: "panelPowerWatts", label: "Putere panou", type: "number", unit: "W", min: 100, max: 1000, step: 1, required: true, defaultValue: 450 },
    ],
    outputs: [
      { name: "maxPanels", label: "Panouri maxime", unit: "panouri", decimals: 0 },
      { name: "maxSystemKwp", label: "Putere maximă", unit: "kWp", decimals: 2 },
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
      "Estimează puterea invertorului pornind de la puterea DC a sistemului și raportul DC/AC dorit.",
    formulaName: "Dimensionare invertor",
    formulaExpression: "Invertor AC = kWp DC / raport DC-AC",
    formulaDescription:
      "Calculatorul folosește puterea sistemului și un raport DC/AC pentru a aproxima invertorul potrivit.",
    howToSteps: [
      "Introdu puterea sistemului în kWp.",
      "Introdu raportul DC/AC dorit.",
      "Citește puterea aproximativă a invertorului.",
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
      "Împarte producția fotovoltaică între autoconsum și energie injectată, apoi o raportează la consumul casei.",
    formulaName: "Autoconsum și injectare",
    formulaExpression:
      "Autoconsum = producție x procent autoconsum; injectare = producție - autoconsum",
    formulaDescription:
      "Calculatorul estimează cât din producție folosești direct și cât ajunge în rețea.",
    howToSteps: [
      "Introdu producția anuală estimată.",
      "Introdu procentul de autoconsum dorit sau observat.",
      "Citește energia autoconsumată, injectată și acoperirea consumului.",
    ],
    inputs: [
      { name: "annualProductionKwh", label: "Producție anuală", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 6800 },
      { name: "annualConsumptionKwh", label: "Consum anual", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 4200 },
      { name: "selfConsumptionPercent", label: "Autoconsum", type: "number", unit: "%", min: 1, max: 100, step: 1, required: true, defaultValue: 45 },
    ],
    outputs: [
      { name: "selfConsumedKwh", label: "Autoconsum", unit: "kWh/an", decimals: 0 },
      { name: "exportedKwh", label: "Injectat în rețea", unit: "kWh/an", decimals: 0 },
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
      "Estimează câte ore de backup obții dintr-o baterie sau un UPS la o anumită sarcina.",
    formulaName: "Autonomie UPS",
    formulaExpression:
      "Ore = (Ah x V x DoD x eficiență) / W sarcina",
    formulaDescription:
      "Calculatorul folosește energia disponibilă în baterie și puterea consumatorilor pentru a aproxima autonomia.",
    howToSteps: [
      "Introdu tensiunea, capacitatea bateriei și sarcina în wați.",
      "Introdu eficiență și adâncimea de descărcare.",
      "Citește autonomia estimată în ore și minute.",
    ],
    inputs: [
      { name: "batteryVoltage", label: "Tensiune baterie", type: "number", unit: "V", min: 1, max: 500, step: 1, required: true, defaultValue: 24 },
      { name: "batteryCapacityAh", label: "Capacitate baterie", type: "number", unit: "Ah", min: 1, max: 10000, step: 1, required: true, defaultValue: 100 },
      { name: "loadWatts", label: "Sarcina", type: "number", unit: "W", min: 1, max: 100000, step: 1, required: true, defaultValue: 300 },
      { name: "efficiencyPercent", label: "Eficiență", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 90 },
      { name: "depthOfDischarge", label: "Adâncime descărcare", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 80 },
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
    title: "Calculator cost încălzire gaz vs pompă de căldură",
    slug: "calculator-cost-incalzire-gaz-vs-pompa-de-caldura",
    categorySlug: "energie-pentru-casa",
    summary:
      "Compară costul anual al încălzirii între gaz și pompă de căldură pornind de la necesarul termic.",
    formulaName: "Comparație cost încălzire",
    formulaExpression:
      "Cost gaz = necesar / eficiență x preț gaz; Cost pompă = necesar / COP x preț energie",
    formulaDescription:
      "Calculatorul raportează aceeași nevoie de căldură la două tehnologii diferite pentru a compara costul anual.",
    howToSteps: [
      "Introdu necesarul anual de căldură.",
      "Introdu prețul gazului, eficiență centralei, prețul energiei și COP-ul pompei.",
      "Citește costurile anuale și diferență.",
    ],
    inputs: [
      { name: "annualHeatNeedKwh", label: "Necesar anual", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 14000 },
      { name: "gasPricePerKwh", label: "Preț gaz", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.38 },
      { name: "boilerEfficiencyPercent", label: "Eficiență centrală", type: "number", unit: "%", min: 10, max: 100, step: 1, required: true, defaultValue: 92 },
      { name: "electricityPricePerKwh", label: "Preț energie", type: "number", unit: "lei/kWh", min: 0.01, max: 10, step: 0.01, required: true, defaultValue: 0.95 },
      { name: "heatPumpCop", label: "COP pompă", type: "number", min: 1, max: 10, step: 0.1, required: true, defaultValue: 3.4 },
    ],
    outputs: [
      { name: "gasAnnualCost", label: "Cost anual gaz", unit: "lei", decimals: 2 },
      { name: "heatPumpAnnualCost", label: "Cost anual pompă", unit: "lei", decimals: 2 },
      { name: "annualDifference", label: "Diferență anuală", unit: "lei", decimals: 2 },
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
      "Estimează emisiile evitate anual pornind de la producția fotovoltaică și factorul de emisii folosit.",
    formulaName: "CO2 evitat",
    formulaExpression: "CO2 evitat = producție anuală x factor emisii",
    formulaDescription:
      "Calculatorul transformă energia produsă din panouri într-o estimare simplificată a emisiilor evitate.",
    howToSteps: [
      "Introdu producția anuală estimată a sistemului.",
      "Introdu factorul de emisii folosit pentru comparație.",
      "Citește emisiile evitate în kg și tone.",
    ],
    inputs: [
      { name: "annualProductionKwh", label: "Producție anuală", type: "number", unit: "kWh/an", min: 1, max: 1000000, step: 1, required: true, defaultValue: 6800 },
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
    title: "Calculator preț pe mp",
    slug: "calculator-pret-pe-mp",
    categorySlug: "imobiliare",
    summary:
      "Calculează prețul pe metru pătrat pornind de la prețul total al proprietății și suprafață utilă.",
    formulaName: "Preț pe metru pătrat",
    formulaExpression: "Preț/mp = preț total / suprafață utilă",
    formulaDescription:
      "Calculatorul împarte prețul total al proprietății la suprafață utilă pentru a obține un reper comparabil între anunțuri sau scenarii.",
    howToSteps: [
      "Introdu prețul total cerut sau negociat.",
      "Introdu suprafață utilă folosită în comparație.",
      "Citește prețul pe mp și folosește-l pentru a compara proprietăți similare.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Preț total",
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
        label: "Suprafață utilă",
        type: "number",
        unit: "mp",
        min: 1,
        max: 10000,
        step: 0.1,
        required: true,
        defaultValue: 72,
      },
    ],
    outputs: [{ name: "pricePerSqm", label: "Preț pe mp", unit: "lei/mp", decimals: 2 }],
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
    title: "Calculator avans locuință",
    slug: "calculator-avans-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Transformă procentul de avans într-o sumă concretă și arată cât rămâne de finanțat pentru achiziția unei locuințe.",
    formulaName: "Avans locuință",
    formulaExpression:
      "Avans = preț total x procent avans; suma finanțată = preț total - avans",
    formulaDescription:
      "Calculatorul transformă rapid procentul de avans într-o sumă concretă și estimează partea rămasă pentru finanțare.",
    howToSteps: [
      "Introdu prețul total al proprietății.",
      "Introdu procentul de avans pe care vrei să-l testezi.",
      "Citește suma avansului și suma care rămâne de finanțat.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Preț proprietate",
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
      { name: "financedAmount", label: "Suma finanțată", unit: "lei", decimals: 2 },
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
    title: "Calculator cost total achiziție locuință",
    slug: "calculator-cost-total-achizitie-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Leagă prețul locuinței de taxele și costurile inițiale, renovare, mobilare și o marjă de rezervă.",
    formulaName: "Cost total proiect imobiliar",
    formulaExpression:
      "Cost total = preț proprietate + costuri închidere + renovare + mobilare + rezervă",
    formulaDescription:
      "Calculatorul separă prețul proprietății de costurile inițiale suplimentare și aplică o rezervă simplă pentru bugetare mai prudentă.",
    howToSteps: [
      "Introdu prețul proprietății și costurile de închidere estimate.",
      "Adaugă bugetul pentru renovare și mobilare.",
      "Alege o marjă de rezervă și citește costul total estimat.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Preț proprietate",
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
        label: "Costuri închidere",
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
        label: "Rezervă buget",
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
      { name: "contingencyAmount", label: "Rezervă", unit: "lei", decimals: 2 },
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
    title: "Calculator chirie vs cumpărare",
    slug: "calculator-chirie-vs-cumparare",
    categorySlug: "imobiliare",
    summary:
      "Compară costul cumulat al chiriei cu costul unui scenariu de proprietate pe același interval de timp.",
    formulaName: "Comparație chirie vs cumpărare",
    formulaExpression:
      "Chirie totală = chirie lunară x 12 x ani; Cost proprietate = cost initial + cost lunar x 12 x ani",
    formulaDescription:
      "Calculatorul compară rapid două scenarii de locuire folosind același orizont de timp și aceeași unitate monetară.",
    howToSteps: [
      "Introdu chiria lunară și costul lunar al scenariului de proprietate.",
      "Adaugă costul initial al cumpărării și perioada de comparație.",
      "Citește costul cumulat pentru ambele scenarii și diferență dintre ele.",
    ],
    inputs: [
      {
        name: "monthlyRent",
        label: "Chirie lunară",
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
        label: "Cost initial cumpărare",
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
        label: "Perioada comparată",
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
      { name: "difference", label: "Diferență", unit: "lei", decimals: 2 },
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
      "Estimează bugetul de renovare pornind de la suprafață, costul pe mp și o rezervă pentru surprizele din lucrare.",
    formulaName: "Buget renovare",
    formulaExpression: "Buget = suprafață x cost/mp + rezervă",
    formulaDescription:
      "Calculatorul folosește un cost mediu pe mp și adaugă o rezervă procentuală pentru a aproxima mai prudent bugetul de renovare.",
    howToSteps: [
      "Introdu suprafață care intră în renovare.",
      "Introdu costul estimat pe mp și rezervă dorită.",
      "Citește bugetul de bază, rezervă și totalul proiectului.",
    ],
    inputs: [
      {
        name: "area",
        label: "Suprafață renovată",
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
        label: "Rezervă",
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
      { name: "baseBudget", label: "Buget de bază", unit: "lei", decimals: 2 },
      { name: "contingencyAmount", label: "Rezervă", unit: "lei", decimals: 2 },
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
      "Estimează bugetul de mobilare și electrocasnice pornind de la numărul de camere și o rezervă de buget.",
    formulaName: "Buget mobilare",
    formulaExpression: "Buget = camere x buget/camera + electrocasnice + rezervă",
    formulaDescription:
      "Calculatorul transformă o estimare pe camera într-un buget total și adaugă separat costul pentru electrocasnice și o marjă de rezervă.",
    howToSteps: [
      "Introdu numărul de camere și bugetul estimat per camera.",
      "Adaugă bugetul pentru electrocasnice și rezervă dorită.",
      "Citește bugetul de bază și totalul recomandat.",
    ],
    inputs: [
      {
        name: "rooms",
        label: "Număr camere",
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
        label: "Rezervă",
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
      { name: "baseBudget", label: "Buget de bază", unit: "lei", decimals: 2 },
      { name: "contingencyAmount", label: "Rezervă", unit: "lei", decimals: 2 },
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
    title: "Calculator buget lunar locuință",
    slug: "calculator-buget-lunar-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Adună chiria sau rata cu utilitățile, administrarea, mentenanță și asigurarea pentru a vedea costul lunar total al locuirii.",
    formulaName: "Buget lunar locuință",
    formulaExpression:
      "Cost lunar total = rata sau chirie + utilități + administrare + mentenanță + asigurare",
    formulaDescription:
      "Calculatorul adună principalele costuri recurente ale unei locuințe pentru a oferi o imagine mai realistă a presiunii lunare asupra bugetului.",
    howToSteps: [
      "Introdu rata sau chiria lunară.",
      "Adaugă utilitățile și celelalte costuri recurente.",
      "Citește costul lunar și anual al locuinței.",
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
        label: "Utilități",
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
        label: "Rezervă mentenanță",
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
    title: "Calculator negociere preț proprietate",
    slug: "calculator-negociere-pret-proprietate",
    categorySlug: "imobiliare",
    summary:
      "Arată rapid prețul negociat și economia obținută pornind de la prețul cerut și discountul estimat.",
    formulaName: "Negociere preț",
    formulaExpression: "Preț negociat = preț cerut x (1 - discount%); economie = diferență",
    formulaDescription:
      "Calculatorul transformă un discount procentual într-o economie concretă și într-un preț final de comparat cu alte anunțuri.",
    howToSteps: [
      "Introdu prețul cerut al proprietății.",
      "Introdu discountul pe care vrei să-l testezi.",
      "Citește prețul negociat și economia potențială.",
    ],
    inputs: [
      {
        name: "askingPrice",
        label: "Preț cerut",
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
      { name: "negotiatedPrice", label: "Preț negociat", unit: "lei", decimals: 2 },
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
    title: "Calculator spațiu pe persoană",
    slug: "calculator-spatiu-pe-persoana",
    categorySlug: "imobiliare",
    summary:
      "Raportează suprafață utilă și numărul de camere la numărul de persoane din locuință pentru o comparație mai practică.",
    formulaName: "Spațiu pe persoană",
    formulaExpression:
      "mp/persoană = suprafață utilă / persoane; camere/persoană = camere / persoane",
    formulaDescription:
      "Calculatorul transformă suprafață și numărul de camere într-un reper simplu pentru compararea configurațiilor de locuire.",
    howToSteps: [
      "Introdu suprafață utilă și numărul de camere.",
      "Introdu numărul de persoane care vor folosi locuință.",
      "Citește suprafață și camerele disponibile per persoană.",
    ],
    inputs: [
      {
        name: "usableArea",
        label: "Suprafață utilă",
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
        label: "Număr camere",
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
        label: "Număr persoane",
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
      { name: "sqmPerPerson", label: "mp per persoană", unit: "mp", decimals: 2 },
      { name: "roomsPerPerson", label: "Camere per persoană", decimals: 2 },
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
    title: "Calculator buffer rata locuință",
    slug: "calculator-buffer-rata-locuinta",
    categorySlug: "imobiliare",
    summary:
      "Arată ce spațiu rămâne în buget după costul locuinței și o rezervă minimă de siguranță.",
    formulaName: "Buffer după costul locuinței",
    formulaExpression:
      "Buffer = venit net - cost locuință; buffer după rezervă = buffer - venit x rezervă%",
    formulaDescription:
      "Calculatorul nu spune dacă o locuință este automat accesibilă, dar arată rapid cât spațiu lunar mai rămâne după costul principal și o rezervă prudentă.",
    howToSteps: [
      "Introdu venitul lunar net al gospodăriei.",
      "Introdu costul lunar al locuinței și rezervă de siguranță dorită.",
      "Citește ponderea locuinței în venit și bufferul ramas după rezervă.",
    ],
    inputs: [
      {
        name: "householdNetIncome",
        label: "Venit net gospodărie",
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
        label: "Cost lunar locuință",
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
        label: "Rezervă minimă",
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
      { name: "housingSharePercent", label: "Pondere locuință", unit: "%", decimals: 2 },
      { name: "monthlyBuffer", label: "Buffer ramas", unit: "lei", decimals: 2 },
      { name: "bufferAfterReserve", label: "Buffer după rezervă", unit: "lei", decimals: 2 },
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
      "Calculează randamentul brut și net din chirie pornind de la prețul proprietății, chiria lunară și costurile anuale.",
    formulaName: "Randament chirie",
    formulaExpression:
      "Randament brut = chirie anuală / preț; randament net = (chirie anuală - costuri) / preț",
    formulaDescription:
      "Calculatorul separă randamentul brut de cel net pentru a arăta mai clar ce rămâne după costurile recurente.",
    howToSteps: [
      "Introdu prețul proprietății și chiria lunară estimată.",
      "Adaugă costurile anuale recurente asociate închirierii.",
      "Citește randamentul brut, randamentul net și venitul net anual.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Preț proprietate",
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
        label: "Chirie lunară",
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
    title: "Calculator randament capital propriu",
    slug: "calculator-randament-capital-propriu",
    categorySlug: "imobiliare",
    summary:
      "Compară fluxul anual de numerar cu banii proprii investiți într-o proprietate pentru a estima randamentul cash-on-cash.",
    formulaName: "Cash-on-cash return",
    formulaExpression: "CoC = flux net anual / capital propriu investit",
    formulaDescription:
      "Calculatorul raportează fluxul net anual la banii proprii blocați în achiziție, renovare și costuri inițiale.",
    howToSteps: [
      "Introdu fluxul net anual estimat după costuri.",
      "Introdu capitalul propriu investit în proiect.",
      "Citește randamentul cash-on-cash și echivalentul lunar al fluxului.",
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
    title: "Calculator pierdere din vacanță",
    slug: "calculator-pierdere-din-vacanta-la-inchiriere",
    categorySlug: "imobiliare",
    summary:
      "Estimează cât venit se pierde anual din lunile sau procentele de neocupare ale unei proprietăți de închiriat.",
    formulaName: "Pierdere din vacanță",
    formulaExpression:
      "Pierdere anuală = chirie anuală potențială x rata de neocupare",
    formulaDescription:
      "Calculatorul transformă rata de neocupare într-o pierdere anuală ușor de comparat cu randamentul sau cu costurile fixe ale proprietății.",
    howToSteps: [
      "Introdu chiria lunară potențială.",
      "Introdu rata de neocupare estimată.",
      "Citește pierderea anuală și chiria efectiv colectată.",
    ],
    inputs: [
      {
        name: "monthlyRent",
        label: "Chirie lunară potențială",
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
        label: "Pierdere anuală",
        unit: "lei/an",
        decimals: 2,
      },
      {
        name: "collectedAnnualRent",
        label: "Chirie anuală colectată",
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
    title: "Calculator creștere chirie",
    slug: "calculator-crestere-chirie",
    categorySlug: "imobiliare",
    summary:
      "Proiectează cum se schimbă chiria lunară în timp când aplici un ritm anual de creștere.",
    formulaName: "Creștere chirie",
    formulaExpression: "Chirie viitoare = chirie curentă x (1 + creștere)^ani",
    formulaDescription:
      "Calculatorul folosește o creștere anuală compusă pentru a arăta cum evoluează chiria într-un interval de timp ales.",
    howToSteps: [
      "Introdu chiria lunară curentă.",
      "Introdu creșterea anuală și numărul de ani.",
      "Citește chiria lunară proiectată și creșterea absolută.",
    ],
    inputs: [
      {
        name: "currentRent",
        label: "Chirie curentă",
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
        label: "Creștere anuală",
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
      { name: "projectedRent", label: "Chirie proiectată", unit: "lei/luna", decimals: 2 },
      { name: "increaseAmount", label: "Creștere absolută", unit: "lei/luna", decimals: 2 },
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
      "Compară costul total al unui proiect de revânzare cu prețul de ieșire pentru a estima profitul și marja.",
    formulaName: "Marja flip imobiliar",
    formulaExpression: "Profit = preț vânzare - cost total; Marja = profit / preț vânzare",
    formulaDescription:
      "Calculatorul adună prețul de achiziție, renovarea și costurile de deținere pentru a vedea ce rămâne la vânzare.",
    howToSteps: [
      "Introdu prețul de achiziție, renovarea și costurile de deținere.",
      "Introdu prețul de vânzare estimat.",
      "Citește costul total, profitul și marja proiectului.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Preț achiziție",
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
        label: "Costuri deținere",
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
        label: "Preț vânzare",
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
      "Estimează costul administrării unei proprietăți de închiriat pornind de la chirie, comision și costurile fixe de operare.",
    formulaName: "Cost administrare proprietate",
    formulaExpression: "Cost administrare = chirie x comision + cost fix",
    formulaDescription:
      "Calculatorul adună comisionul variabil aplicat la chirie cu costurile fixe de administrare pentru a estima costul anual.",
    howToSteps: [
      "Introdu chiria lunară estimată și procentul de administrare.",
      "Adaugă eventualele costuri fixe lunare.",
      "Citește costul lunar și anual al administrării.",
    ],
    inputs: [
      {
        name: "monthlyRent",
        label: "Chirie lunară",
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
    title: "Calculator pondere costuri închidere",
    slug: "calculator-pondere-costuri-inchidere",
    categorySlug: "imobiliare",
    summary:
      "Arată ce pondere au costurile de închidere în prețul proprietății și cât capital total trebuie alocat la start.",
    formulaName: "Pondere costuri închidere",
    formulaExpression:
      "Pondere = costuri închidere / preț proprietate; total initial = preț + costuri",
    formulaDescription:
      "Calculatorul transformă costurile de închidere într-o pondere ușor de comparat între scenarii și arată capitalul initial total.",
    howToSteps: [
      "Introdu prețul proprietății și costurile de închidere estimate.",
      "Citește ponderea lor în preț și suma totală alocată la start.",
      "Compară mai multe scenarii dacă ai variante diferite de finanțare sau tranzacție.",
    ],
    inputs: [
      {
        name: "purchasePrice",
        label: "Preț proprietate",
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
        label: "Costuri închidere",
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
    title: "Calculator venit închiriere pe camera",
    slug: "calculator-venit-inchiriere-pe-camera",
    categorySlug: "imobiliare",
    summary:
      "Estimează venitul lunar și anual când închiriezi pe camera, pornind de la numărul de camere, chiria per camera și gradul de ocupare.",
    formulaName: "Venit închiriere pe camera",
    formulaExpression:
      "Venit lunar = camere x chirie/camera x ocupare; venit anual = venit lunar x 12",
    formulaDescription:
      "Calculatorul folosește numărul de camere și gradul de ocupare pentru a aproxima venitul posibil din închirierea pe camera.",
    howToSteps: [
      "Introdu numărul de camere închiriate și chiria lunară per camera.",
      "Introdu gradul de ocupare mediu.",
      "Citește venitul lunar și anual estimat.",
    ],
    inputs: [
      {
        name: "roomsRented",
        label: "Camere închiriate",
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
      "Adună administrarea, reparațiile și asigurarea pentru a vedea costul anual recurent al unei proprietăți.",
    formulaName: "Costuri recurente proprietate",
    formulaExpression:
      "Cost anual = administrare lunară x 12 + reparații anuale + asigurare anuală",
    formulaDescription:
      "Calculatorul este util pentru bugetarea costurilor recurente atunci când compari randamentul sau presiunea pe cash-flow.",
    howToSteps: [
      "Introdu costul lunar de administrare.",
      "Adaugă reparațiile și asigurarea anuală.",
      "Citește costul anual total și media lunară aferentă.",
    ],
    inputs: [
      {
        name: "monthlyServiceCharge",
        label: "Administrare lunară",
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
        label: "Reparații anuale",
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
        label: "Asigurare anuală",
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
      { name: "monthlyAverage", label: "Medie lunară", unit: "lei/luna", decimals: 2 },
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
    slug: "calculator-prag-ocupare-rentabil",
    categorySlug: "imobiliare",
    summary:
      "Arată ce grad minim de ocupare îți trebuie ca să acoperi costurile fixe lunare ale unei proprietăți de închiriat.",
    formulaName: "Prag ocupare rentabil",
    formulaExpression:
      "Ocupare break-even = costuri fixe lunare / venit potential lunar",
    formulaDescription:
      "Calculatorul transformă costurile fixe și chiria potențială într-un prag minim de ocupare util pentru scenarii prudente.",
    howToSteps: [
      "Introdu costurile fixe lunare ale proprietății.",
      "Introdu venitul lunar potential la ocupare completă.",
      "Citește pragul minim de ocupare și bufferul ramas la ocupare completă.",
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
        label: "Buffer la ocupare completă",
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
