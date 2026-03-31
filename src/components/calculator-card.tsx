import type { CalculatorDoc } from "@/lib/content";
import { buildCalculatorPath } from "@/lib/content";
import Link from "next/link";

type CalculatorCardDoc = Pick<
  CalculatorDoc,
  "id" | "title" | "slug" | "shortDescription" | "category"
>;

type CalculatorCardProps = {
  calculator: CalculatorCardDoc;
};

export const CalculatorCard = ({ calculator }: CalculatorCardProps) => {
  return (
    <Link
      href={buildCalculatorPath(calculator)}
      className="group relative overflow-hidden rounded-[1.75rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.85)_0%,rgba(248,243,235,0.82)_100%)] p-5 text-slate-950 shadow-[0_22px_80px_-55px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {calculator.category?.name ?? "Calculator"}
      </p>
      <h3 className="mt-3 text-[1.8rem] font-black leading-tight text-slate-950">{calculator.title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-700">{calculator.shortDescription}</p>
      <div className="mt-8 flex items-center justify-between border-t border-slate-300/70 pt-4 text-sm font-semibold text-emerald-700">
        <span>Deschide calculatorul</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">+</span>
      </div>
    </Link>
  );
};
