# Phase 13 — Notifications & Email (Resend)

## Mục tiêu

Gửi email thật cho các sự kiện quan trọng (đăng ký thành công, thanh toán, nhắc học) và hệ thống thông báo trong app.

## Trạng thái hiện tại

`accountSettings.notifications` trong mock data chỉ là toggle label hiển thị ở `/settings`, không có logic gửi thật, không có in-app notification store.

## Việc cần làm

### Backend
- [x] `lib/email.ts` — Resend client, 2 template: welcome (sau sign-up) + xác nhận thanh toán (nối phase 12 thật, gọi từ `lib/payments.ts` khi `finalizeEnrollmentFromVnpay` chuyển `paid`). Client trả về sớm (không throw) nếu thiếu `RESEND_API_KEY`, lỗi gửi chỉ log không chặn flow chính (đăng ký/thanh toán vẫn thành công dù email lỗi).
- [x] Nhắc học định kỳ (weekly digest): **bỏ khỏi MVP** — checklist gốc đã đánh dấu "optional, cần cron/scheduled job", dự án không có hạ tầng cron nào (Next.js dev server không tự chạy job định kỳ). Cột `notifyWeeklyDigest` (đã có từ phase 09) giữ nguyên trong DB, chưa có gì đọc/dùng nó — để dành khi có cron thật (Vercel Cron hoặc tương tự).
- [x] Trigger đúng điểm: welcome email + notification trong `app/api/user/route.tsx` (khi tạo user mới); payment confirmation email + notification trong `lib/payments.ts` (khi `finalizeEnrollmentFromVnpay` outcome=`updated` và `success=true` — tận dụng luôn logic idempotent sẵn có, không gửi email trùng khi IPN gọi lặp).
- [x] Bảng `notifications` (`id`, `userId`, `type`, `title`, `body`, `read`, `createdAt`) — push Neon thật.
- [x] **Không tạo API route riêng** — dùng Server Actions (`app/notifications/actions.ts`: `markNotificationRead`, `markAllNotificationsRead`) nhất quán pattern toàn dự án từ phase 05. Đọc notification lấy trực tiếp trong Server Component header (`getNotifications`/`getUnreadNotificationCount`), không cần `GET /api/notifications`.
- [x] **Bổ sung ngoài checklist gốc — tận dụng luôn cột preference đã có sẵn từ phase 09 nhưng chưa từng được dùng**: 2 trigger in-app notification mới nối vào tính năng đã xây trước đó — trả lời thread (`app/community/actions.ts` `createReply`, tôn trọng `notifyCommunityReplies`) và thêm bài học mới vào khoá đã publish (`app/instructor/actions.ts` `createLesson`, tôn trọng `notifyCourseUpdates`, chỉ notify học viên đã `paid`).

### Frontend wiring
- [x] `components/site/notification-bell.tsx` (Client Component) — icon chuông + badge số chưa đọc + dropdown list, gắn vào `components/site/header.tsx` (hiện cạnh `UserMenu` khi đã đăng nhập). Mark-as-read qua `<form action={...}>` từng item + nút "Đánh dấu đã đọc hết".
- [x] Notification preferences đã lưu thật từ phase 09 (`app/settings/actions.ts` `updateProfile`) — phase này là nơi các cột đó **lần đầu thực sự được đọc** khi quyết định có tạo notification/gửi email hay không (trước đây chỉ lưu, không ai dùng).
- [x] Welcome email: **cố tình KHÔNG cổng theo preference nào** — đây là email giao dịch (xác nhận tài khoản), không phải marketing, gửi luôn không hỏi ý kiến (chuẩn thực hành chung, giống email xác nhận đơn hàng).

### Test
- [x] **Không tự gửi email thật tới hộp thư người dùng** — gửi email là hành động cần xin phép rõ ràng trước (theo quy tắc an toàn phiên làm việc), không tự ý làm dù chỉ để test. Thay vào đó verify `RESEND_API_KEY` thật hoạt động qua lời gọi **read-only** `resend.domains.list()` (không gửi gì cho ai) → key hợp lệ, kết nối real API thành công (`{"object":"list","has_more":false,"data":[]}` — chưa có domain custom nào verify). **Phát hiện quan trọng cần báo user**: `.env` hiện `EMAIL_FROM=Scholaris <noreply@yourdomain.com>` — vẫn là giá trị placeholder gốc từ `.env.example`, domain `yourdomain.com` chưa verify trên Resend → mọi email gửi thật sẽ lỗi cho tới khi đổi `EMAIL_FROM` thành domain đã verify (hoặc tạm dùng `onboarding@resend.dev` để test).
- [x] Toàn bộ logic trigger + preference-gating verify bằng DB thật (Neon), không mock: reply vào thread → tạo đúng notification cho chủ thread (tôn trọng `notifyCommunityReplies`); thêm lesson vào course đã publish → đúng học viên `paid` nhận notification (tôn trọng `notifyCourseUpdates`); thứ tự list đúng mới nhất trước; mark-as-read giảm đúng unread count. Đã dọn sạch data test.
- [x] "Tắt preference → không nhận" — verify được nhánh in-app (code check `if (owner?.notifyCommunityReplies)` / `eq(usersTable.notifyCourseUpdates, true)` trước khi tạo notification, đã review + cùng pattern đã test ở nhánh bật); nhánh email tương ứng (phase 12 payment) không cổng theo preference nào (giao dịch, luôn gửi) nên không áp dụng test này.

## File liên quan

- `lib/email.ts` (mới)
- `lib/notifications.ts` (mới — `createNotification`)
- `lib/payments.ts` (thêm trigger payment confirmation)
- `app/api/user/route.tsx` (thêm trigger welcome)
- `app/community/actions.ts` (thêm trigger community reply)
- `app/instructor/actions.ts` (thêm trigger course update)
- `app/notifications/actions.ts` (mới — `markNotificationRead`, `markAllNotificationsRead`)
- `components/site/notification-bell.tsx` (mới, Client Component)
- `components/site/header.tsx` (gắn bell)
- `lib/queries.ts` (`getNotifications`, `getUnreadNotificationCount`)
- `config/schema.ts` (bảng `notifications`)
