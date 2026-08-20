"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable, enrollmentsTable, lessonsTable, modulesTable, progressTable, usersTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";
import { canManageCourses, getOwnedCourse, getOwnedLesson, getOwnedModule } from "@/lib/instructor";
import { createNotification } from "@/lib/notifications";
import { generateCourseContent, generateLessonContent } from "@/lib/ai-course-generator";
import { suggestYoutubeVideos, type YoutubeSuggestion } from "@/lib/youtube-search";

async function requireInstructor() {
  const appUser = await getCurrentAppUser();
  if (!appUser || !canManageCourses(appUser)) throw new Error("Bạn không có quyền giảng viên.");
  return appUser;
}

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "khoa-hoc"}-${randomUUID().slice(0, 6)}`;
}

export async function generateCourseWithAI(formData: FormData) {
  const appUser = await requireInstructor();
  const topic = String(formData.get("topic") ?? "").trim().slice(0, 200);
  if (!topic) throw new Error("Thiếu chủ đề khoá học.");

  const generated = await generateCourseContent(topic);

  const [course] = await db
    .insert(coursesTable)
    .values({
      instructorId: appUser.id,
      title: generated.title,
      slug: slugify(generated.title),
      description: generated.description,
      category: generated.category,
      level: generated.level,
    })
    .returning();

  for (const [moduleIdx, mod] of generated.modules.entries()) {
    const [moduleRow] = await db
      .insert(modulesTable)
      .values({ courseId: course.id, title: mod.title, order: moduleIdx })
      .returning();

    for (const [lessonIdx, lesson] of mod.lessons.entries()) {
      await db
        .insert(lessonsTable)
        .values({ moduleId: moduleRow.id, title: lesson.title, content: lesson.content, order: lessonIdx });
    }
  }

  revalidatePath("/instructor");
  redirect(`/instructor/courses/${course.id}`);
}

export async function updateCourse(courseId: number, formData: FormData) {
  const appUser = await requireInstructor();
  const course = await getOwnedCourse(appUser.id, appUser.role === "admin", courseId);
  if (!course) throw new Error("Không tìm thấy khoá học hoặc bạn không sở hữu.");

  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const originalPriceRaw = String(formData.get("originalPrice") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();

  if (!title) throw new Error("Tên khoá học không được để trống.");

  await db
    .update(coursesTable)
    .set({
      title,
      description: description || null,
      category: category || null,
      level: level || null,
      price: priceRaw ? priceRaw : "0",
      originalPrice: originalPriceRaw ? originalPriceRaw : null,
      thumbnailUrl: thumbnailUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(coursesTable.id, courseId));

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/instructor");
}

export async function togglePublish(courseId: number) {
  const appUser = await requireInstructor();
  const course = await getOwnedCourse(appUser.id, appUser.role === "admin", courseId);
  if (!course) throw new Error("Không tìm thấy khoá học hoặc bạn không sở hữu.");

  await db.update(coursesTable).set({ published: !course.published, updatedAt: new Date() }).where(eq(coursesTable.id, courseId));

  revalidatePath("/instructor");
  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath(`/courses/${course.slug}`);
}

export async function createModule(courseId: number, formData: FormData) {
  const appUser = await requireInstructor();
  const course = await getOwnedCourse(appUser.id, appUser.role === "admin", courseId);
  if (!course) throw new Error("Không tìm thấy khoá học hoặc bạn không sở hữu.");

  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  if (!title) throw new Error("Thiếu tên chương.");

  const existing = await db.select().from(modulesTable).where(eq(modulesTable.courseId, courseId));
  const nextOrder = existing.reduce((max, m) => Math.max(max, m.order), -1) + 1;

  await db.insert(modulesTable).values({ courseId, title, order: nextOrder });

  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function updateModuleTitle(moduleId: number, formData: FormData) {
  const appUser = await requireInstructor();
  const owned = await getOwnedModule(appUser.id, appUser.role === "admin", moduleId);
  if (!owned) throw new Error("Không tìm thấy chương hoặc bạn không sở hữu.");

  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  if (!title) throw new Error("Tên chương không được để trống.");

  await db.update(modulesTable).set({ title }).where(eq(modulesTable.id, moduleId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function deleteModule(moduleId: number) {
  const appUser = await requireInstructor();
  const owned = await getOwnedModule(appUser.id, appUser.role === "admin", moduleId);
  if (!owned) throw new Error("Không tìm thấy chương hoặc bạn không sở hữu.");

  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId));
  if (lessons.length > 0) throw new Error("Xoá hết bài học trong chương trước khi xoá chương.");

  await db.delete(modulesTable).where(eq(modulesTable.id, moduleId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function moveModule(moduleId: number, direction: "up" | "down") {
  const appUser = await requireInstructor();
  const owned = await getOwnedModule(appUser.id, appUser.role === "admin", moduleId);
  if (!owned) throw new Error("Không tìm thấy chương hoặc bạn không sở hữu.");

  const siblings = await db
    .select()
    .from(modulesTable)
    .where(eq(modulesTable.courseId, owned.course.id))
    .orderBy(asc(modulesTable.order));

  const idx = siblings.findIndex((m) => m.id === moduleId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= siblings.length) return;

  const a = siblings[idx];
  const b = siblings[swapIdx];
  await db.update(modulesTable).set({ order: b.order }).where(eq(modulesTable.id, a.id));
  await db.update(modulesTable).set({ order: a.order }).where(eq(modulesTable.id, b.id));

  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function createLesson(moduleId: number, formData: FormData) {
  const appUser = await requireInstructor();
  const owned = await getOwnedModule(appUser.id, appUser.role === "admin", moduleId);
  if (!owned) throw new Error("Không tìm thấy chương hoặc bạn không sở hữu.");

  const topic = String(formData.get("topic") ?? "").trim().slice(0, 200);
  if (!topic) throw new Error("Thiếu chủ đề bài học.");

  const generated = await generateLessonContent(topic);

  const existing = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId));
  const nextOrder = existing.reduce((max, l) => Math.max(max, l.order), -1) + 1;

  await db
    .insert(lessonsTable)
    .values({ moduleId, title: generated.title, content: generated.content, order: nextOrder });

  if (owned.course.published) {
    await notifyEnrolledStudentsOfNewLesson(owned.course.id, owned.course.title, generated.title);
  }

  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

async function notifyEnrolledStudentsOfNewLesson(courseId: number, courseTitle: string, lessonTitle: string) {
  const students = await db
    .select({ id: usersTable.id })
    .from(enrollmentsTable)
    .innerJoin(usersTable, eq(usersTable.id, enrollmentsTable.userId))
    .where(and(eq(enrollmentsTable.courseId, courseId), eq(enrollmentsTable.status, "paid"), eq(usersTable.notifyCourseUpdates, true)));

  for (const student of students) {
    await createNotification(student.id, "course_update", `Bài học mới: ${courseTitle}`, lessonTitle);
  }
}

export async function updateLesson(lessonId: number, formData: FormData) {
  const appUser = await requireInstructor();
  const owned = await getOwnedLesson(appUser.id, appUser.role === "admin", lessonId);
  if (!owned) throw new Error("Không tìm thấy bài học hoặc bạn không sở hữu.");

  const content = String(formData.get("content") ?? "").trim();
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const duration = durationRaw ? Number(durationRaw) : null;

  await db.update(lessonsTable).set({ content: content || null, duration }).where(eq(lessonsTable.id, lessonId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function deleteLesson(lessonId: number) {
  const appUser = await requireInstructor();
  const owned = await getOwnedLesson(appUser.id, appUser.role === "admin", lessonId);
  if (!owned) throw new Error("Không tìm thấy bài học hoặc bạn không sở hữu.");

  const [progressRow] = await db.select().from(progressTable).where(eq(progressTable.lessonId, lessonId));
  if (progressRow) throw new Error("Không thể xoá bài học đã có học viên học.");

  await db.delete(lessonsTable).where(eq(lessonsTable.id, lessonId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function moveLesson(lessonId: number, direction: "up" | "down") {
  const appUser = await requireInstructor();
  const owned = await getOwnedLesson(appUser.id, appUser.role === "admin", lessonId);
  if (!owned) throw new Error("Không tìm thấy bài học hoặc bạn không sở hữu.");

  const siblings = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.moduleId, owned.module.id))
    .orderBy(asc(lessonsTable.order));

  const idx = siblings.findIndex((l) => l.id === lessonId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= siblings.length) return;

  const a = siblings[idx];
  const b = siblings[swapIdx];
  await db.update(lessonsTable).set({ order: b.order }).where(eq(lessonsTable.id, a.id));
  await db.update(lessonsTable).set({ order: a.order }).where(eq(lessonsTable.id, b.id));

  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function searchYoutubeForLesson(lessonId: number, topic: string): Promise<YoutubeSuggestion[]> {
  const appUser = await requireInstructor();
  const owned = await getOwnedLesson(appUser.id, appUser.role === "admin", lessonId);
  if (!owned) throw new Error("Không tìm thấy bài học hoặc bạn không sở hữu.");

  const trimmedTopic = topic.trim().slice(0, 200);
  if (!trimmedTopic) throw new Error("Thiếu chủ đề tìm kiếm.");

  return suggestYoutubeVideos(trimmedTopic);
}

export async function setLessonYoutubeVideo(lessonId: number, youtubeUrl: string) {
  const appUser = await requireInstructor();
  const owned = await getOwnedLesson(appUser.id, appUser.role === "admin", lessonId);
  if (!owned) throw new Error("Không tìm thấy bài học hoặc bạn không sở hữu.");

  if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(youtubeUrl)) {
    throw new Error("Link không hợp lệ — chỉ chấp nhận link YouTube.");
  }

  // 1 lesson chỉ có 1 nguồn video — gắn YouTube thì bỏ video Mux đã upload (nếu có), tránh 2 nguồn cùng tồn tại gây nhầm lẫn khi phát.
  await db.update(lessonsTable).set({ youtubeUrl, videoAssetId: null }).where(eq(lessonsTable.id, lessonId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function clearLessonYoutubeVideo(lessonId: number) {
  const appUser = await requireInstructor();
  const owned = await getOwnedLesson(appUser.id, appUser.role === "admin", lessonId);
  if (!owned) throw new Error("Không tìm thấy bài học hoặc bạn không sở hữu.");

  await db.update(lessonsTable).set({ youtubeUrl: null }).where(eq(lessonsTable.id, lessonId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

// Tạm thời tự phục vụ (self-serve): bất kỳ user nào cũng có thể trở thành instructor.
// Chưa có quy trình duyệt của admin (phase 11 chưa build) — ghi rõ đây là giản lược MVP.
export async function becomeInstructor() {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập.");
  if (appUser.role === "student") {
    await db.update(usersTable).set({ role: "instructor" }).where(eq(usersTable.id, appUser.id));
  }
  redirect("/instructor");
}
