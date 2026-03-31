import { creatorConfig, organizationConfig } from "@/lib/site";
import Link from "next/link";

const trustLinks = [
  { href: "/despre-noi", label: "Despre proiect" },
  { href: "/echipa-editoriala", label: "Echipa editoriala" },
  { href: "/metodologie", label: "Metodologie" },
  { href: "/politica-editoriala", label: "Politica editoriala" },
  { href: "/contact", label: "Contact" },
];

export const SiteFooter = () => {
  return (
    <footer className="mt-24 border-t border-white/10 bg-slate-950 text-slate-200">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-14 sm:px-6 lg:px-8">
        <section className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-emerald-300/85">
              Transparenta editoriala
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Fiecare calculator trebuie sa fie usor de folosit, usor de verificat si usor de corectat atunci cand apare o eroare.
            </h2>
          </div>
          <div className="grid gap-3 text-sm leading-7 text-slate-300 sm:grid-cols-2">
            <p>{organizationConfig.trustSummary}</p>
            <p>De aceea pastram vizibile metodologia, politica editoriala, datele de contact si responsabilitatile echipei editoriale.</p>
          </div>
        </section>

        <div className="grid gap-10 py-12 lg:grid-cols-[1fr_0.9fr_0.9fr_0.9fr]">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-300/75">
              {organizationConfig.projectName}
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Platforma combina calculatoare functionale, explicatii clare, exemple practice si publicare editoriala controlata, astfel incat fiecare pagina sa poata ajuta atat utilizatorul, cat si cresterea organica a site-ului.
            </p>
          </section>
          <section>
            <h3 className="text-base font-bold text-white">Navigare</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li><Link href="/" className="hover:text-white">Acasa</Link></li>
              <li><Link href="/calculatoare" className="hover:text-white">Calculatoare</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </section>
          <section>
            <h3 className="text-base font-bold text-white">Incredere</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {trustLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-base font-bold text-white">Contact rapid</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li><a href={`mailto:${organizationConfig.supportEmail}`} className="hover:text-white">{organizationConfig.supportEmail}</a></li>
              <li>Feedback editorial, corectii si colaborari</li>
            </ul>
          </section>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400">
        <div>{new Date().getFullYear()} {organizationConfig.projectName}. Un proiect {organizationConfig.legalName}.</div>
        <div className="mt-1">
          Website creat de{" "}
          <a
            href={creatorConfig.url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-slate-300 hover:text-white"
          >
            {creatorConfig.name}
          </a>
          .
        </div>
      </div>
    </footer>
  );
};
