import { site } from "@/lib/site";

// The Vaazi logo: serif wordmark, a thin rule broken by four beadwork
// diamonds (shuka red, ochre, beadwork blue, and a fourth in the text colour),
// then the "mavazi · nairobi" tagline.

const DIAMONDS = ["bg-[#a3242a]", "bg-[#e0a43a]", "bg-[#1f4e79]", "bg-current"];

export function BeadDivider({ size = 5, rule = 24, className = "" }: { size?: number; rule?: number; className?: string }) {
  return (
    <span aria-hidden className={`flex items-center justify-center gap-[0.35em] ${className}`}>
      <i className="block h-px bg-current opacity-40" style={{ width: rule }} />
      <span className="flex items-center" style={{ gap: Math.max(2, size * 0.7) }}>
        {DIAMONDS.map((c) => (
          <i key={c} className={`block rotate-45 ${c}`} style={{ width: size, height: size }} />
        ))}
      </span>
      <i className="block h-px bg-current opacity-40" style={{ width: rule }} />
    </span>
  );
}

export function Logo({
  size = "md",
  tagline = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
  className?: string;
}) {
  const word = {
    sm: "text-2xl tracking-[0.3em] pl-[0.3em]",
    md: "text-[32px] sm:text-[40px] tracking-[0.35em] pl-[0.35em]",
    lg: "text-5xl tracking-[0.35em] pl-[0.35em]",
  }[size];
  const bead = { sm: 4, md: 5, lg: 6 }[size];
  const rule = { sm: 16, md: 24, lg: 36 }[size];
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`display font-medium ${word}`}>{site.name}</span>
      <BeadDivider size={bead} rule={rule} className="mt-1.5" />
      {tagline && (
        <span className="mt-1.5 pl-[0.4em] text-[9px] uppercase tracking-[0.4em] opacity-60">Mavazi · Nairobi</span>
      )}
    </span>
  );
}
