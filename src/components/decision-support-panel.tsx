import type { DecisionSupportData } from "@/lib/decision-support";

type DecisionSupportPanelProps = {
  data: DecisionSupportData;
};

export const DecisionSupportPanel = ({ data }: DecisionSupportPanelProps) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(124,227,189,0.18),transparent_24%),radial-gradient(circle_at_88%_20%,rgba(244,184,96,0.15),transparent_24%),linear-gradient(145deg,rgba(4,11,20,0.98)_0%,rgba(8,18,31,0.95)_54%,rgba(14,35,54,0.92)_100%)]" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">
          {data.eyebrow}
        </p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              {data.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
              {data.summary}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {data.sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[1.4rem] border border-white/12 bg-white/6 p-4 backdrop-blur"
                >
                  <h3 className="text-base font-bold text-white">{section.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{section.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[1.6rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200">
                Ce verifici inainte
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                {data.checks.map((check) => (
                  <li key={check} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.6rem] border border-rose-300/20 bg-rose-200/10 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-200">
                Ce sa nu fortezi
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                {data.mistakes.map((mistake) => (
                  <li key={mistake} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-200" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.6rem] border border-amber-300/20 bg-amber-200/10 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                Ce faci mai departe
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                {data.nextSteps.map((step) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-200" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};
