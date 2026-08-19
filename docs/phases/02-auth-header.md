# Phase 02 — Auth thật + Header

## Mục tiêu

Header phản ánh đúng trạng thái đăng nhập thật (Clerk), và phân role student/instructor/admin để định tuyến đúng dashboard.

## Trạng thái hiện tại

Clerk đã wire đầy đủ (`ClerkProvider` ở `app/layout.tsx`, `clerkMiddleware()` ở `proxy.ts`, route `/sign-in` `/sign-up` hoạt động, `app/provider.tsx` tự tạo user row qua `/api/user` khi login). Nhưng `components/site/header.tsx` vẫn hiển thị nút "Sign In"/"Get Started" tĩnh, KHÔNG dùng `SignedIn`/`SignedOut`/`UserButton` — trạng thái đăng nhập không phản ánh trên UI.

## Việc cần làm

### Backend
- [x] `app/api/user/route.tsx`: role mặc định `"student"` đã tự áp dụng qua DB column default (`config/schema.ts`, phase 00) — insert không set `role` thì Postgres tự điền, không cần sửa code route.
- [x] Middleware `proxy.ts`: bảo vệ `/dashboard`, `/profile`, `/settings`, `/learn`, `/instructor`, `/admin` — chưa login → redirect `/sign-in?redirect_url=...` (`auth.protect()`). **Đổi so với plan ban đầu**: KHÔNG check role trong middleware. Doc Next.js của bản này (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`, mục "Optimistic checks with Proxy") nói rõ Proxy chạy trên mọi request kể cả prefetch nên chỉ nên đọc cookie/session (optimistic), tránh query DB ở đây vì tốn hiệu năng. Role sống trong Postgres (không phải Clerk session claim) nên role-check thật sự phải nằm ở layer route/layout (secure check) — xem `lib/auth.ts` (`getCurrentAppUser`), sẽ dùng khi build `/instructor` và `/admin` ở phase 10/11 (route chưa tồn tại nên chưa áp guard cụ thể được, chỉ mới thêm matcher sẵn trong Proxy).

### Frontend wiring
- [x] `components/site/header.tsx`: đổi từ nút tĩnh sang kiểm tra `auth()` thật (`userId`) để hiện Sign In/Get Started hoặc user menu. **Đổi so với plan ban đầu**: KHÔNG dùng `<SignedIn>`/`<SignedOut>` — bản Clerk này (`@clerk/nextjs@7.7.8`, "Core 3") đã xoá hẳn 2 component đó, gọi vào là throw runtime error ngay (`node_modules/@clerk/nextjs/dist/esm/removedControlComponents.js`). Conditional render qua `auth()`/`userId` là cách đúng cho bản này.
- [x] `<UserButton>` custom menu item link tới `/profile`, `/settings`, và `/instructor`/`/admin` nếu role tương ứng — implement ở `components/site/user-menu.tsx` (Client Component riêng). Role lấy qua `getCurrentAppUser()` (`lib/auth.ts`, query Postgres theo email từ `currentUser()`).
- [x] Redirect sau sign-in: giữ `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/` hiện tại — role-based redirect (instructor→/instructor, admin→/admin) hoãn tới phase 10/11 vì các route đó chưa tồn tại, redirect vào route 404 không có ý nghĩa lúc này.

### Test
- [x] Đăng nhập/đăng xuất thật trên browser (Chrome thật, tài khoản Google thật của user) — verify: user menu mở đúng (Profile/Settings hiện, Instructor/Admin ẩn vì role hiện là "student"), click "Profile" điều hướng đúng `/profile`, `/dashboard` truy cập được khi đã login, Sign out xong quay `/`, sau đó `/dashboard` tự redirect `/sign-in?redirect_url=...`. Console sạch (chỉ có warning "development keys" mặc định của Clerk, không phải lỗi).
- [ ] User role `instructor` không vào được `/admin` (và ngược lại) — chưa test được vì `/instructor`, `/admin` chưa tồn tại (phase 10/11); DAL `getCurrentAppUser` đã sẵn sàng để dùng khi build 2 route đó.

## Sự cố phát hiện + đã sửa khi implement

- `<UserButton><UserButton.MenuItems>...</UserButton.MenuItems></UserButton>` viết trực tiếp trong `header.tsx` (Server Component async) bị Clerk báo lỗi runtime "can only accept ... as its children" dù cú pháp đúng chuẩn Clerk — nguyên nhân: JSX của các compound-component con (`UserButton.MenuItems`, `UserButton.Link`) mất định danh tham chiếu khi serialize qua ranh giới Server→Client Component. Fix: tách toàn bộ khối `UserButton` + `MenuItems` sang Client Component riêng (`components/site/user-menu.tsx`, nhận `role` như prop string thường), `header.tsx` chỉ truyền dữ liệu chứ không author JSX con của Clerk nữa.
- **(Phát hiện ở phase 05, ghi lại đây vì thuộc phạm vi middleware)**: dev log xuất hiện `Clerk - DEPRECATION WARNING: "createRouteMatcher" is deprecated and will be removed in the next major release` — Clerk khuyến nghị bỏ hẳn middleware path-matching, chuyển auth check vào từng page/layout/route (`auth.protect()` hoặc DAL gọi trực tiếp). Đây đúng là hướng đã chọn cho role-check (xem note ở mục Backend phía trên), chỉ khác là Clerk giờ khuyến nghị áp dụng luôn cho cả check "đã đăng nhập chưa" chứ không riêng role. Chưa migrate `proxy.ts` ngay — để làm cùng lúc dựng layout `/instructor`, `/admin` ở phase 10/11 (lúc đó thay `createRouteMatcher`/`auth.protect()` tập trung bằng `auth()`/`getCurrentAppUser()` gọi trực tiếp trong từng layout cần bảo vệ).

## File liên quan

- `components/site/header.tsx`
- `components/site/user-menu.tsx` (mới)
- `lib/auth.ts` (mới — DAL `getCurrentAppUser`, dùng cho role-based authorization ở route/layout thay vì middleware)
- `proxy.ts`
- `app/provider.tsx`
- `app/api/user/route.tsx`
- `context/UserDetailContext.tsx` (`User` type thêm `role`, `avatarUrl`)
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`, `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
