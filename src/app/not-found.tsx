import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-[980px] px-4 py-14 sm:px-6 lg:px-8">
      <section className="paper-panel rounded-[2rem] p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700">
          404
        </p>
        <h1 className="mt-4 text-4xl font-black text-slate-950">Pagina cautata nu a fost gasita</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">
          Adresa poate fi veche, scrisa gresit sau inca nemigrata. Cererea a fost inregistrata pentru monitorizare,
          astfel incat sa putem adauga redirect-ul potrivit daca pagina are in continuare valoare pentru utilizatori.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/calculatoare"
            className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-slate-950"
          >
            Vezi calculatoarele
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Citeste ghidurile
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Raporteaza problema
          </Link>
        </div>
      </section>
    </div>
  );
}
