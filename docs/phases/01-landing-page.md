# Phase 01 — Landing Page (`/`)

## Mục tiêu

Trang chủ chuyển từ bento-grid tĩnh sang hiển thị dữ liệu khoá học thật, tối ưu chuyển đổi (signup/khám phá khoá học).

## Trạng thái hiện tại

`app/page.tsx` — static, render "trending courses" từ `lib/mock-data.ts`, không có data thật, không có `generateMetadata`.

## Việc cần làm

### Backend / Data
- [x] Query top/trending courses thật từ bảng `courses` (order theo enrollment count — chưa có field rating trong schema nên dùng số lượt đăng ký làm tín hiệu "trending"). Thêm `lib/queries.ts` (`getTrendingCourses`, `getPublishedCourseCount`, `getCategories`).
- [x] Query categories thật (distinct `category` của course published) thay vì mảng tĩnh `categories` trong mock data.

### Frontend wiring
- [x] Thay `lib/mock-data.ts` bằng data fetch thật (Server Component `app/page.tsx` fetch trực tiếp qua Drizzle, không dùng API route riêng).
- [x] Empty state khi chưa có course nào published — verify thật: DB hiện có 0 course published → trang render đúng block "Chưa có khoá học nào được xuất bản", không lỗi.
- [x] CTA "Get Started"/"Sign In" ở header (`components/site/header.tsx`) đổi thành `Link` thật theo trạng thái Clerk `auth()`: chưa login → `/sign-in`/`/sign-up`, đã login → nút "Dashboard" trỏ `/dashboard`. (Đây là phần nền tảng của header; wiring đầy đủ `SignedIn/UserButton`/role-redirect vẫn thuộc phase 02.)
- [x] Card khoá học (hero + compact) không còn fake `rating`/`reviews` — hiển thị số học viên (`enrollmentCount`) và giá thật (format VND, "Miễn phí" khi giá 0/null) thay vì số liệu bịa.
- [x] "Not sure where to start?" prompt đổi copy theo trạng thái đăng nhập thật (đã login → trỏ Dashboard, chưa login → trỏ `/sign-up`).

### Test
- [x] Render trang chủ khi DB rỗng (0 courses) không lỗi — verify qua `curl http://localhost:3000/` trên dev server thật, thấy đúng text empty state, `npx tsc --noEmit` sạch.

## File liên quan

- `app/page.tsx`
- `lib/queries.ts` (mới)
- `components/site/header.tsx` (CTA auth-aware)
- `lib/mock-data.ts` (không còn được `app/page.tsx` dùng nữa — các export khác vẫn cần cho phase 03/05/07/08/09, xoá hẳn khi các phase đó xong)
