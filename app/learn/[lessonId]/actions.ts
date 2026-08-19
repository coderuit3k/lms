"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/config/db";
import { certificatesTable, lessonsTable, modulesTable, progressTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";
import { getEnrollmentStatus } from "@/lib/queries";
import { shouldIssueCertificate } from "@/lib/certificates";

export async function markLessonComplete(lessonId: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) return;

  const [row] = await db
    .select({ courseId: modulesTable.courseId })
    .from(lessonsTable)
    .innerJoin(modulesTable, eq(lessonsTable.moduleId, modulesTable.id))
    .where(eq(lessonsTable.id, lessonId));
  if (!row) return;

  const status = await getEnrollmentStatus(appUser.id, row.courseId);
  if (status !== "paid") return;

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
