"use client";

import {
  getCalculatorDefinition,
  type CalculatorInputDefinition,
  type CalculatorKey,
} from "@/lib/calculator-registry";
import { useMemo, useState } from "react";

type CalculatorRunnerProps = {
  calculatorKey: string;
};

const buildInitialValues = (inputs: CalculatorInputDefinition[]) => {
  return inputs.reduce<Record<string, number | string>>((acc, input) => {
    acc[input.name] =
      typeof input.defaultValue === "undefined"
        ? input.type === "number"
          ? 0
          : ""
        : input.defaultValue;
    return acc;
  }, {});
};

const formatValue = (value: number, decimals = 2) => {
  return value.toLocaleString("ro-RO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const CalculatorRunner = ({ calculatorKey }: CalculatorRunnerProps) => {
  const definition = useMemo(() => {
    return getCalculatorDefinition(calculatorKey as CalculatorKey);
  }, [calculatorKey]);

  const [values, setValues] = useState<Record<string, number | string>>(() =>
    buildInitialValues(definition.inputs)
  );

  const outputs = useMemo(() => definition.compute(values), [definition, values]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-60px_rgba(15,23,42,0.9)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
          Input
        </p>
        <div className="mt-5 grid gap-4">
          {definition.inputs.map((input) => (
            <label key={input.name} className="block">
              <span className="mb-2 block text-sm font-semibold text-white">
                {input.label}
                {input.unit ? ` (${input.unit})` : ""}
              </span>
              {input.type === "select" ? (
                <select
                  value={String(values[input.name] ?? "")}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [input.name]: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.35rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none ring-emerald-300 transition focus:ring"
                >
                  {input.options?.map((option) => (
                    <option key={option.value} value={option.value} className="text-slate-950">
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={String(values[input.name] ?? "")}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [input.name]: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.35rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none ring-emerald-300 transition focus:ring"
                />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Rezultate instant
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Valorile se actualizeaza imediat</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Rezultatele sunt afisate live, iar blocul de formula de mai jos iti arata exact modelul folosit in calcul.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {definition.outputs.map((output) => (
              <article
                key={output.name}
                className="rounded-[1.4rem] border border-slate-300/70 bg-white/70 p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {output.label}
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {formatValue(outputs[output.name] ?? 0, output.decimals ?? 2)}
                  {output.unit ? (
                    <span className="ml-2 text-sm font-semibold text-slate-500">
                      {output.unit}
                    </span>
                  ) : null}
                </p>
                {output.description ? (
                  <p className="mt-2 text-sm leading-6 text-slate-700">{output.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-[1.4rem] border border-emerald-200/80 bg-emerald-50/75 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Formula folosita
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{definition.formulaExpression}</p>
        </div>
      </div>
    </section>
  );
};
