# Phase 03 — Student Dashboard (`/dashboard`)

## Mục tiêu

Dashboard học viên hiển thị đúng khoá học đã đăng ký, tiến độ học thật, deadline thật — thay toàn bộ mock data.

## Trạng thái hiện tại

`app/dashboard/page.tsx` — static, sidebar nav, deadlines, stats đều lấy từ `lib/mock-data.ts` (`deadlines`, `learningStats`).

## Việc cần làm

### Backend / Data
- [x] Query enrollments thật của user hiện tại (join `enrollments` + `courses` + `modules` + `lessons` + `progress`) — `lib/queries.ts` (`getEnrolledCourses`), trả kèm `totalLessons`/`completedLessons` mỗi khoá để tính % ngay.
- [x] Query progress thật để tính % hoàn thành mỗi khoá — gộp chung vào `getEnrolledCourses` (conditional count aggregate), không cần query riêng.
- [x] `learningStats`: chỉ giữ 2 chỉ số tính được thật từ schema hiện có — **Giờ đã học** (`getHoursSpent`: tổng `lessons.duration` của lesson đã hoàn thành / 60) và **Khoá học hoàn thành** (đếm từ `getEnrolledCourses` phía client). **Bỏ "Points"/"Rank"/"Streak"** khỏi checklist gốc — không có bảng điểm/gamification nào trong schema, hiển thị số bịa là sai với chủ trương "không fake data" của dự án này.
- [x] Deadline: **quyết định bỏ hẳn mục "Upcoming Deadlines" khỏi MVP** — không có bảng assignment/quiz/deadline nào trong schema (phase 00 không tạo), và tự thêm `dueDate` mà chưa có hệ thống assignment thật thì cũng không có dữ liệu để đổ vào. Thay bằng panel "Khoá học của bạn" (liệt kê toàn bộ enrollment kèm % tiến độ) — dùng ngay data đã có, không cần bảng mới.

### Frontend wiring
- [x] Auth guard: `/dashboard` đã được `proxy.ts` (phase 02) chặn — verify lại: chưa login → redirect `/sign-in`.
- [x] Empty state: 0 enrollment → CTA "Khám phá khoá học" trỏ `/courses` (route này thuộc phase 04, chưa build — link đúng nhưng đích sẽ 404 tới khi phase 04 xong, đã biết trước và chấp nhận được vì thứ tự phase).
- [x] Sidebar nav: bỏ 3 tab giả (Curriculum/Assignments/Notes trỏ lung tung về `/dashboard`) — chỉ giữ **Overview**, **Resources**, **Community** (route có thật).

### Test
- [x] User 0 enrollment load dashboard không lỗi — verify bằng script gọi thẳng `getEnrolledCourses`/`getHoursSpent` lên DB Neon thật với user thật (`thanhconl67@gmail.com`, hiện 0 enrollment) → trả `[]` và `0`, không lỗi SQL. `npx tsc --noEmit` sạch, dev server compile không lỗi runtime.
- [ ] User có enrollment thấy đúng % tiến độ khớp dữ liệu `progress` — **chưa test được**: DB chưa có course/enrollment nào (chờ phase 10 — instructor tạo course — hoặc seed tay). Query logic đã viết đúng theo join/aggregate chuẩn, sẽ verify lại khi có dữ liệu thật.

## File liên quan

- `app/dashboard/page.tsx`
- `lib/queries.ts` (`getEnrolledCourses`, `getHoursSpent` — mới)
- `lib/auth.ts` (`getCurrentAppUser` — dùng để lấy id/name thật)
- `lib/mock-data.ts` (không còn được `app/dashboard/page.tsx` dùng nữa)
- `config/schema.ts` (bảng `enrollments`, `progress`, `modules`, `lessons`)
