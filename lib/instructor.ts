import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable, lessonsTable, modulesTable } from "@/config/schema";
import type { AppUser } from "@/lib/auth";

export function canManageCourses(appUser: Pick<AppUser, "role">): boolean {
  return appUser.role === "instructor" || appUser.role === "admin";
}

/** Course owned by `userId`, or accessible because the user is an admin. */
export async function getOwnedCourse(userId: number, isAdmin: boolean, courseId: number) {
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
  if (!course) return null;
  if (!isAdmin && course.instructorId !== userId) return null;
  return course;
}

export async function getOwnedModule(userId: number, isAdmin: boolean, moduleId: number) {
  const [row] = await db
    .select({ module: modulesTable, course: coursesTable })
    .from(modulesTable)
    .innerJoin(coursesTable, eq(modulesTable.courseId, coursesTable.id))
    .where(eq(modulesTable.id, moduleId));
  if (!row) return null;
  if (!isAdmin && row.course.instructorId !== userId) return null;
  return row;
}

export async function getOwnedLesson(userId: number, isAdmin: boolean, lessonId: number) {
  const [row] = await db
    .select({ lesson: lessonsTable, module: modulesTable, course: coursesTable })
    .from(lessonsTable)
    .innerJoin(modulesTable, eq(lessonsTable.moduleId, modulesTable.id))
    .innerJoin(coursesTable, eq(modulesTable.courseId, coursesTable.id))
    .where(eq(lessonsTable.id, lessonId));
  if (!row) return null;
  if (!isAdmin && row.course.instructorId !== userId) return null;
  return row;
}
