# Phase 05 — Course Detail (`/courses/[slug]`, đổi tên từ `[id]`)

## Mục tiêu

Trang chi tiết khoá học hiển thị data thật, có CTA đăng ký/mua khoá học nối với flow thanh toán.

## Trạng thái hiện tại

`app/courses/[id]/page.tsx` — static, dùng `getCourse(id)` lookup trong `lib/mock-data.ts`.

## Việc cần làm

### Backend / Data
- [x] `getCourseBySlug` thật (`lib/queries.ts`): query theo `slug` (đổi route folder `app/courses/[id]` → `app/courses/[slug]` cho khớp — trước đó thư mục tên `[id]` nhưng mọi link trong app đã trỏ bằng slug từ phase 01/03/04, giờ đặt tên đúng bản chất), kèm `modules`/`lessons` lồng nhau (2 query phụ, order theo cột `order`), instructor name/avatar. **Rating/review bỏ khỏi checklist gốc** — không có bảng review nào trong schema, thay bằng `enrollmentCount` (nhất quán với card ở phase 01/04).
- [x] `getEnrollmentStatus(userId, courseId)` — check user hiện tại đã đăng ký chưa, trạng thái gì (`paid`/`pending`).

### Frontend wiring
- [x] Thay data source từ mock sang DB thật hoàn toàn.
- [x] CTA theo đúng 4 trạng thái: **chưa login** → "Đăng nhập để đăng ký" (trỏ `/sign-up`); **đã login, free, chưa đăng ký** → nút "Đăng ký miễn phí" gọi Server Action `enrollFree` (insert `enrollments` status `paid` ngay, có validate lại giá ở server — không tin giá phía client, đúng theo `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` mục Security); **đã login, có giá, chưa đăng ký** → nút disabled "Thanh toán VNPay (sắp ra mắt)" vì phase 12 (VNPay) chưa build, link/API thật chưa tồn tại nên không thể bấm được thật — cố tình disable thay vì trỏ tới route chết; **đã đăng ký (`status=paid`)** → "Vào học" trỏ `/learn/[firstLessonId]` (forward-reference sang phase 06, giống cách các phase trước trỏ tới route của phase sau).
- [x] 404 chuẩn qua `notFound()` (Next `next/navigation`) khi slug không tồn tại hoặc course chưa `published`.
- [x] "Course Includes" sidebar: bỏ hết số liệu bịa của bản mock cũ ("42 hours video", "15 downloadable resources") — thay bằng số liệu tính thật từ curriculum (tổng số bài học, tổng thời lượng cộng dồn từ `lessons.duration`). "Truy cập trọn đời"/"Chứng chỉ khi hoàn thành" giữ lại vì là chính sách thật (certificate được cấp thật ở phase 09 khi hoàn thành 100%), không phải số liệu bịa.
- [x] Bỏ instructor bio/title/rating khỏi UI — schema `usersTable` không có các cột này, chỉ hiển thị tên + avatar (fallback icon nếu chưa có avatar).

### Test
- [x] Course không tồn tại → 404 đúng (`curl /courses/does-not-exist` → 404; route `[id]` cũ cũng 404 đúng sau khi đổi tên thư mục).
- [x] Seed course/module/lesson tạm lên DB Neon thật (script chạy 1 lần, xoá ngay sau khi verify) → detail page render đúng: title, curriculum, duration, giá "Miễn phí", CTA "Đăng nhập để đăng ký" (đúng vì request không có session). Đã dọn sạch data test, xác nhận lại 404 sau khi xoá.
- [ ] User đã mua thấy CTA "Vào học" — **chưa test được qua UI thật** (cần session đăng nhập thật, không tự đăng nhập hộ user theo chính sách an toàn); logic đã review kỹ theo Server Actions security guide, sẽ verify khi user tự đăng nhập và bấm "Đăng ký miễn phí" trên course thật.

## Sự cố phát hiện khi implement (không thuộc phase này, note lại)

- `npx tsc --noEmit` sạch nhưng lần `curl` đầu tiên vào route mới bị lỗi 500 `DrizzleQueryError` — chạy lại y hệt query đó bằng script độc lập thì thành công ngay, và `curl` lần 2 cũng 200 bình thường. Kết luận: cold-start/connection race của Neon HTTP driver ngay sau khi Turbopack compile xong route mới (log server show "Finished filesystem cache database compaction" ngay trước đó), không phải bug trong query. Không cần sửa gì, chỉ ghi nhận — nếu gặp lại 500 thoáng qua ngay sau khi thêm route mới, thử lại trước khi debug sâu.
- Log dev server xuất hiện cảnh báo mới: `Clerk - DEPRECATION WARNING: "createRouteMatcher" is deprecated`, khuyến nghị chuyển hẳn sang resource-based auth check (auth ngay trong từng page/layout) thay vì middleware path-matching — đúng tinh thần quyết định đã ghi ở phase 02 (Proxy chỉ nên optimistic-check). Chưa migrate ngay (out of scope phase này) — ghi lại ở `docs/phases/02-auth-header.md` để làm khi build layout `/instructor`, `/admin` (phase 10/11), lúc đó thay `createRouteMatcher` bằng `auth.protect()`/`getCurrentAppUser()` gọi trực tiếp trong từng layout.

## File liên quan

- `app/courses/[slug]/page.tsx` (đổi tên từ `[id]`)
- `app/courses/[slug]/actions.ts` (mới — Server Action `enrollFree`)
- `lib/queries.ts` (`getCourseBySlug`, `getEnrollmentStatus`)
- `lib/mock-data.ts` (không còn được dùng ở trang này)
- `config/schema.ts` (bảng `courses`, `modules`, `lessons`, `enrollments`)
