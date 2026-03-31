import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Metodologie",
  description: "Principiile dupa care sunt construite calculatoarele, continutul explicativ si linking-ul intern in Calculatoare Online.",
  path: "/metodologie",
});

export default function MethodologyPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="paper-panel rounded-[2.4rem] p-6 sm:p-8">
        <p className="section-kicker">Metodologie</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">Cum construim paginile astfel incat rezultatul sa fie util, nu doar instant.</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">
          Metodologia publica arata cum alegem formulele, cum explicam limitele de utilizare si cum construim o pagina completa in jurul unui calculator online.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">1. Formula si limitele ei</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Fiecare calculator trebuie sa porneasca de la o formula verificabila si sa explice unde rezultatul este estimativ, nu decisiv.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">2. Exemple si interpretare</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Un numar nu ajuta suficient daca nu este pus in context. De aceea adaugam exemple de calcul si note despre interpretarea uzuala a rezultatului.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">3. FAQ si context editorial</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Fiecare pagina trebuie sa raspunda si intrebarilor din jurul formulei, nu doar sa afiseze un rezultat. FAQ-ul si continutul contextual reduc ambiguitatea.
          </p>
        </article>
        <article className="paper-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-950">4. Linking intern relevant</h2>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            Legaturile interne trebuie sa continue intentia: catre calculatoare similare, hub-ul categoriei si articole care adauga context util.
          </p>
        </article>
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-950">Publicare in valuri si verificare continua</h2>
            <p className="mt-4 text-sm leading-8 text-slate-700">
              Continutul ramane in draft pana trece de review. Publicam gradual, urmarim 404-urile, redirect-urile si eventualele corectii primite de la utilizatori dupa lansare.
            </p>
          </div>
          <div className="grid gap-3">
            <Link href="/politica-editoriala" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">Politica editoriala</Link>
            <Link href="/contact" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">Trimite feedback</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
