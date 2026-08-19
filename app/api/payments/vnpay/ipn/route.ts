import { NextRequest, NextResponse } from "next/server";
import { isVnpaySuccess, verifyVnpaySignature } from "@/lib/vnpay";
import { finalizeEnrollmentFromVnpay } from "@/lib/payments";

// VNPay gọi endpoint này server-to-server (khác với /return, nơi trình duyệt user được redirect tới).
// Đây là nguồn xác nhận đáng tin cậy để chốt trạng thái thanh toán — /return chỉ dùng để điều hướng UI.
// Response phải đúng format {RspCode, Message} theo spec VNPay.
export async function GET(req: NextRequest) {
  const { valid, params } = verifyVnpaySignature(req.nextUrl.searchParams);

  if (!valid) {
    return NextResponse.json({ RspCode: "97", Message: "Invalid signature" });
  }

  const txnRef = params.vnp_TxnRef;
  if (!txnRef) {
    return NextResponse.json({ RspCode: "01", Message: "Order not found" });
  }

  const success = isVnpaySuccess(params);
  const result = await finalizeEnrollmentFromVnpay(txnRef, success, params.vnp_TransactionNo);

  if (result.outcome === "not_found") {
    return NextResponse.json({ RspCode: "01", Message: "Order not found" });
  }
  if (result.outcome === "already_confirmed") {
    return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
  }

  return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
}
