import { STATUS_LABELS, type OrderStatus } from "@/lib/orders";

// Small presentational helpers shared by admin pages.

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  CONFIRMED: "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  SHIPPED: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  DELIVERED: "bg-stone-200 text-stone-700 dark:bg-stone-400/15 dark:text-stone-300",
  CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status] ?? "bg-line"}`}>
      {STATUS_LABELS[status as OrderStatus] ?? status}
    </span>
  );
}

export function Notice({ error, saved }: { error?: string; saved?: boolean }) {
  if (error) {
    return (
      <p className="mb-6 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300" role="alert">
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p className="mb-6 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300" role="status">
        Saved.
      </p>
    );
  }
  return null;
}

export function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }).format(ms);
}
