"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { Mux } from "@mux/mux-node";
import { db } from "@/config/db";
import { coursesTable, enrollmentsTable, lessonsTable, modulesTable, progressTable, usersTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";
import { canManageCourses, getOwnedCourse, getOwnedLesson, getOwnedModule } from "@/lib/instructor";
import { createNotification } from "@/lib/notifications";

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

export async function createCourse(formData: FormData) {
  const appUser = await requireInstructor();
  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  if (!title) throw new Error("Thiếu tên khoá học.");

  const [course] = await db
    .insert(coursesTable)
    .values({ instructorId: appUser.id, title, slug: slugify(title) })
    .returning();

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
  if (!title) throw new Error("Thiếu tên module.");

  const existing = await db.select().from(modulesTable).where(eq(modulesTable.courseId, courseId));
  const nextOrder = existing.reduce((max, m) => Math.max(max, m.order), -1) + 1;

  await db.insert(modulesTable).values({ courseId, title, order: nextOrder });

  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function updateModuleTitle(moduleId: number, formData: FormData) {
  const appUser = await requireInstructor();
  const owned = await getOwnedModule(appUser.id, appUser.role === "admin", moduleId);
  if (!owned) throw new Error("Không tìm thấy module hoặc bạn không sở hữu.");

  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  if (!title) throw new Error("Tên module không được để trống.");

  await db.update(modulesTable).set({ title }).where(eq(modulesTable.id, moduleId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function deleteModule(moduleId: number) {
  const appUser = await requireInstructor();
  const owned = await getOwnedModule(appUser.id, appUser.role === "admin", moduleId);
  if (!owned) throw new Error("Không tìm thấy module hoặc bạn không sở hữu.");

  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId));
  if (lessons.length > 0) throw new Error("Xoá hết bài học trong module trước khi xoá module.");

  await db.delete(modulesTable).where(eq(modulesTable.id, moduleId));
  revalidatePath(`/instructor/courses/${owned.course.id}`);
}

export async function moveModule(moduleId: number, direction: "up" | "down") {
  const appUser = await requireInstructor();
  const owned = await getOwnedModule(appUser.id, appUser.role === "admin", moduleId);
  if (!owned) throw new Error("Không tìm thấy module hoặc bạn không sở hữu.");

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
  if (!owned) throw new Error("Không tìm thấy module hoặc bạn không sở hữu.");

  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  if (!title) throw new Error("Thiếu tên bài học.");
  const content = String(formData.get("content") ?? "").trim();
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const duration = durationRaw ? Number(durationRaw) : null;

  const existing = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId));
  const nextOrder = existing.reduce((max, l) => Math.max(max, l.order), -1) + 1;

  await db.insert(lessonsTable).values({ moduleId, title, content: content || null, duration, order: nextOrder });

  if (owned.course.published) {
    await notifyEnrolledStudentsOfNewLesson(owned.course.id, owned.course.title, title);
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

  const title = String(formData.get("title") ?? "").trim().slice(0, 255);
  if (!title) throw new Error("Tên bài học không được để trống.");
  const content = String(formData.get("content") ?? "").trim();
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const duration = durationRaw ? Number(durationRaw) : null;

  await db.update(lessonsTable).set({ title, content: content || null, duration }).where(eq(lessonsTable.id, lessonId));
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

export async function createMuxUpload(lessonId: number): Promise<{ uploadUrl: string }> {
  const appUser = await requireInstructor();
  const owned = await getOwnedLesson(appUser.id, appUser.role === "admin", lessonId);
  if (!owned) throw new Error("Không tìm thấy bài học hoặc bạn không sở hữu.");

  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("Chưa cấu hình MUX_TOKEN_ID/MUX_TOKEN_SECRET.");
  }

  const mux = new Mux();
  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    new_asset_settings: {
      playback_policies: ["public"],
      passthrough: String(lessonId),
    },
  });

  if (!upload.url) throw new Error("Mux không trả về upload URL.");
  return { uploadUrl: upload.url };
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
