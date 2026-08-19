# Phase 08 — Resources (`/resources`)

## Mục tiêu

Trang tài nguyên tải xuống (handouts, tài liệu) thật, gắn với file lưu trữ thật qua UploadThing thay vì link giả.

## Trạng thái hiện tại

`app/resources/page.tsx` — static, `recentDownloads`/`courseHandouts`/`recommendedRead` từ `lib/mock-data.ts`, không có file thật để tải.

## Việc cần làm

### Backend / Data
- [x] Thêm bảng `resources` (`id`, `courseId` nullable, `title`, `fileUrl`, `fileType`, `uploadedBy`, `createdAt`) vào `config/schema.ts`, push Neon thật.
- [x] Upload flow dựng ngay ở phase này (không đợi phase 10) — vì UploadThing SDK đã cài từ phase 00 và không cần route instructor riêng để hoạt động: `app/api/uploadthing/core.ts` (file router `resourceUploader`, giới hạn pdf/text/image, `middleware` bắt buộc đăng nhập, `onUploadComplete` ghi thẳng vào `resources`) + `app/api/uploadthing/route.ts` (route handler) + `lib/uploadthing.ts` (`UploadButton` typed client helper). **Đổi so với plan gốc**: đây là self-serve upload cho MỌI user đã đăng nhập (giống card "Contribute" ở bản mock cũ), không phải luồng riêng cho instructor — luôn tạo resource với `courseId = null` (tài liệu chung cộng đồng). Resource gắn `courseId` cụ thể (do instructor thêm cho khoá học của họ) vẫn để dành cho phase 10, nhưng logic gating phía dưới đã sẵn sàng dùng ngay khi có.

### Frontend wiring
- [x] Query resources thật (`lib/queries.ts`: `getResources`) — 1 danh sách chung thay vì 3 khối tách rời "Recent Downloads"/"Course Handouts"/"Recommended Reads" như mock cũ (2 khối sau hoàn toàn không có data thật để group theo course/category, giữ nguyên UI đó sẽ chỉ là vỏ rỗng hoặc fake).
- [x] Link tải xuống trỏ đúng `fileUrl` (UploadThing `ufsUrl` thật) — verify bằng cách gọi `GET /api/uploadthing` thật, nhận đúng router config (`resourceUploader` với giới hạn pdf/text/image), xác nhận `UPLOADTHING_TOKEN` hoạt động thật chứ không chỉ compile.
- [x] Giới hạn quyền tải: resource có `courseId` → chỉ user đã `enrollments.status='paid'` khoá đó mới thấy link tải (`getUserPaidCourseIds`, check 1 lần theo Set thay vì N+1 query mỗi resource); chưa đăng ký → hiện "Cần đăng ký khoá học" thay vì link.
- [x] Bỏ "Recommended Reads" (1 bài báo học thuật hardcode, không có nguồn gốc/engine gợi ý thật) và "Course Handouts" tag cứng "PHYS-401"/"PSYC-200" khỏi UI — vi phạm chủ trương không fake data, không có tính năng gợi ý hay mapping course-code thật nào được xây.

### Test
- [x] Upload thật: chưa test click UploadButton qua UI browser (cần session thật, không tự đăng nhập hộ), nhưng đã verify **hạ tầng thật hoạt động** — gọi `GET /api/uploadthing` thật trả đúng router config (không lỗi thiếu token). Seed 2 resource thật (1 chung, 1 gắn course) lên Neon → `curl /resources` xác nhận cả 2 hiện đúng, đã dọn sạch.
- [x] User chưa enroll không tải được resource gắn khoá học trả phí — verify thật: resource gắn course test hiện đúng "Cần đăng ký khoá học" (lock icon) khi request không có enrollment; resource chung (`courseId=null`) hiện link tải bình thường.

## File liên quan

- `app/resources/page.tsx` (viết lại)
- `app/api/uploadthing/core.ts` (mới — file router)
- `app/api/uploadthing/route.ts` (mới — route handler)
- `lib/uploadthing.ts` (mới — client helper `UploadButton`)
- `components/site/resource-upload-button.tsx` (mới, Client Component)
- `lib/queries.ts` (`getResources`, `getUserPaidCourseIds`)
- `config/schema.ts` (bảng `resources`)
- `lib/mock-data.ts` (không còn được trang này dùng — `recentDownloads`/`courseHandouts`/`recommendedRead` là dead code, chưa xoá khỏi file)
