import { db } from "@/config/db";
import { notificationsTable } from "@/config/schema";

export type NotificationType = "welcome" | "payment" | "community_reply" | "course_update";

export async function createNotification(userId: number, type: NotificationType, title: string, body?: string) {
  await db.insert(notificationsTable).values({ userId, type, title, body: body ?? null });
}
