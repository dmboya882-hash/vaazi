"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/(shop)/newsletter-action";

export function Newsletter() {
  const [state, action, pending] = useActionState(subscribe, null);
  return (
    <form action={action} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="Email address"
          aria-label="Email address"
          className="w-full border-b border-white/40 bg-transparent px-1 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white"
        />
        <button className="btn-light shrink-0" disabled={pending}>
          {pending ? "…" : "Sign up"}
        </button>
      </div>
      {state && (
        <p className={`mt-3 text-sm ${state.ok ? "text-white" : "text-red-300"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
