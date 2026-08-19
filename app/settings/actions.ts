"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập.");

  const name = String(formData.get("name") ?? "").trim().slice(0, 255);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 1000);
  if (!name) throw new Error("Tên không được để trống.");

  await db
    .update(usersTable)
    .set({
      name,
      bio: bio || null,
      notifyCourseUpdates: formData.get("notifyCourseUpdates") === "on",
      notifyCommunityReplies: formData.get("notifyCommunityReplies") === "on",
      notifyWeeklyDigest: formData.get("notifyWeeklyDigest") === "on",
      notifyProductAnnouncements: formData.get("notifyProductAnnouncements") === "on",
    })
    .where(eq(usersTable.id, appUser.id));

  revalidatePath("/settings");
  revalidatePath("/profile");
}
