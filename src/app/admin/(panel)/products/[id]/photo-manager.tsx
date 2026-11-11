"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { attachPhotos, getUploadUrl, makeMainPhoto, removeExternalPhoto, removePhoto } from "./photo-actions";

const MAX_PHOTOS = 10;
const MAX_SIDE = 1600; // px; plenty for product pages, light on mobile data

// Shrink big phone photos to JPEG before uploading.
async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/jpeg", 0.85),
  );
}

export function PhotoManager({
  productId,
  photos,
  externalPhoto,
}: {
  productId: string;
  photos: { storageId: string; url: string }[];
  // Photo linked by URL (e.g. the stock placeholder); shown after uploads
  externalPhoto?: string | null;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const room = MAX_PHOTOS - photos.length;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = [...files].filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (list.length === 0) {
      setError("Choose image files (JPG, PNG or WebP).");
      return;
    }
    startTransition(async () => {
      try {
        const ids: string[] = [];
        for (const [i, file] of list.entries()) {
          setStatus(`Uploading ${i + 1} of ${list.length}…`);
          const blob = await resize(file);
          const url = await getUploadUrl();
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob });
          if (!res.ok) throw new Error("Upload failed");
          ids.push((await res.json()).storageId);
        }
        await attachPhotos(productId, ids);
        setStatus(`${ids.length} photo${ids.length > 1 ? "s" : ""} added.`);
        router.refresh();
      } catch (e) {
        console.error(e);
        setError("Upload failed. Check your connection and try again.");
        setStatus(null);
      } finally {
        if (input.current) input.current.value = "";
      }
    });
  }

  const act = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-medium">Photos</h2>
      <p className="mt-1 text-sm text-muted">
        Add your own photos here. The first is the main one; the second shows when shoppers hover. Up to {MAX_PHOTOS}.
        For thrifted pieces, include close-ups of labels and any wear.
        {externalPhoto ? " Your uploads show before the placeholder; remove the placeholder once you have your own." : ""}
      </p>

      <div
        className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        {photos.map((p, i) => (
          <figure key={p.storageId} className="group relative overflow-hidden border border-line bg-soft">
            <img src={p.url} alt={`Photo ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 bg-foreground px-1.5 py-0.5 text-[10px] font-semibold uppercase text-background">
                Main
              </span>
            )}
            <figcaption className="flex justify-between gap-1 border-t border-line bg-card p-2 text-[11px]">
              {i > 0 ? (
                <button type="button" disabled={busy} onClick={() => act(() => makeMainPhoto(productId, p.storageId))} className="underline">
                  Make main
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => confirm("Delete this photo?") && act(() => removePhoto(productId, p.storageId))}
                className="text-sale underline"
              >
                Delete
              </button>
            </figcaption>
          </figure>
        ))}

        {externalPhoto && (
          <figure className="relative overflow-hidden border border-dashed border-line bg-soft">
            <img src={externalPhoto} alt="Linked photo" className="aspect-[4/5] w-full object-cover" />
            <span className="absolute left-1.5 top-1.5 bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink">
              {photos.length === 0 ? "Main · " : ""}Placeholder
            </span>
            <figcaption className="flex justify-end border-t border-line bg-card p-2 text-[11px]">
              <button
                type="button"
                disabled={busy}
                onClick={() => confirm("Remove this placeholder photo?") && act(() => removeExternalPhoto(productId))}
                className="text-sale underline"
              >
                Remove
              </button>
            </figcaption>
          </figure>
        )}

        {room > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border-2 border-dashed border-line text-sm text-muted transition hover:border-foreground hover:text-foreground disabled:opacity-50"
          >
            <span className="text-3xl leading-none">+</span>
            {busy ? "Working…" : "Add photos"}
            <span className="px-2 text-center text-[11px]">or drag &amp; drop</span>
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label="Upload product photos"
        onChange={(e) => upload(e.target.files)}
      />
      {status && <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300" role="status">{status}</p>}
      {error && <p className="mt-3 text-sm text-sale" role="alert">{error}</p>}
    </section>
  );
}
