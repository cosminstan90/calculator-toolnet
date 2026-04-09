"use client";

import dynamic from "next/dynamic";

const CalculatorRunner = dynamic(
  () => import("@/components/calculator-runner").then((mod) => mod.CalculatorRunner),
  {
    ssr: false,
    loading: () => (
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-60px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Input
          </p>
          <div className="mt-5 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`input-skeleton-${index}`} className="grid gap-2">
                <div className="h-4 w-40 rounded-full bg-white/12" />
                <div className="h-12 rounded-[1.35rem] border border-white/10 bg-white/6" />
              </div>
            ))}
          </div>
        </div>

        <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="h-3 w-28 rounded-full bg-emerald-100" />
              <div className="mt-3 h-10 w-72 rounded-full bg-slate-200" />
              <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-slate-200" />
              <div className="mt-2 h-4 w-full max-w-lg rounded-full bg-slate-200" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`output-skeleton-${index}`}
                  className="rounded-[1.4rem] border border-slate-300/70 bg-white/70 p-4"
                >
                  <div className="h-3 w-24 rounded-full bg-slate-200" />
                  <div className="mt-3 h-8 w-32 rounded-full bg-slate-200" />
                  <div className="mt-3 h-4 w-full rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
  }
);

type CalculatorRunnerLazyProps = {
  calculatorKey: string;
};

export const CalculatorRunnerLazy = ({ calculatorKey }: CalculatorRunnerLazyProps) => {
  return <CalculatorRunner calculatorKey={calculatorKey} />;
};
