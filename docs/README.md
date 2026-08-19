# Scholaris — Roadmap AI Online Learning Platform

Bộ tài liệu này chia việc biến "Scholaris" từ UI prototype tĩnh thành sản phẩm AI Online Learning Platform thật thành các **phase**, mỗi phase gắn với 1 trang/tính năng cụ thể và có checklist việc cần làm.

## Cách dùng

- Mỗi file trong `phases/` có checklist dạng `- [ ] việc cần làm`.
- Khi làm xong 1 việc, tick thành `- [x] việc cần làm` (render thành checkbox xanh trên GitHub/hầu hết Markdown viewer).
- Key môi trường cần cho từng phase: xem [`.env.example`](../.env.example) ở root repo (comment ghi rõ key nào dùng ở phase nào).

## Trạng thái nền tảng hiện tại (baseline)

Next.js 16 (custom build) + Tailwind v4 + shadcn, Clerk auth thật, Drizzle + Neon Postgres với 10 bảng thật (users, courses, modules, lessons, enrollments, progress, certificates, threads, replies, resources, notifications). Toàn bộ trang chính đã chạy data thật qua Drizzle — AI Tutor (Anthropic/OpenAI), thanh toán VNPay, video Mux, upload UploadThing, email Resend, search full-text Postgres đều đã nối dây thật (không còn mock). `lib/mock-data.ts` không còn được page nào dùng (dead code, chưa xoá khỏi file). Xem mục **Test toàn hệ thống** bên dưới cho kết quả kiểm tra gần nhất.

## Danh sách phase

| # | Phase | Trang/Tính năng | Trạng thái |
|---|-------|------------------|------------|
| 00 | [Foundation](./phases/00-foundation.md) | DB schema, bảo mật env, setup SDK | 🟡 Gần xong (chỉ còn user tự điền key thật) |
| 01 | [Landing Page](./phases/01-landing-page.md) | `/` | ✅ Xong |
| 02 | [Auth + Header](./phases/02-auth-header.md) | Header, role routing | 🟡 Gần xong (role-guard `/instructor`/`/admin` chờ phase 10/11) |
| 03 | [Student Dashboard](./phases/03-dashboard-student.md) | `/dashboard` | 🟡 Gần xong (chờ dữ liệu enrollment thật để verify % tiến độ) |
| 04 | [Course Catalog](./phases/04-courses-catalog.md) | `/courses` (route mới) | ✅ Xong (filter giá + search chờ phase 14) |
| 05 | [Course Detail](./phases/05-course-detail.md) | `/courses/[slug]` | 🟡 Gần xong (chờ user tự test flow đăng ký free qua UI thật) |
| 06 | [Learning Player + AI Tutor](./phases/06-learning-player-ai-tutor.md) | `/learn/[lessonId]` | 🟡 Gần xong (chờ Mux asset thật + user tự test UI) |
| 07 | [Community](./phases/07-community.md) | `/community` | ✅ Xong |
| 08 | [Resources](./phases/08-resources.md) | `/resources` | 🟡 Gần xong (chờ user tự test upload qua UI thật) |
| 09 | [Profile & Settings](./phases/09-profile-settings.md) | `/profile`, `/settings` | 🟡 Gần xong (chờ user tự test form/upload qua UI thật) |
| 10 | [Instructor Dashboard](./phases/10-instructor-dashboard.md) | `/instructor` (route mới) | ✅ Xong (chờ user tự test upload video thật qua UI) |
| 11 | [Admin Dashboard](./phases/11-admin-dashboard.md) | `/admin` (route mới) | ✅ Xong (chờ user tự test qua UI với tài khoản admin thật) |
| 12 | [Payments (VNPay)](./phases/12-payments-vnpay.md) | Thanh toán khoá học | ✅ Xong (verify thật với sandbox VNPay, chờ user tự thử full flow qua UI) |
| 13 | [Notifications & Email](./phases/13-notifications-email.md) | Resend, in-app notification | ✅ Xong (đã gửi email thật thành công, verify 2026-08-19) |
| 14 | [Search](./phases/14-search.md) | Tìm kiếm thật | ✅ Xong |
| 16 | [Testing & QA](./phases/16-testing-qa.md) | Test framework + coverage | 🟡 Gần xong (thiếu e2e critical path cần Clerk test-mode) |

