"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminSessionToken, checkAdminPassword } from "@/lib/auth";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return "Admin login is not configured. Set ADMIN_PASSWORD and SESSION_SECRET in .env.";
  }
  if (!checkAdminPassword(password)) return "Incorrect password.";

  (await cookies()).set(ADMIN_COOKIE, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
