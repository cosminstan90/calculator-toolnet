"use client";

import { AudienceBadge } from "@/components/audience-badge";
import type { CalculatorDoc } from "@/lib/content";
import Link from "next/link";
import { useMemo, useState } from "react";

type CalculatorCardDoc = Pick<
  CalculatorDoc,
  "id" | "title" | "slug" | "shortDescription" | "category" | "audience"
>;

type CalculatorsIndexExplorerProps = {
  calculators: CalculatorCardDoc[];
  initialQuery?: string;
};

export const CalculatorsIndexExplorer = ({
  calculators,
  initialQuery = "",
}: CalculatorsIndexExplorerProps) => {
  const [query, setQuery] = useState(initialQuery);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCalculators = useMemo(() => {
    if (!normalizedQuery) {
      return calculators;
    }

    return calculators.filter((calculator) =>
      `${calculator.title} ${calculator.shortDescription} ${calculator.category?.name ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [calculators, normalizedQuery]);

  return (
    <>
      <form
        className="rounded-[1.8rem] border border-white/12 bg-white/6 p-5 backdrop-blur"
        onSubmit={(event) => event.preventDefault()}
      >
        <label
          htmlFor="hub-search"
          className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/85"
        >
          Cauta un calculator
        </label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            id="hub-search"
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="BMI, TDEE, consum, kW in CP..."
            className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none ring-emerald-300 transition focus:ring"
          />
          <button
            type="submit"
            className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
          >
            Cauta
          </button>
        </div>
      </form>

      <section className="cv-auto mt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Index complet</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">
              {normalizedQuery ? `Rezultate pentru "${query.trim()}"` : "Toate calculatoarele disponibile"}
            </h2>
          </div>
          <p className="text-sm text-slate-600">{filteredCalculators.length} rezultate</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredCalculators.map((calculator) => (
            <Link
              key={calculator.id}
              href={calculator.category?.slug ? `/calculatoare/${calculator.category.slug}/${calculator.slug}` : "/calculatoare"}
              className="group relative overflow-hidden rounded-[1.75rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.85)_0%,rgba(248,243,235,0.82)_100%)] p-5 text-slate-950 shadow-[0_22px_80px_-55px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                {calculator.category?.name ?? "Calculator"}
              </p>
              <div className="mt-3">
                <AudienceBadge audience={calculator.audience} />
              </div>
              <h3 className="mt-3 text-[1.8rem] font-black leading-tight text-slate-950">
                {calculator.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-700">{calculator.shortDescription}</p>
              <div className="mt-8 flex items-center justify-between border-t border-slate-300/70 pt-4 text-sm font-semibold text-emerald-700">
                <span>Deschide calculatorul</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">+</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};
