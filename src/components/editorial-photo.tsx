/* eslint-disable @next/next/no-img-element */
import type { Photo } from "@/lib/media";

// Full-bleed editorial image; falls back to a warm earth panel when no photo is set.
export function EditorialPhoto({
  photo,
  className = "",
  priority = false,
}: {
  photo?: Photo;
  className?: string;
  priority?: boolean;
}) {
  if (!photo?.src) {
    return <div className={`bg-soft ${className}`} aria-hidden />;
  }
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
