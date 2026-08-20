"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/config/db";
import {
  certificatesTable,
  lessonCommentsTable,
  lessonReactionsTable,
  lessonsTable,
  modulesTable,
  progressTable,
} from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";
import { getEnrollmentStatus } from "@/lib/queries";
import { getOwnedCourse } from "@/lib/instructor";
import { shouldIssueCertificate } from "@/lib/certificates";

// Học viên đã mua khoá học, HOẶC giảng viên/admin sở hữu khoá học (xem trước bài học của mình) —
// dùng chung cho mọi action tương tác trên trang học (đánh dấu hoàn thành, lưu vị trí xem, đánh
// giá, lưu bài học, bình luận).
async function requireLessonAccess(userId: number, isAdmin: boolean, lessonId: number) {
  const [row] = await db
    .select({ courseId: modulesTable.courseId })
    .from(lessonsTable)
    .innerJoin(modulesTable, eq(lessonsTable.moduleId, modulesTable.id))
    .where(eq(lessonsTable.id, lessonId));
  if (!row) return null;

  const status = await getEnrollmentStatus(userId, row.courseId);
  if (status === "paid") return row;

  const owned = await getOwnedCourse(userId, isAdmin, row.courseId);
  if (owned) return row;

  return null;
}

export async function markLessonComplete(lessonId: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) return;

  const row = await requireLessonAccess(appUser.id, appUser.role === "admin", lessonId);
  if (!row) return;

  const [existing] = await db
    .select()
    .from(progressTable)
    .where(and(eq(progressTable.userId, appUser.id), eq(progressTable.lessonId, lessonId)));

  if (existing) {
    if (!existing.completed) {
      await db
        .update(progressTable)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(progressTable.id, existing.id));
    }
  } else {
    await db.insert(progressTable).values({
      userId: appUser.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    });
  }

  await maybeIssueCertificate(appUser.id, row.courseId);

  revalidatePath(`/learn/${lessonId}`);
}

// Gọi định kỳ trong lúc xem video (không phải hành động người dùng bấm) — lưu vị trí xem để
// lần sau vào lại bài học tự tiếp tục từ đó. Không dùng revalidatePath ở đây vì gọi rất thường
// xuyên trong lúc phát, revalidate mỗi lần sẽ làm giật video.
export async function saveLessonPosition(lessonId: number, positionSeconds: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) return;

  const row = await requireLessonAccess(appUser.id, appUser.role === "admin", lessonId);
  if (!row) return;

  const rounded = Math.max(0, Math.floor(positionSeconds));

  const [existing] = await db
    .select()
    .from(progressTable)
    .where(and(eq(progressTable.userId, appUser.id), eq(progressTable.lessonId, lessonId)));

  if (existing) {
    await db.update(progressTable).set({ lastPositionSeconds: rounded }).where(eq(progressTable.id, existing.id));
  } else {
    await db.insert(progressTable).values({ userId: appUser.id, lessonId, lastPositionSeconds: rounded });
  }
}

// isHelpful = true ("Hữu ích") hoặc false ("Không hữu ích"). Bấm lại cùng lựa chọn sẽ bỏ đánh giá
// (toggle off), giống YouTube khi bấm lại nút like đang bật.
export async function toggleLessonReaction(lessonId: number, isHelpful: boolean) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập.");

  const row = await requireLessonAccess(appUser.id, appUser.role === "admin", lessonId);
  if (!row) throw new Error("Bạn không có quyền truy cập bài học này.");

  const [existing] = await db
    .select()
    .from(lessonReactionsTable)
    .where(and(eq(lessonReactionsTable.userId, appUser.id), eq(lessonReactionsTable.lessonId, lessonId)));

  if (existing && existing.isHelpful === isHelpful) {
    await db.delete(lessonReactionsTable).where(eq(lessonReactionsTable.id, existing.id));
  } else if (existing) {
    await db.update(lessonReactionsTable).set({ isHelpful }).where(eq(lessonReactionsTable.id, existing.id));
  } else {
    await db.insert(lessonReactionsTable).values({ userId: appUser.id, lessonId, isHelpful });
  }

  revalidatePath(`/learn/${lessonId}`);
}

export async function toggleSavedLesson(lessonId: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập.");

  const row = await requireLessonAccess(appUser.id, appUser.role === "admin", lessonId);
  if (!row) throw new Error("Bạn không có quyền truy cập bài học này.");

  const [existing] = await db
    .select()
    .from(progressTable)
    .where(and(eq(progressTable.userId, appUser.id), eq(progressTable.lessonId, lessonId)));

  if (existing) {
    await db.update(progressTable).set({ saved: !existing.saved }).where(eq(progressTable.id, existing.id));
  } else {
    await db.insert(progressTable).values({ userId: appUser.id, lessonId, saved: true });
  }

  revalidatePath(`/learn/${lessonId}`);
}

export async function createLessonComment(lessonId: number, parentId: number | null, formData: FormData) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập để bình luận.");

  const row = await requireLessonAccess(appUser.id, appUser.role === "admin", lessonId);
  if (!row) throw new Error("Bạn không có quyền truy cập bài học này.");

  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!body) throw new Error("Nội dung bình luận không được để trống.");

  if (parentId !== null) {
    const [parent] = await db.select().from(lessonCommentsTable).where(eq(lessonCommentsTable.id, parentId));
    if (!parent || parent.lessonId !== lessonId) throw new Error("Không tìm thấy bình luận gốc.");
  }

  await db.insert(lessonCommentsTable).values({ lessonId, authorId: appUser.id, parentId, body });
  revalidatePath(`/learn/${lessonId}`);
}

export async function deleteLessonComment(commentId: number, lessonId: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập.");

  const [comment] = await db.select().from(lessonCommentsTable).where(eq(lessonCommentsTable.id, commentId));
  if (!comment) return;
  if (comment.authorId !== appUser.id && appUser.role !== "admin") {
    throw new Error("Bạn không thể xoá bình luận của người khác.");
  }

  // Xoá luôn các phản hồi trực tiếp của bình luận này (chỉ 1 cấp reply nên không cần đệ quy).
  await db.delete(lessonCommentsTable).where(eq(lessonCommentsTable.parentId, commentId));
  await db.delete(lessonCommentsTable).where(eq(lessonCommentsTable.id, commentId));
  revalidatePath(`/learn/${lessonId}`);
}

async function maybeIssueCertificate(userId: number, courseId: number) {
  const [{ total, completed }] = await db
    .select({
      total: sql<number>`count(distinct ${lessonsTable.id})`.mapWith(Number),
      completed: sql<number>`count(distinct case when ${progressTable.completed} then ${lessonsTable.id} end)`.mapWith(
        Number,
      ),
    })
    .from(modulesTable)
    .innerJoin(lessonsTable, eq(lessonsTable.moduleId, modulesTable.id))
    .leftJoin(
      progressTable,
      and(eq(progressTable.lessonId, lessonsTable.id), eq(progressTable.userId, userId)),
    )
    .where(eq(modulesTable.courseId, courseId));

  if (!shouldIssueCertificate(total, completed)) return;

  const [existing] = await db
    .select()
    .from(certificatesTable)
    .where(and(eq(certificatesTable.userId, userId), eq(certificatesTable.courseId, courseId)));

  if (!existing) {
    await db.insert(certificatesTable).values({ userId, courseId });
  }
}
