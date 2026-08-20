"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { repliesTable, threadsTable, usersTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function createThread(formData: FormData) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập để tạo thảo luận.");

  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  const body = String(formData.get("body") ?? "").trim();
  const tagRaw = String(formData.get("tag") ?? "").trim();
  const tag = tagRaw ? tagRaw.slice(0, 100) : null;

  if (!title || !body) throw new Error("Thiếu tiêu đề hoặc nội dung.");

  const [thread] = await db
    .insert(threadsTable)
    .values({ authorId: appUser.id, title, body, tag })
    .returning();

  revalidatePath("/community");
  redirect(`/community/${thread.id}`);
}

export async function createReply(threadId: number, formData: FormData) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập để trả lời.");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Nội dung trả lời trống.");

  await db.insert(repliesTable).values({ threadId, authorId: appUser.id, body });

  const [thread] = await db.select().from(threadsTable).where(eq(threadsTable.id, threadId));
  if (thread && thread.authorId !== appUser.id) {
    const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, thread.authorId));
    if (owner?.notifyCommunityReplies) {
      await createNotification(
        owner.id,
        "community_reply",
        `${appUser.name} đã trả lời thảo luận của bạn`,
        thread.title,
      );
    }
  }

  revalidatePath(`/community/${threadId}`);
}
