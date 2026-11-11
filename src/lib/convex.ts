import "server-only";
import { connection } from "next/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { api } from "../../convex/_generated/api";

export { api, fetchMutation, fetchQuery };

// Secret that unlocks privileged Convex functions (admin, payments).
// Only ever used on the server.
export function serverSecret() {
  const s = process.env.CONVEX_SERVER_SECRET;
  if (!s) throw new Error("CONVEX_SERVER_SECRET is not set");
  return s;
}

// Storefront reads run per request so stock levels are always fresh.
export async function query<T>(fn: () => Promise<T>) {
  await connection();
  return fn();
}

export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again.") {
  if (e instanceof ConvexError && typeof e.data === "string") return e.data;
  return fallback;
}
