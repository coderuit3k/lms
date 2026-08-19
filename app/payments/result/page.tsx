import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";

const CONTENT = {
  success: {
    icon: "check_circle",
    color: "text-secondary",
    title: "Thanh toán thành công!",
    body: "Bạn đã đăng ký khoá học thành công. Vào học ngay thôi.",
  },
  failed: {
    icon: "cancel",
    color: "text-error",
    title: "Thanh toán không thành công",
    body: "Giao dịch bị huỷ hoặc thất bại. Bạn có thể thử thanh toán lại.",
  },
  invalid: {
    icon: "warning",
    color: "text-error",
    title: "Không xác thực được giao dịch",
    body: "Chữ ký giao dịch không hợp lệ. Nếu tiền đã bị trừ, vui lòng liên hệ hỗ trợ.",
  },
  error: {
    icon: "error",
    color: "text-error",
    title: "Có lỗi xảy ra",
    body: "Không tìm thấy đơn hàng tương ứng. Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.",
  },
} as const;

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; course?: string }>;
}) {
  const sp = await searchParams;
  const status = (sp.status && sp.status in CONTENT ? sp.status : "error") as keyof typeof CONTENT;
  const info = CONTENT[status];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <SiteHeader showSearch={false} />
      <main className="flex-1 w-full max-w-lg mx-auto px-margin-mobile py-stack-lg flex flex-col items-center justify-center text-center gap-4">
        <MaterialIcon name={info.icon} filled className={`text-6xl ${info.color}`} />
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{info.title}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{info.body}</p>

        <div className="flex items-center gap-3 mt-4">
          {status === "success" && sp.course ? (
            <Link
              href={`/courses/${sp.course}`}
              className="px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
            >
              Vào học ngay
            </Link>
          ) : sp.course ? (
            <Link
              href={`/courses/${sp.course}`}
              className="px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
            >
              Thử lại
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors"
          >
            Về Dashboard
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
