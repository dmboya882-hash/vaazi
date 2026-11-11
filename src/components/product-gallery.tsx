"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { CloseIcon } from "@/components/icons";

// Product photos: swipeable row on phones, two-column grid on desktop,
// and a full-screen zoom on tap/click.
export function ProductGallery({
  photos,
  name,
  tint,
  category,
  badge,
}: {
  photos: string[];
  name: string;
  tint: string;
  category: string;
  badge?: React.ReactNode;
}) {
  const [zoom, setZoom] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="relative bg-soft">
        <ProductImage tint={tint} category={category} name={name} />
        {badge}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Phones: swipe through photos */}
      <div
        className="rail -mx-4 flex overflow-x-auto sm:hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          setCurrent(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {photos.map((src, i) => (
          <button key={src} type="button" className="w-full shrink-0" onClick={() => setZoom(i)} aria-label={`Zoom photo ${i + 1}`}>
            <img src={src} alt={i === 0 ? name : `${name}, photo ${i + 1}`} className="aspect-[4/5] w-full bg-soft object-cover" />
          </button>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
          {photos.map((src, i) => (
            <span key={src} className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-foreground" : "w-1.5 bg-line"}`} />
          ))}
        </div>
      )}

      {/* Desktop: grid */}
      <div className={`hidden gap-3 sm:grid ${photos.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setZoom(i)}
            className={`cursor-zoom-in bg-soft ${photos.length > 2 && i === 0 ? "sm:col-span-2" : ""}`}
            aria-label={`Zoom photo ${i + 1}`}
          >
            <img src={src} alt={i === 0 ? name : `${name}, photo ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
          </button>
        ))}
      </div>
      {badge}

      {zoom !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" role="dialog" aria-label="Photo zoom" onClick={() => setZoom(null)}>
          <img src={photos[zoom]} alt={name} className="max-h-[92vh] max-w-[94vw] object-contain" />
          <button className="absolute right-4 top-4 rounded-full bg-paper p-2 text-ink" aria-label="Close" onClick={() => setZoom(null)}>
            <CloseIcon />
          </button>
          {photos.length > 1 && (
            <div className="absolute bottom-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {photos.map((src, i) => (
                <button key={src} onClick={() => setZoom(i)} className={`h-14 w-11 overflow-hidden border-2 ${i === zoom ? "border-white" : "border-transparent opacity-60"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
