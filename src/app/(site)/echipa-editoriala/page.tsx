import { buildMetadata } from "@/lib/seo";
import { editorialTeamRoles, organizationConfig } from "@/lib/site";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Echipa editoriala",
  description: "Rolurile editoriale care raspund de documentare, verificare, publicare si corectii in platforma Calculatoare Online.",
  path: "/echipa-editoriala",
});

export default function EditorialTeamPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="paper-panel rounded-[2.4rem] p-6 sm:p-8">
        <p className="section-kicker">Echipa editoriala</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
          Continutul este sustinut de roluri editoriale clare, astfel incat responsabilitatea sa ramana vizibila.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">
          Pagina aceasta prezinta functiile editoriale care raspund de verificarea formulelor, calitatea explicatiilor,
          legaturile interne si fluxul de corectii. Pentru un site utilitar, transparenta nu este optionala.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {editorialTeamRoles.map((role) => (
          <article key={role.title} className="paper-panel rounded-[2rem] p-6">
            <p className="section-kicker">Rol</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">{role.title}</h2>
            <p className="mt-4 text-sm leading-8 text-slate-700">{role.responsibility}</p>
          </article>
        ))}
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-950">Cum intra feedback-ul in procesul editorial</h2>
            <p className="mt-4 text-sm leading-8 text-slate-700">
              Sesizarile trimise de utilizatori pot duce la corectii de formula, clarificari editoriale, actualizari de FAQ sau ajustari ale linking-ului intern. Pentru erori clare, prioritatea este verificarea rapida si actualizarea paginii afectate.
            </p>
          </div>
          <div className="grid gap-3">
            <a href={`mailto:${organizationConfig.correctionsEmail}`} className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">
              Trimite un mesaj la {organizationConfig.correctionsEmail}
            </a>
            <Link href="/politica-editoriala" className="rounded-[1.4rem] border border-slate-300 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-800 hover:border-emerald-300 hover:text-emerald-700">
              Vezi politica editoriala
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
