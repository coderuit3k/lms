"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable, usersTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";

async function requireAdmin() {
  const appUser = await getCurrentAppUser();
  if (!appUser || appUser.role !== "admin") throw new Error("Bạn không có quyền quản trị.");
  return appUser;
}

const VALID_ROLES = ["student", "instructor", "admin"];

export async function updateUserRole(userId: number, formData: FormData) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("Không thể tự đổi role của chính mình.");

  const role = String(formData.get("role") ?? "");
  if (!VALID_ROLES.includes(role)) throw new Error("Role không hợp lệ.");

  await db.update(usersTable).set({ role }).where(eq(usersTable.id, userId));
  revalidatePath("/admin/users");
}

export async function toggleUserStatus(userId: number) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("Không thể tự khoá tài khoản của chính mình.");

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) throw new Error("Không tìm thấy user.");

  await db
    .update(usersTable)
    .set({ status: user.status === "banned" ? "active" : "banned" })
    .where(eq(usersTable.id, userId));

  revalidatePath("/admin/users");
}

export async function forceUnpublishCourse(courseId: number) {
  await requireAdmin();
  await db.update(coursesTable).set({ published: false, updatedAt: new Date() }).where(eq(coursesTable.id, courseId));
  revalidatePath("/admin/courses");
}
