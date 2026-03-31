import type { CalculatorCategory } from "@/lib/content";
import Link from "next/link";

type SiteHeaderProps = {
  categories: CalculatorCategory[];
};

export const SiteHeader = ({ categories }: SiteHeaderProps) => {
  const primaryLinks = [
    { href: "/calculatoare", label: "Calculatoare" },
    { href: "/blog", label: "Blog" },
    { href: "/metodologie", label: "Metodologie" },
    { href: "/echipa-editoriala", label: "Echipa" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/82 backdrop-blur-2xl">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.34em] text-emerald-300/85">
                Formule explicate + tool-uri utile
              </span>
              <span className="block truncate text-lg font-black tracking-tight text-white sm:text-2xl">
                Calculatoare Online
              </span>
            </Link>
            <nav className="hidden items-center gap-4 xl:flex">
              {primaryLinks.slice(0, 3).map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
              {categories.slice(0, 3).map((category) => (
                <Link
                  key={category.id}
                  href={`/calculatoare/${category.slug}`}
                  className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
              {primaryLinks.slice(3).map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <form action="/calculatoare" method="get" className="hidden xl:block">
              <label className="sr-only" htmlFor="global-search">
                Cauta calculator
              </label>
              <input
                id="global-search"
                type="search"
                name="q"
                placeholder="Cauta un calculator"
                className="w-56 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white placeholder:text-slate-400 outline-none ring-emerald-300 transition focus:ring"
              />
            </form>
            <Link
              href="/calculatoare"
              className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Exploreaza
            </Link>
          </div>
        </div>

        <nav className="-mx-1 no-scrollbar flex gap-2 overflow-x-auto pb-4 xl:hidden">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200"
            >
              {link.label}
            </Link>
          ))}
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/calculatoare/${category.slug}`}
              className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
