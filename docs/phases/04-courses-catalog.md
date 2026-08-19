# Phase 04 — Course Catalog (`/courses` — route mới)

## Mục tiêu

Trang danh sách/khám phá toàn bộ khoá học với filter theo category/level/giá, có tìm kiếm — hiện chưa tồn tại route này, cần tạo mới hoàn toàn.

## Trạng thái hiện tại

Không có route `/courses` (chỉ có `/courses/[id]` cho chi tiết 1 khoá). Trang chủ chỉ hiển thị vài "trending courses" trong bento-grid, không có trang browse đầy đủ.

## Việc cần làm

### Backend / Data
- [x] Query toàn bộ `courses` published, hỗ trợ filter (`category`, `level`), sort (mới nhất/phổ biến/giá tăng/giá giảm) — `lib/queries.ts` (`getCourseList`), dùng conditional aggregate cho "phổ biến" (đếm enrollment) giống `getTrendingCourses`. Filter khoảng giá (min/max) **bỏ khỏi MVP** — UI phức tạp hơn (range input) mà chưa rõ nhu cầu thật, sort theo giá đã đủ dùng cho giờ.
- [x] Pagination offset-based (`page`/`pageSize=12`), trả kèm `total` để tính tổng số trang.

### Frontend wiring
- [x] Tạo `app/courses/page.tsx` — grid card khoá học 1/2/3 cột responsive.
- [x] Tách `CourseCard` (trước đây viết riêng trong `app/page.tsx`) ra `components/site/course-card.tsx` để tái dùng ở cả trang chủ và trang catalog — đúng theo gợi ý ban đầu.
- [x] Filter category/level + sort qua URL search params (`?category=...&level=...&sort=...&page=...`), implement bằng **Link server-rendered** (không cần Client Component/JS) — mỗi chip filter là 1 link đổi query string, giữ nguyên các filter khác. Đơn giản hơn form client-side, vẫn share/bookmark được đúng yêu cầu, và nhất quán với cách trang này được thiết kế là Server Component thuần (fetch trực tiếp, không có state).
- [x] Empty state khi filter không ra kết quả — có nút "Xoá bộ lọc" khi đang lọc.
- [ ] Kết nối với search thật (phase 14) — chưa làm, đúng như plan (chờ phase 14). Ô search ở header vẫn chưa có handler.

### Test
- [x] Filter kết hợp nhiều điều kiện không crash — verify qua `curl "/courses?category=Technology&sort=popular&page=2"` (200, không lỗi dù data rỗng/param không khớp course nào).
- [x] Pagination: logic `totalPages = ceil(total/pageSize)`, `offset = (page-1)*pageSize` — chuẩn, chưa có data thật để check duplicate/miss item bằng mắt (chờ course thật ở phase 10).
- [x] Trang chủ (`/`) vẫn render đúng sau khi tách `CourseCard` ra file riêng — verify qua `curl /` (200, đúng empty state, bố cục bento-grid giữ nguyên bằng cách bọc `CourseCard` trong `<div>` chịu trách nhiệm `col-span`/`row-span` thay vì để trong component dùng chung).

## File liên quan

- `app/courses/page.tsx` (mới)
- `components/site/course-card.tsx` (mới — tách từ `app/page.tsx`)
- `app/page.tsx` (dùng lại `CourseCard`, sửa link "Categories quick link" từ `/dashboard` (leftover từ mock cũ) sang `/courses`)
- `lib/queries.ts` (`getCourseList`, `getLevels`, đổi tên type `TrendingCourse` → `CourseCardData` cho đúng nghĩa dùng chung)
- `config/schema.ts` (bảng `courses`)
