import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable, enrollmentsTable, usersTable } from "@/config/schema";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

type Enrollment = typeof enrollmentsTable.$inferSelect;

export type FinalizeResult =
  | { outcome: "not_found" }
  | { outcome: "already_confirmed"; enrollment: Enrollment }
  | { outcome: "updated"; enrollment: Enrollment };

/** Idempotent: gọi lại nhiều lần (VNPay IPN có thể gọi lặp) không ghi đè trạng thái đã chốt. */
export async function finalizeEnrollmentFromVnpay(
  txnRef: string,
  success: boolean,
  transactionNo: string | undefined,
): Promise<FinalizeResult> {
  const enrollmentId = Number(txnRef);
  if (!enrollmentId) return { outcome: "not_found" };

  const [enrollment] = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.id, enrollmentId));
  if (!enrollment) return { outcome: "not_found" };

  if (enrollment.status === "paid" || enrollment.status === "failed") {
    return { outcome: "already_confirmed", enrollment };
  }

  const [updated] = await db
    .update(enrollmentsTable)
    .set({ status: success ? "paid" : "failed", paymentRef: transactionNo ?? txnRef })
    .where(eq(enrollmentsTable.id, enrollmentId))
    .returning();

  if (success) {
    const [row] = await db
      .select({ userName: usersTable.name, userEmail: usersTable.email, courseTitle: coursesTable.title, price: coursesTable.price })
      .from(usersTable)
      .innerJoin(coursesTable, eq(coursesTable.id, updated.courseId))
      .where(eq(usersTable.id, updated.userId));

    if (row) {
      await createNotification(
        updated.userId,
        "payment",
        "Thanh toán thành công",
        `Bạn đã đăng ký khoá học "${row.courseTitle}".`,
      );
      await sendPaymentConfirmationEmail(row.userEmail, row.userName, row.courseTitle, Number(row.price ?? 0));
    }
  }

  return { outcome: "updated", enrollment: updated };
}
