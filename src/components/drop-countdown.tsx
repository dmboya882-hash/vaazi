"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

// Time until the next weekly thrift drop (day/hour in Nairobi time, UTC+3).
function nextDrop(now: Date) {
  const { day, hour } = site.thriftDrop;
  const nairobi = new Date(now.getTime() + 3 * 3600_000); // shift to EAT, read UTC fields
  const target = new Date(Date.UTC(nairobi.getUTCFullYear(), nairobi.getUTCMonth(), nairobi.getUTCDate(), hour));
  let add = (day - nairobi.getUTCDay() + 7) % 7;
  if (add === 0 && nairobi.getTime() >= target.getTime()) add = 7;
  target.setUTCDate(target.getUTCDate() + add);
  return target.getTime() - 3 * 3600_000; // back to real UTC instant
}

export function DropCountdown({ dark = false }: { dark?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(nextDrop(new Date()) - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const parts =
    left === null
      ? ["--", "--", "--", "--"]
      : [86_400_000, 3_600_000, 60_000, 1000].map((unit, i, arr) => {
          const v = Math.floor((i === 0 ? left : left % arr[i - 1]) / unit);
          return String(v).padStart(2, "0");
        });

  return (
    <div className="flex gap-2" aria-label="Time until next thrift drop">
      {["Days", "Hrs", "Min", "Sec"].map((label, i) => (
        <div key={label} className={`min-w-14 px-2 py-2 text-center ${dark ? "bg-foreground text-background" : "bg-white/15"}`}>
          <div className="display text-3xl tabular-nums">{parts[i]}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
        </div>
      ))}
    </div>
  );
}
