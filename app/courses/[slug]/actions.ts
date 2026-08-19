"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable, enrollmentsTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";
import { createVnpayPaymentUrl } from "@/lib/vnpay";

export async function enrollFree(courseId: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập để đăng ký khoá học.");

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(and(eq(coursesTable.id, courseId), eq(coursesTable.published, true)));
  if (!course) throw new Error("Khoá học không tồn tại.");
  if (course.price && Number(course.price) > 0) {
    throw new Error("Khoá học này cần thanh toán, không thể đăng ký miễn phí.");
  }

  const [existing] = await db
    .select()
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.userId, appUser.id), eq(enrollmentsTable.courseId, courseId)));

  if (!existing) {
    await db.insert(enrollmentsTable).values({ userId: appUser.id, courseId, status: "paid" });
  }

  revalidatePath(`/courses/${course.slug}`);
}

export async function payWithVnpay(courseId: number) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("Bạn cần đăng nhập để thanh toán.");

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(and(eq(coursesTable.id, courseId), eq(coursesTable.published, true)));
  if (!course) throw new Error("Khoá học không tồn tại.");

  const price = course.price ? Number(course.price) : 0;
  if (price <= 0) throw new Error("Khoá học này miễn phí, không cần thanh toán.");

  // Chỉ tái dùng enrollment đang "pending" thật sự (chưa ai xác nhận kết quả gì).
  // KHÔNG tái dùng enrollment "failed" — nó đã bị finalizeEnrollmentFromVnpay chốt trạng thái
  // (idempotent guard), tái dùng cùng id sẽ khiến lần thanh toán lại thành công vẫn bị coi là
  // "đã chốt" và không bao giờ chuyển sang "paid". Tạo enrollment mới (id mới = txnRef mới) thay vào đó.
  const [existing] = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.userId, appUser.id),
        eq(enrollmentsTable.courseId, courseId),
        eq(enrollmentsTable.status, "pending"),
      ),
    );

  const enrollment =
    existing ??
    (
      await db
        .insert(enrollmentsTable)
        .values({ userId: appUser.id, courseId, status: "pending" })
        .returning()
    )[0];

  const h = await headers();
  const ipAddr = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  const paymentUrl = createVnpayPaymentUrl({
    amountVnd: price,
    txnRef: String(enrollment.id),
    orderInfo: `Thanh toan khoa hoc: ${course.title}`,
    ipAddr,
  });

  redirect(paymentUrl);
}
