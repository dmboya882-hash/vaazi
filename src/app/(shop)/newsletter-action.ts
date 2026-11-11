"use server";

import { api, errorMessage, fetchMutation } from "@/lib/convex";

export async function subscribe(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetchMutation(api.newsletter.subscribe, { email: String(formData.get("email") ?? "") });
    return {
      ok: true,
      message: res.alreadySubscribed ? "You're already on the list." : "You're in! Check your inbox for 10% off.",
    };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
