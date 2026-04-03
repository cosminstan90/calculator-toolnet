import type { CommercialCta } from "@/lib/commercial-cta";

type CommercialCtaPanelProps = {
  cta: CommercialCta;
};

export const CommercialCtaPanel = ({ cta }: CommercialCtaPanelProps) => {
  return (
    <section className="rounded-[2rem] border border-amber-300/35 bg-[linear-gradient(180deg,rgba(255,251,235,0.96)_0%,rgba(254,243,199,0.72)_100%)] p-6 text-slate-950 shadow-[0_30px_90px_-60px_rgba(161,98,7,0.45)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700">
        Pas comercial urmator
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <h2 className="text-2xl font-black leading-tight sm:text-3xl">{cta.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">{cta.body}</p>
          {cta.disclaimer ? (
            <p className="mt-4 text-xs leading-6 text-slate-600">{cta.disclaimer}</p>
          ) : null}
        </div>
        <div className="flex lg:justify-end">
          <a
            href={cta.href}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            {cta.label}
          </a>
        </div>
      </div>
    </section>
  );
};
