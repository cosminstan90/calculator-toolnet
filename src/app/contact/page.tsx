import { buildMetadata } from "@/lib/seo";
import { organizationConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Date de contact pentru intrebari, feedback editorial, corectii si colaborari legate de Calculatoare Online.",
  path: "/contact",
});

const channels = [
  {
    title: "Intrebari generale",
    value: organizationConfig.supportEmail,
    detail: "Scrie-ne pentru intrebari despre site, sugestii de imbunatatire sau probleme de navigare.",
  },
  {
    title: "Corectii si erori",
    value: organizationConfig.correctionsEmail,
    detail: "Foloseste aceeasi adresa daca observi o formula gresita, o explicatie neclara sau un link care trimite prost.",
  },
  {
    title: "Editorial si colaborari",
    value: organizationConfig.editorialEmail,
    detail: "Aceeasi adresa este folosita si pentru propuneri editoriale, colaborari sau idei de calculatoare noi.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(124,227,189,0.22),transparent_28%),linear-gradient(135deg,rgba(5,11,20,0.98)_0%,rgba(9,20,33,0.96)_52%,rgba(19,35,49,0.94)_100%)]" />
        <div className="relative max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">Contact</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Ne poti scrie direct pentru intrebari, corectii sau colaborari.</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Daca observi o formula gresita, o explicatie insuficienta sau o pagina care merita revizuita, foloseste adresa de mai jos.
            Mesajele ajung in fluxul de revizie si ne ajuta sa pastram continutul clar si actualizat.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {channels.map((channel) => (
          <article key={channel.title} className="paper-panel rounded-[2rem] p-6">
            <p className="section-kicker">Canal</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">{channel.title}</h2>
            <a href={`mailto:${channel.value}`} className="mt-4 block text-base font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4">
              {channel.value}
            </a>
            <p className="mt-3 text-sm leading-8 text-slate-700">{channel.detail}</p>
          </article>
        ))}
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <h2 className="text-3xl font-black text-slate-950">Cum ne ajuta un mesaj bun</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <p className="text-sm leading-8 text-slate-700">
            Daca raportezi o eroare de calcul, include URL-ul paginii, valorile introduse si rezultatul pe care il consideri corect. Cu cat contextul este mai clar, cu atat putem verifica mai repede.
          </p>
          <p className="text-sm leading-8 text-slate-700">
            Pentru propuneri editoriale sau comerciale, spune-ne ce categorie te intereseaza si care este scopul mesajului. Asta ne ajuta sa prioritizam raspunsul corect.
          </p>
        </div>
      </section>
    </div>
  );
}
