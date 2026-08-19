"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/config/db";
import { notificationsTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";

export async function markNotificationRead(notificationId: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) return;

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, appUser.id)));

  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const appUser = await getCurrentAppUser();
  if (!appUser) return;

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.userId, appUser.id), eq(notificationsTable.read, false)));

  revalidatePath("/", "layout");
}
