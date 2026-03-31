import type { EditorialBlock } from "@/lib/content";
import Link from "next/link";

type EditorialBlocksProps = {
  blocks: EditorialBlock[];
};

const toneClasses: Record<
  EditorialBlock["tone"],
  {
    section: string;
    eyebrow: string;
    title: string;
    body: string;
    line: string;
  }
> = {
  mist: {
    section:
      "border border-white/60 bg-white/75 text-slate-900 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur",
    eyebrow: "text-cyan-700",
    title: "text-slate-950",
    body: "text-slate-700",
    line: "bg-slate-200",
  },
  night: {
    section:
      "border border-cyan-500/20 bg-slate-950 text-slate-50 shadow-[0_40px_120px_-50px_rgba(34,211,238,0.45)]",
    eyebrow: "text-cyan-300",
    title: "text-white",
    body: "text-slate-300",
    line: "bg-white/10",
  },
  sand: {
    section:
      "border border-amber-200/60 bg-amber-50/90 text-slate-900 shadow-[0_30px_80px_-40px_rgba(120,53,15,0.25)]",
    eyebrow: "text-amber-700",
    title: "text-slate-950",
    body: "text-slate-700",
    line: "bg-amber-200",
  },
};

export const EditorialBlocks = ({ blocks }: EditorialBlocksProps) => {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        const tone = toneClasses[block.tone];

        if (block.blockType === "story") {
          return (
            <section
              key={block.id}
              className={`overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 ${tone.section}`}
            >
              {block.eyebrow ? (
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${tone.eyebrow}`}
                >
                  {block.eyebrow}
                </p>
              ) : null}
              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
                <h2 className={`text-3xl font-black leading-tight sm:text-4xl ${tone.title}`}>
                  {block.title}
                </h2>
                <p className={`text-sm leading-7 sm:text-base ${tone.body}`}>
                  {block.body}
                </p>
              </div>
            </section>
          );
        }

        if (block.blockType === "facts") {
          return (
            <section
              key={block.id}
              className={`overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 ${tone.section}`}
            >
              {block.eyebrow ? (
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${tone.eyebrow}`}
                >
                  {block.eyebrow}
                </p>
              ) : null}
              <div className="mt-4 max-w-2xl">
                <h2 className={`text-3xl font-black leading-tight sm:text-4xl ${tone.title}`}>
                  {block.title}
                </h2>
                {block.intro ? (
                  <p className={`mt-3 text-sm leading-7 sm:text-base ${tone.body}`}>
                    {block.intro}
                  </p>
                ) : null}
              </div>
              <div className={`mt-8 h-px w-full ${tone.line}`} />
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {block.items.map((item, index) => (
                  <article key={`${block.id}-${item.label}-${index}`}>
                    <p className={`text-3xl font-black sm:text-4xl ${tone.title}`}>
                      {item.value}
                    </p>
                    <p className={`mt-2 text-sm font-semibold ${tone.title}`}>
                      {item.label}
                    </p>
                    {item.detail ? (
                      <p className={`mt-2 text-sm leading-6 ${tone.body}`}>
                        {item.detail}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (block.blockType === "links") {
          return (
            <section
              key={block.id}
              className={`overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 ${tone.section}`}
            >
              {block.eyebrow ? (
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${tone.eyebrow}`}
                >
                  {block.eyebrow}
                </p>
              ) : null}
              <div className="mt-4 max-w-2xl">
                <h2 className={`text-3xl font-black leading-tight sm:text-4xl ${tone.title}`}>
                  {block.title}
                </h2>
                {block.intro ? (
                  <p className={`mt-3 text-sm leading-7 sm:text-base ${tone.body}`}>
                    {block.intro}
                  </p>
                ) : null}
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {block.items.map((item, index) => (
                  <Link
                    key={`${block.id}-${item.href}-${index}`}
                    href={item.href}
                    className="group border-b border-current/10 pb-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={`text-lg font-bold ${tone.title}`}>{item.label}</h3>
                      <span className={`text-xs uppercase tracking-[0.24em] ${tone.eyebrow}`}>
                        Open
                      </span>
                    </div>
                    {item.description ? (
                      <p className={`mt-2 max-w-xl text-sm leading-6 ${tone.body}`}>
                        {item.description}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </section>
          );
        }

        return (
          <section
            key={block.id}
            className={`overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 ${tone.section}`}
          >
            {block.eyebrow ? (
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${tone.eyebrow}`}
              >
                {block.eyebrow}
              </p>
            ) : null}
            <div className="mt-4 max-w-3xl">
              <h2 className={`text-3xl font-black leading-tight sm:text-4xl ${tone.title}`}>
                {block.title}
              </h2>
              <p className={`mt-3 text-sm leading-7 sm:text-base ${tone.body}`}>
                {block.body}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={block.primaryHref}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
              >
                {block.primaryLabel}
              </Link>
              {block.secondaryLabel && block.secondaryHref ? (
                <Link
                  href={block.secondaryHref}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold ${tone.title}`}
                >
                  {block.secondaryLabel}
                </Link>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
};
