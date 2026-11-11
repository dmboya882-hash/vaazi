"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { api, fetchMutation, serverSecret } from "@/lib/convex";
import type { Id } from "../../../../../../convex/_generated/dataModel";

// The browser uploads photos straight to Convex storage using a short-lived
// URL, then tells us which files to attach to the product.

export async function getUploadUrl() {
  await requireAdmin();
  return fetchMutation(api.admin.generateUploadUrl, { secret: serverSecret() });
}

export async function attachPhotos(productId: string, storageIds: string[]) {
  await requireAdmin();
  await fetchMutation(api.admin.addImages, {
    secret: serverSecret(),
    productId: productId as Id<"products">,
    storageIds: storageIds as Id<"_storage">[],
  });
  revalidatePath("/", "layout");
}

export async function removePhoto(productId: string, storageId: string) {
  await requireAdmin();
  await fetchMutation(api.admin.removeImage, {
    secret: serverSecret(),
    productId: productId as Id<"products">,
    storageId: storageId as Id<"_storage">,
  });
  revalidatePath("/", "layout");
}

export async function makeMainPhoto(productId: string, storageId: string) {
  await requireAdmin();
  await fetchMutation(api.admin.makeMainImage, {
    secret: serverSecret(),
    productId: productId as Id<"products">,
    storageId: storageId as Id<"_storage">,
  });
  revalidatePath("/", "layout");
}

export async function removeExternalPhoto(productId: string) {
  await requireAdmin();
  await fetchMutation(api.admin.clearImageUrl, { secret: serverSecret(), id: productId as Id<"products"> });
  revalidatePath("/", "layout");
}