Tự cập nhật cột trạng thái (⬜ Chưa bắt đầu / 🟡 Đang làm / ✅ Xong) khi làm tới đâu.

## Test toàn hệ thống

Lần chạy gần nhất: 2026-08-19, sau khi hoàn thành phase 00–14 + 16 (phase 15 SEO đã bỏ theo yêu cầu).

| Lớp kiểm tra | Công cụ | Kết quả |
|---|---|---|
| Type check | `npx tsc --noEmit` | ✅ Sạch, 0 lỗi |
| Lint | `npm run lint` | ✅ 0 error, 2 warning (custom font, pre-existing, không liên quan chức năng) |
| Unit test | `npm run test` (Vitest) | ✅ 30/30 pass — `lib/vnpay.ts`, `lib/instructor.ts`, `lib/certificates.ts`, `lib/ai-tutor.ts`, `course-card.tsx` |
| E2E smoke | `npm run test:e2e` (Playwright, Chromium thật) | ✅ 9/9 pass — trang chủ, catalog, 404, search redirect, route guard 5 route bảo vệ khi chưa login |
| Route sweep thủ công | `curl` thật, 24 route | ✅ 24/24 đúng status kỳ vọng (public 200, protected redirect 307, 404 đúng, API đúng status) |

Không phát hiện regression nào qua toàn bộ 16 phase. Có ghi nhận 1 hiện tượng vận hành không phải bug: route chạm DB đôi khi cold-start-fail ở request đầu tiên sau khi dev server idle một lúc (driver Neon HTTP) — retry ngay lập tức luôn pass, đã test 10 request đồng thời để loại trừ race condition (10/10 pass), kết luận không phải lỗi logic. Đã ghi nhận hiện tượng tương tự lần đầu ở phase 05.

**Còn thiếu** (cần user tự làm, không tự động hoá được do cần session Clerk thật hoặc dữ liệu ngoài):
- E2E critical path có auth thật: sign-up, đăng ký khoá free, full flow thanh toán VNPay, instructor tạo course, role guard khi *đã* login sai role — cần cấu hình Clerk test-mode (xem `docs/phases/16-testing-qa.md`).
- Upload video thật qua Mux, upload file/avatar thật qua UploadThing — cần thao tác tay qua UI.
- Trở thành admin để test `/admin` qua UI — không có cơ chế tự phong như instructor, cần tự sửa `role` trong Neon (xem `docs/phases/11-admin-dashboard.md`).

**Đã xong sau lần test đầu**: `EMAIL_FROM` đổi từ placeholder sang `onboarding@resend.dev`, gửi thật 1 email test tới `thanhconl67@gmail.com` qua đúng code path (`lib/email.ts`) — Resend trả về `id` thành công, không lỗi. Lưu ý: domain `onboarding@resend.dev` chỉ gửi được tới email đã đăng ký tài khoản Resend của bạn — muốn gửi cho học viên thật (không phải chính bạn) cần verify 1 domain riêng trên Resend dashboard rồi đổi `EMAIL_FROM` sang domain đó.

## Thứ tự đề xuất

1. **00 → 02 → 03 → 05 → 06** — hoàn thiện luồng học tập lõi trước (đây là giá trị cốt lõi: học viên học được, AI Tutor trả lời thật).
2. **01, 04, 07, 08, 09** — hoàn thiện các trang còn lại đang chạy mock data.
3. **12** — gắn thanh toán VNPay khi đã có course/enrollment flow ổn định.
4. **10, 11** — dashboard instructor/admin (route hoàn toàn mới, cần thiết để có content thật thay vì seed tay).
5. **13, 14** — notification/email và search nâng trải nghiệm.
6. **16** — testing xuyên suốt, nhưng nên viết test song song ngay khi build từng phần quan trọng (payment, AI tutor), không chỉ dồn về cuối.

Có thể đảo thứ tự 10/11 lên sớm hơn nếu ưu tiên có content thật (do instructor tạo) thay vì tiếp tục dùng mock data khi build phase 01/04/05.
