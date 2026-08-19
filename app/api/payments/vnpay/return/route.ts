import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { isVnpaySuccess, verifyVnpaySignature } from "@/lib/vnpay";
import { finalizeEnrollmentFromVnpay } from "@/lib/payments";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const { valid, params } = verifyVnpaySignature(req.nextUrl.searchParams);

  if (!valid) {
    return NextResponse.redirect(`${baseUrl}/payments/result?status=invalid`);
  }

  const success = isVnpaySuccess(params);
  const result = await finalizeEnrollmentFromVnpay(params.vnp_TxnRef, success, params.vnp_TransactionNo);

  if (result.outcome === "not_found") {
    return NextResponse.redirect(`${baseUrl}/payments/result?status=error`);
  }

  const [course] = await db
    .select({ slug: coursesTable.slug })
    .from(coursesTable)
    .where(eq(coursesTable.id, result.enrollment.courseId));

  const statusParam = result.enrollment.status === "paid" ? "success" : "failed";
  const courseParam = course ? `&course=${encodeURIComponent(course.slug)}` : "";

  return NextResponse.redirect(`${baseUrl}/payments/result?status=${statusParam}${courseParam}`);
}
