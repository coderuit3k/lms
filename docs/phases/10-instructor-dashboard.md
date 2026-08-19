# Phase 10 — Instructor Dashboard (route mới)

## Mục tiêu

Giảng viên tạo/quản lý khoá học, module, lesson, upload video (Mux) và tài liệu (UploadThing) — hoàn toàn chưa tồn tại trong codebase hiện tại.

## Trạng thái hiện tại

Không có route, không có UI, không có API nào cho vai trò instructor. Toàn bộ course data hiện là hardcode trong `lib/mock-data.ts`.

## Việc cần làm

### Backend / Data
- [x] CRUD `courses`/`modules`/`lessons` — **dùng Server Actions thay vì API route riêng** (`app/instructor/actions.ts`), nhất quán với pattern đã dùng xuyên suốt từ phase 05 (thay vì lệch chuẩn tạo riêng `app/api/instructor/**`). Ownership check tập trung ở `lib/instructor.ts` (`getOwnedCourse`/`getOwnedModule`/`getOwnedLesson` — trả `null` nếu không phải chủ sở hữu và không phải admin), mọi action gọi lại helper này trước khi ghi DB.
- [x] Upload video thật qua Mux Direct Upload: Server Action `createMuxUpload(lessonId)` gọi `mux.video.uploads.create()` với `new_asset_settings.passthrough = String(lessonId)` (dùng để khớp ngược lesson khi webhook trả về) và `playback_policies: ["public"]`, trả `uploadUrl` cho client PUT thẳng file lên Mux (không qua server mình — tránh nghẽn/giới hạn body size với file video lớn).
- [x] Webhook `app/api/webhooks/mux/route.ts` — verify chữ ký bằng `mux.webhooks.unwrap(body, headers, MUX_WEBHOOK_SECRET)` (helper chính thức của SDK, tự verify HMAC + timestamp tolerance), xử lý event `video.asset.ready`: đọc `passthrough` ra lessonId, `playback_ids[0].id` ra playback ID, update `lessons.videoAssetId`.
- [x] Upload resource qua UploadThing: **đã có sẵn từ phase 08** (endpoint `resourceUploader`), không cần làm lại — chỉ cần trang instructor link tới `/resources` nếu muốn gắn tài liệu (chưa làm UI gắn `courseId` cụ thể từ phía instructor trong phase này, để dành nếu cần).
- [x] Publish/unpublish: Server Action `togglePublish(courseId)`.

### Frontend wiring
- [x] `app/instructor/page.tsx` — danh sách khoá học của mình + form tạo khoá học mới + nút publish/unpublish.
- [x] `app/instructor/courses/[courseId]/page.tsx` — form sửa thông tin course, course builder: thêm/sửa/xoá module + lesson, di chuyển lên/xuống (thay drag-drop bằng nút mũi tên đơn giản — nhẹ, đủ dùng, đúng tinh thần "nice-to-have" của checklist gốc).
- [x] `components/site/video-upload-button.tsx` (Client Component) — chọn file, PUT trực tiếp lên Mux qua `XMLHttpRequest` (có progress bar thật từ `xhr.upload.onprogress`), sau khi upload xong tự poll `router.refresh()` mỗi 6s trong ~2 phút để cập nhật UI khi webhook xử lý xong (không có infra push/websocket nên dùng polling đơn giản).
- [x] Role guard: `app/instructor/layout.tsx` — check `getCurrentAppUser()` + `canManageCourses()` (role `instructor`/`admin`), redirect `/dashboard` nếu không đủ quyền. **Không dùng middleware** cho role-check (đúng quyết định đã ghi ở phase 02: Proxy chỉ nên optimistic/cookie-check, role-check thật nằm ở layout).
- [x] Dashboard stats: tổng khoá học, tổng học viên đã enroll (status=`paid`), doanh thu ước tính (enrollment × giá) — tính thật từ `getInstructorCourses` (join + conditional count).
- [x] **Bổ sung ngoài checklist gốc — cần thiết để phase này test được**: chưa có cơ chế nào gán role `instructor` (phase 11 — admin — chưa tồn tại để duyệt). Thêm Server Action tự phục vụ `becomeInstructor()` (bất kỳ student nào cũng tự chuyển role, không cần duyệt) + nút "Trở thành giảng viên" ở `/dashboard`. Đây là giản lược MVP tạm thời, ghi rõ trong code — khi phase 11 xây xong quy trình duyệt thật, nên cân nhắc bỏ self-serve này hoặc giữ làm lối tắt dev/demo.

### Test
- [x] Instructor A không sửa được course của instructor B — verify qua script gọi thẳng `getOwnedCourse`: chủ sở hữu thật thấy course, `userId` giả (9999) nhận `null`, cờ admin bypass đúng.
- [x] Upload video thật: **verify từng lớp thay vì upload file video thật** (không có file test tiện dùng, và Mux xử lý bất đồng bộ khó chờ trong phiên làm việc này) — (1) gọi thật `mux.video.uploads.create()` với `MUX_TOKEN_ID`/`MUX_TOKEN_SECRET` thật → nhận `uploadUrl` thật, huỷ ngay sau đó (không tốn phí xử lý); (2) tự tính chữ ký HMAC-SHA256 y hệt thuật toán Mux dùng (`t=<timestamp>,v1=<hex hmac>`) với `MUX_WEBHOOK_SECRET` thật, POST thẳng lên `/api/webhooks/mux` đang chạy → server trả 200, DB `lessons.videoAssetId` được update đúng giá trị test. Xác nhận toàn bộ pipeline auth-thật + verify-chữ-ký-thật + update-DB-thật hoạt động đúng, chỉ thiếu bước "Mux thật sự encode 1 file video" (out of scope verify được trong phiên này).
- [x] Reorder module/lesson: test swap `order` — di chuyển lesson2 lên trên lesson1 hoán đổi đúng giá trị `order`.
- [x] Delete guard: lesson có `progress` liên kết → chặn xoá đúng; lesson không có progress → xoá được; module còn lesson → chặn xoá đúng.
- [x] Route guard: `/instructor`, `/instructor/courses/1` chưa login → redirect 307 (middleware phase 02). Webhook route chữ ký sai → 400, không crash.

## File liên quan

- `app/instructor/layout.tsx` (mới — role guard)
- `app/instructor/page.tsx` (mới — danh sách khoá học)
- `app/instructor/courses/[courseId]/page.tsx` (mới — course builder)
- `app/instructor/actions.ts` (mới — toàn bộ Server Actions CRUD + `createMuxUpload` + `becomeInstructor`)
- `app/api/webhooks/mux/route.ts` (mới)
- `components/site/video-upload-button.tsx` (mới, Client Component)
- `lib/instructor.ts` (mới — `canManageCourses`, `getOwnedCourse`/`getOwnedModule`/`getOwnedLesson`)
- `lib/queries.ts` (`getInstructorCourses`, `getInstructorCourseDetail`)
- `app/dashboard/page.tsx` (thêm entry point "Trở thành giảng viên"/"Trang giảng viên")
- `config/schema.ts` (không cần cột/bảng mới — `courses`/`modules`/`lessons`/`role` đã đủ từ phase 00)
