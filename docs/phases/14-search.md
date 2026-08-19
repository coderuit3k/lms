# Phase 14 — Search thật

## Mục tiêu

Ô tìm kiếm ở header và trang catalog hoạt động thật, trả kết quả khoá học đúng từ khoá.

## Trạng thái hiện tại

`SiteHeader` (`components/site/header.tsx`) render `<input>` search không có state, không có handler, không có kết quả.

## Việc cần làm

### Backend / Data
- [x] Postgres full-text search — **không thêm cột `tsvector` lưu sẵn**, tính `to_tsvector` ngay lúc query (`courseSearchCondition`/`courseSearchRank` trong `lib/queries.ts`). Quyết định khác plan gốc: cột generated/GIN index cần cú pháp Drizzle cho generated column mà bản Drizzle này chưa chắc hỗ trợ rõ ràng, và với quy mô course hiện tại (vài chục tới vài trăm) tính runtime là đủ nhanh, không cần index — có thể nâng cấp lên cột lưu sẵn + GIN index sau nếu dữ liệu lớn. Đã **bật thật extension `unaccent`** trên Neon (`CREATE EXTENSION IF NOT EXISTS unaccent`) để search không phân biệt dấu tiếng Việt. Dùng `websearch_to_tsquery` (không phải `to_tsquery`) — chịu được input tự do/ký tự đặc biệt mà không throw.
- [x] `app/api/search/route.ts` — route handler thật (không phải Server Action, vì cần gọi từ `fetch()` debounce phía client cho dropdown autocomplete — giống lý do AI Tutor ở phase 06 cũng là route handler). Nhận `q`, trả JSON top 8 kết quả rank theo `ts_rank`.
- [x] Algolia: giữ nguyên optional, không làm — đúng plan gốc.

### Frontend wiring
- [x] `components/site/search-box.tsx` (Client Component mới, tách khỏi `header.tsx`) — input có state, debounce 300ms, gọi `/api/search`, dropdown kết quả (thumbnail/category/giá), đóng khi click ra ngoài. Bọc trong `<form action="/courses" method="GET">` — Enter/submit điều hướng `/courses?q=...` **native, không cần JS** (progressive enhancement, JS chỉ thêm dropdown gợi ý nhanh).
- [x] Trang catalog (`/courses`, phase 04) nhận thêm param `q` — extend `getCourseList` filters, thêm ô search riêng trên trang (form GET giữ nguyên `category`/`level`/`sort` qua hidden input khi submit search mới), text hiển thị "N kết quả cho "..."" khi đang search.
- [x] Empty state "Không tìm thấy khoá học nào" (đã có sẵn từ phase 04) tự động áp dụng đúng cho trường hợp search không ra kết quả — nút "Xoá bộ lọc" giờ cũng hiện khi có `q` (trước chỉ hiện khi có category/level).

### Test
- [x] **Verify thật trên Neon** (không mock): bật extension `unaccent` thật, seed 2 khoá học tiếng Việt có dấu ("Nhập môn Đồ hoạ máy tính", "Nấu ăn cho người mới bắt đầu") → search "do hoa" (không dấu) và "đồ hoạ" (có dấu) đều trả đúng 1 kết quả khớp, không lẫn khoá còn lại; search "nau an" trên trang catalog trả đúng khoá nấu ăn, hiện đúng text "N kết quả cho...". Đã dọn sạch data test.
- [x] Search rỗng/ký tự đặc biệt không crash: verify qua `curl` thật — `q=` rỗng, `q=<script>alert(1)</script>`, `q=&|!()@#` (ký tự đặc biệt của cú pháp `to_tsquery`) đều trả 200, không lỗi 500 nhờ dùng `websearch_to_tsquery` (tolerant với input tự do) thay vì `to_tsquery` (sẽ throw syntax error với các ký tự này).

## File liên quan

- `components/site/header.tsx` (bỏ input tĩnh, gắn `SearchBox`)
- `components/site/search-box.tsx` (mới, Client Component)
- `app/api/search/route.ts` (mới)
- `app/courses/page.tsx` (thêm search box + param `q`)
- `lib/queries.ts` (`searchCourses`, `courseSearchCondition`/`courseSearchRank`, `getCourseList` thêm filter `search`)
- `config/schema.ts` (không đổi — không thêm cột `tsvector`, xem quyết định ở trên)
