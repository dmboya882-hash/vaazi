// Decorative pieces inspired by Maasai beadwork and shuka cloth.
// Colours: shuka red, ochre, beadwork blue, white, ink.

const BEADS = ["#a3242a", "#f6f3ee", "#1f4e79", "#e0a43a", "#a3242a", "#171513"];

/** A round beaded collar (like a Maasai beaded necklace), as rings of beads. */
export function BeadCollar({ size = 120, className = "" }: { size?: number; className?: string }) {
  const rings = [
    { r: 54, n: 44, bead: 3.2, colors: ["#a3242a", "#f6f3ee"] },
    { r: 46, n: 38, bead: 3.0, colors: ["#1f4e79"] },
    { r: 39, n: 32, bead: 2.8, colors: ["#e0a43a", "#e0a43a", "#a3242a"] },
    { r: 32, n: 26, bead: 2.6, colors: ["#f6f3ee"] },
    { r: 25, n: 20, bead: 2.4, colors: ["#a3242a", "#1f4e79"] },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden className={className}>
      {rings.map((ring, ri) =>
        Array.from({ length: ring.n }).map((_, i) => {
          const a = (i / ring.n) * Math.PI * 2;
          return (
            <circle
              key={`${ri}-${i}`}
              cx={60 + ring.r * Math.cos(a)}
              cy={60 + ring.r * Math.sin(a)}
              r={ring.bead}
              fill={ring.colors[i % ring.colors.length]}
            />
          );
        }),
      )}
      {/* Centre pendant */}
      <path d="M60 46 L68 60 L60 74 L52 60 Z" fill="#e0a43a" />
      <path d="M60 52 L64 60 L60 68 L56 60 Z" fill="#a3242a" />
    </svg>
  );
}

/** A short horizontal row of beads, used as a divider. */
export function BeadRow({ count = 18, small = false, className = "" }: { count?: number; small?: boolean; className?: string }) {
  return (
    <div aria-hidden className={`flex items-center ${small ? "gap-1" : "gap-1.5"} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`block rounded-full ${small ? "h-1.5 w-1.5" : "h-2 w-2"}`}
          style={{ background: BEADS[i % BEADS.length], boxShadow: "inset 0 -1px 0 rgba(0,0,0,.25)" }}
        />
      ))}
    </div>
  );
}

/** Vertical band of Maasai shuka check: red cloth with blue and black lines. */
export function ShukaStripe({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        backgroundColor: "#a3242a",
        backgroundImage: [
          "repeating-linear-gradient(90deg, transparent 0 14px, rgba(23,21,19,.85) 14px 17px, transparent 17px 22px, #1f4e79 22px 25px, transparent 25px 40px)",
          "repeating-linear-gradient(0deg, transparent 0 14px, rgba(23,21,19,.85) 14px 17px, transparent 17px 22px, #1f4e79 22px 25px, transparent 25px 40px)",
        ].join(","),
        backgroundBlendMode: "multiply",
      }}
    />
  );
}

export const BEAD_COLORS = BEADS;

/** A section label with a few beads in front of it. */
export function BeadLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`}>
      <BeadRow count={4} small />
      {children}
    </p>
  );
}
