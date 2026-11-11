import { createHmac, timingSafeEqual } from "node:crypto";

// Simple single-password admin auth. The session cookie holds an HMAC of a
// fixed message keyed with SESSION_SECRET + ADMIN_PASSWORD, so changing either
// env var logs every admin out. Synchronous on purpose: async crypto would
// count as uncached I/O during rendering. proxy.ts runs on Node, so this works there too.

export const ADMIN_COOKIE = "admin_session";

function hmac(message: string) {
  const secret = `${process.env.SESSION_SECRET ?? ""}:${process.env.ADMIN_PASSWORD ?? ""}`;
  return createHmac("sha256", secret).update(message).digest();
}

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminSessionToken() {
  return hmac("admin-session-v1").toString("hex");
}

export function isValidAdminToken(token: string | undefined) {
  if (!token || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) return false;
  return safeEqual(Buffer.from(token), Buffer.from(adminSessionToken()));
}

export function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so the comparison doesn't leak the password length.
  return safeEqual(hmac(`pw:${password}`), hmac(`pw:${expected}`));
}
