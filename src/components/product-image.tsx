/* eslint-disable @next/next/no-img-element */

// Shows the product photo when one is set, otherwise a simple illustrated
// garment silhouette tinted with the product colour.

const SHAPES: Record<string, React.ReactNode> = {
  shirts: (
    <>
      <path d="M70 40 L100 52 L130 40 L170 62 L160 100 L142 94 L142 200 L58 200 L58 94 L40 100 L30 62 Z" />
      <path d="M86 44 L100 70 L114 44" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="3" />
      <line x1="100" y1="70" x2="100" y2="200" stroke="rgba(0,0,0,.18)" strokeWidth="2" />
      {[90, 115, 140, 165].map((y) => <circle key={y} cx="104" cy={y} r="2.5" fill="rgba(0,0,0,.3)" />)}
    </>
  ),
  "t-shirts": (
    <>
      <path d="M72 44 Q100 62 128 44 L168 64 L156 98 L140 92 L140 200 L60 200 L60 92 L44 98 L32 64 Z" />
      <path d="M78 46 Q100 66 122 46" fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="3" />
    </>
  ),
  knitwear: (
    <>
      <path d="M72 42 Q100 58 128 42 L166 60 L172 180 L152 182 L146 100 L146 202 L54 202 L54 100 L48 182 L28 180 L34 60 Z" />
      <path d="M76 44 Q100 64 124 44" fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="4" />
      <rect x="54" y="190" width="92" height="12" fill="rgba(0,0,0,.12)" />
    </>
  ),
  trousers: (
    <>
      <path d="M62 30 L138 30 L146 210 L110 210 L100 90 L90 210 L54 210 Z" />
      <rect x="62" y="30" width="76" height="12" fill="rgba(0,0,0,.15)" />
      <line x1="100" y1="42" x2="100" y2="90" stroke="rgba(0,0,0,.2)" strokeWidth="2" />
    </>
  ),
  jackets: (
    <>
      <path d="M70 34 L100 46 L130 34 L168 56 L174 186 L152 188 L148 104 L148 206 L52 206 L52 104 L48 188 L26 186 L32 56 Z" />
      <path d="M84 38 L100 92 L116 38" fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="4" />
      <line x1="100" y1="92" x2="100" y2="206" stroke="rgba(0,0,0,.25)" strokeWidth="3" />
      <rect x="62" y="150" width="26" height="18" rx="2" fill="rgba(0,0,0,.14)" />
      <rect x="112" y="150" width="26" height="18" rx="2" fill="rgba(0,0,0,.14)" />
    </>
  ),
  shoes: (
    <>
      <path d="M40 130 L40 90 Q40 80 52 80 L86 80 Q96 110 128 118 L160 126 Q176 132 176 150 L176 160 L40 160 Z" />
      <rect x="36" y="160" width="144" height="12" rx="4" fill="rgba(0,0,0,.35)" />
      <path d="M58 80 L58 128" stroke="rgba(0,0,0,.2)" strokeWidth="3" />
    </>
  ),
  accessories: (
    <>
      <path d="M50 150 Q50 70 100 66 Q150 70 150 150 Z" />
      <rect x="44" y="140" width="112" height="28" rx="6" fill="rgba(0,0,0,.18)" />
      {[60, 75, 90, 105, 120, 135].map((x) => (
        <line key={x} x1={x} y1="80" x2={x} y2="140" stroke="rgba(0,0,0,.1)" strokeWidth="3" />
      ))}
    </>
  ),
};

export function ProductImage({
  imageUrl,
  tint,
  category,
  name,
  hoverUrl,
  className = "",
}: {
  imageUrl?: string | null;
  // Optional second photo, shown when the parent .group is hovered
  hoverUrl?: string | null;
  tint: string;
  category: string;
  name: string;
  className?: string;
}) {
  if (imageUrl) {
    const img = (
      <img src={imageUrl} alt={name} loading="lazy" decoding="async" className={`aspect-[4/5] w-full object-cover ${className}`} />
    );
    if (!hoverUrl) return img;
    return (
      <div className="relative">
        {img}
        <img
          src={hoverUrl}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 aspect-[4/5] h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
        />
      </div>
    );
  }
  return (
    <div
      className={`flex aspect-[4/5] w-full items-center justify-center bg-soft ${className}`}
      role="img"
      aria-label={name}
    >
      <svg viewBox="0 0 200 240" className="h-[70%] w-[70%] drop-shadow-md" fill={tint}>
        {SHAPES[category] ?? SHAPES["t-shirts"]}
      </svg>
    </div>
  );
}
