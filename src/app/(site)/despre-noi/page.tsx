import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { organizationConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Despre proiect",
  description: "Afla de ce exista Calculatoare Online, cum este construit site-ul si ce principii urmareste in publicare.",
  path: "/despre-noi",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(124,227,189,0.22),transparent_28%),linear-gradient(135deg,rgba(5,11,20,0.98)_0%,rgba(9,20,33,0.96)_52%,rgba(19,35,49,0.94)_100%)]" />
        <div className="relative max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">Despre proiect</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Un hub de calculatoare online construit pentru raspunsuri rapide si pagini credibile.</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            {organizationConfig.trustSummary} Scopul platformei este sa transforme cautarile utile in pagini clare,
            cu formule explicate, exemple practice si legaturi catre resurse relevante.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">Ce publicam</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Calculatoare pentru nutritie si antrenament, auto, energie si conversii, completate de ghiduri care explica rezultatele si scenariile in care merita sa refaci calculul.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">Cum lucram</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Folosim un flux editorial cu draft, review, launch waves si monitorizare post-publicare, astfel incat paginile noi sa intre controlat in site.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">Ce promitem</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Nu prezentam un calculator ca adevar absolut atunci cand rezultatul este doar estimativ. Explicam limitele si oferim utilizatorului suficiente indicii pentru interpretare corecta.
          </p>
        </article>
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <p className="section-kicker">Transparenta</p>
            <h2 className="mt-4 text-3xl font-black text-slate-950">Increderea vine din claritatea procesului, nu doar din design.</h2>
            <p className="mt-4 text-sm leading-8 text-slate-700">
              De aceea publicam pagina despre proiect, metodologia de lucru, politica editoriala, datele de contact si rolurile editoriale care raspund de verificare si corectii.
            </p>
          </div>
          <div className="grid gap-3">
            <Link href="/metodologie" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">Vezi metodologia</Link>
            <Link href="/echipa-editoriala" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">Vezi echipa editoriala</Link>
            <Link href="/contact" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">Contact si corectii</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
