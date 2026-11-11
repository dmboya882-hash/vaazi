import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/auth";

// Call at the top of every admin page and server action. proxy.ts already
// guards /admin, but server actions must re-check on their own.
export async function requireAdmin() {
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isValidAdminToken(token)) redirect("/admin/login");
}
