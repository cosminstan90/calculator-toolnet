import type { CalculatorCategory } from "@/lib/content";
import Link from "next/link";

type CategoryCardDoc = Pick<CalculatorCategory, "id" | "name" | "slug" | "summary">;

type CategoryCardProps = {
  category: CategoryCardDoc;
};

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link
      href={`/calculatoare/${category.slug}`}
      className="group relative overflow-hidden rounded-[1.9rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(255,252,247,0.96)_0%,rgba(247,241,232,0.86)_100%)] p-6 text-slate-950 shadow-[0_22px_80px_-55px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300"
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[2rem] bg-[radial-gradient(circle,rgba(124,227,189,0.26),transparent_70%)] opacity-80 transition duration-300 group-hover:scale-110" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
        Categorie
      </p>
      <h3 className="relative mt-3 text-3xl font-black tracking-tight text-slate-950">{category.name}</h3>
      <p className="relative mt-4 max-w-sm text-sm leading-7 text-slate-700">{category.summary}</p>
      <div className="relative mt-8 flex items-center justify-between border-t border-slate-300/70 pt-4 text-sm font-semibold text-slate-700">
        <span>Vezi hub-ul</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">/</span>
      </div>
    </Link>
  );
};
