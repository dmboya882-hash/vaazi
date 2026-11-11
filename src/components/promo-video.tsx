"use client";

import { useEffect, useRef, useState } from "react";

// The 15s VAAZI reel. Muted autoplay only while it is on screen (saves data on
// mobile plans), with a tap-for-sound button. People who prefer reduced motion
// get the poster and a play button instead of autoplay.

export function PromoVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  function toggleSound() {
    const video = ref.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    // Unmuting restarts the reel so the music lines up from the top.
    if (!video.muted) video.currentTime = 0;
    video.play().catch(() => {});
  }

  function togglePlay() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#171513]">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
        className="h-full w-full cursor-pointer object-cover"
      />
      {!playing && (
        <button
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/90 text-[#171513] shadow-lg"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
        </button>
      )}
      <button
        onClick={toggleSound}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" stroke="none" />
          {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
        </svg>
        {muted ? "Sound on" : "Sound off"}
      </button>
    </div>
  );
}
