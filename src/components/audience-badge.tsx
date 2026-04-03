import type { Audience } from "@/lib/content";

type AudienceBadgeProps = {
  audience: Audience;
  className?: string;
};

const audienceMap: Record<
  Audience,
  { label: string; className: string }
> = {
  consumer: {
    label: "Pentru persoane",
    className:
      "border-emerald-300/40 bg-emerald-50 text-emerald-800",
  },
  business: {
    label: "Pentru firme",
    className:
      "border-amber-300/40 bg-amber-50 text-amber-800",
  },
  both: {
    label: "Pentru ambele",
    className:
      "border-slate-300/60 bg-slate-100 text-slate-700",
  },
};

export const AudienceBadge = ({ audience, className = "" }: AudienceBadgeProps) => {
  const config = audienceMap[audience];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${config.className} ${className}`.trim()}
    >
      {config.label}
    </span>
  );
};
