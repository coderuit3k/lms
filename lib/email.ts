import { Resend } from "resend";

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || "Scholaris <onboarding@resend.dev>";

async function send(to: string, subject: string, html: string) {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY chưa cấu hình, bỏ qua gửi email "${subject}" tới ${to}.`);
    return;
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    if (result.error) console.error("[email] Resend trả lỗi:", result.error);
  } catch (err) {
    console.error("[email] Gửi email thất bại:", err);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  await send(
    to,
    "Chào mừng đến với Scholaris!",
    `<div style="font-family: sans-serif">
      <h2>Chào ${name},</h2>
      <p>Cảm ơn bạn đã tham gia Scholaris. Khám phá khoá học và bắt đầu học ngay hôm nay.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/courses">Khám phá khoá học</a></p>
    </div>`,
  );
}

export async function sendPaymentConfirmationEmail(to: string, name: string, courseTitle: string, amountVnd: number) {
  await send(
    to,
    "Xác nhận thanh toán thành công",
    `<div style="font-family: sans-serif">
      <h2>Chào ${name},</h2>
      <p>Bạn đã đăng ký thành công khoá học <strong>${courseTitle}</strong>.</p>
      <p>Số tiền: ${amountVnd.toLocaleString("vi-VN")}đ</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard">Vào học ngay</a></p>
    </div>`,
  );
}
