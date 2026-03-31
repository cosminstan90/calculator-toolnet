import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Politica editoriala",
  description: "Regulile dupa care publicam, actualizam si corectam continutul din platforma Calculatoare Online.",
  path: "/politica-editoriala",
});

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="paper-panel rounded-[2.4rem] p-6 sm:p-8">
        <p className="section-kicker">Politica editoriala</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">Publicam pagini care merita sa fie folosite si revizuite in timp.</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">
          Politica editoriala stabileste criteriile minime pentru continut, actualizari, corectii si controlul calitatii. Scopul ei este sa mentina utilitatea si coerenta site-ului pe termen lung.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">Corectitudine si limite explicate</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Daca o formula are limite, acestea sunt mentionate clar. Daca un rezultat este orientativ, nu il prezentam ca adevar absolut.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">Review inainte de publicare</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Articolele si calculatoarele noi intra in draft, sunt revizuite si abia apoi publicate gradual in functie de prioritate si maturitatea continutului.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">Corectii si actualizari continue</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Sesizarile utilizatorilor sunt tratate prioritar atunci cand afecteaza formula, interpretarea, FAQ-ul sau traseele importante de navigare.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">Evitarea thin content</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Nu publicam pagini care afiseaza doar un formular. Fiecare URL trebuie sa aiba explicatie, exemple, FAQ si linking contextual relevant.
          </p>
        </article>
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-950">Semnale de incredere care raman vizibile</h2>
            <p className="mt-4 text-sm leading-8 text-slate-700">
              Pagina despre proiect, echipa editoriala, metodologia si contactul fac parte din acelasi strat de incredere. Ele completeaza calculatoarele si arata cum este mentinut continutul dupa lansare.
            </p>
          </div>
          <div className="grid gap-3">
            <Link href="/echipa-editoriala" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">Echipa editoriala</Link>
            <Link href="/contact" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">Trimite feedback sau corectii</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
