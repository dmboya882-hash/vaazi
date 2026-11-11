"use client";

import { useActionState } from "react";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-24">
      <ThemeToggle className="absolute right-4 top-4 text-muted" />
      <div className="mb-8 text-center">
        <div className="display pl-[0.3em] text-4xl font-medium tracking-[0.3em]">{site.name}</div>
        <div className="eyebrow mt-2">Admin</div>
      </div>
      <form action={action} className="w-full max-w-sm border border-line bg-card p-8">
        <h1 className="display text-2xl">Sign in</h1>
        <label htmlFor="password" className="label mt-6">
          Password
        </label>
        <input id="password" name="password" type="password" required autoFocus className="input" />
        {error && (
          <p className="mt-3 text-sm text-sale" role="alert">
            {error}
          </p>
        )}
        <button className="btn mt-6 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
