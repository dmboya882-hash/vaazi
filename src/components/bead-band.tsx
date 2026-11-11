// A thin geometric band inspired by Maasai beadwork and kikoi borders:
// alternating triangles and diamonds in shuka red, ochre, beadwork blue and
// sand on an earth ground. Used sparingly as a divider so the theme stays subtle.

const H = 10;
const tile = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='${H}'>
<rect width='48' height='${H}' fill='%232c241e'/>
<path d='M0 0 L6 5 L0 10 Z' fill='%23a3242a'/>
<path d='M12 5 L18 0 L24 5 L18 10 Z' fill='%23b0632a'/>
<path d='M30 0 L36 5 L30 10 Z' fill='%231f4e79'/>
<path d='M36 5 L42 0 L48 5 L42 10 Z' fill='%23f6f3ee'/>
<rect x='25' y='4' width='4' height='2' fill='%23f6f3ee'/>
</svg>`.replace(/\n/g, "");

export function BeadBand({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`w-full ${className}`}
      style={{ height: H, backgroundImage: `url("data:image/svg+xml,${tile}")`, backgroundRepeat: "repeat-x" }}
    />
  );
}
