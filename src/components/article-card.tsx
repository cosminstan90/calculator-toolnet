import type { Article } from "@/lib/content";
import { buildArticlePath } from "@/lib/content";
import Link from "next/link";

type ArticleCardDoc = Pick<Article, "id" | "slug" | "title" | "excerpt" | "articleType">;

type ArticleCardProps = {
  article: ArticleCardDoc;
};

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link
      href={buildArticlePath(article.slug)}
      className="group block rounded-[1.75rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(255,252,247,0.96)_0%,rgba(248,243,235,0.82)_100%)] p-5 text-slate-950 shadow-[0_22px_80px_-55px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
        {article.articleType}
      </p>
      <h3 className="mt-3 text-[1.9rem] font-black leading-tight text-slate-950">{article.title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-700">{article.excerpt}</p>
      <div className="mt-8 border-t border-slate-300/70 pt-4 text-sm font-semibold text-slate-700 transition-colors group-hover:text-emerald-700">
        Citeste ghidul
      </div>
    </Link>
  );
};
