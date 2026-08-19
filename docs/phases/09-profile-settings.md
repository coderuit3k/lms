# Phase 09 — Profile & Settings (`/profile`, `/settings`)

## Mục tiêu

Profile hiển thị dữ liệu thật (certificate, badge thật đã đạt), Settings có form lưu thật xuống DB.

## Trạng thái hiện tại

- `app/profile/page.tsx` — static, profile/certificates/badges từ mock data.
- `app/settings/page.tsx` — static, form UI đầy đủ nhưng **không có save handler thật** (`accountSettings` từ mock data).

## Việc cần làm

### Backend / Data
- [x] Certificate tự issue khi hoàn thành 100% course — quay lại sửa `app/learn/[lessonId]/actions.ts` (`markLessonComplete`): thêm `maybeIssueCertificate(userId, courseId)` — đếm tổng lesson vs lesson đã hoàn thành trong course, đủ 100% và chưa có certificate thì insert (idempotent, không lặp lại).
- [x] Badge system: **quyết định bỏ hẳn** — checklist gốc cho phép bỏ nếu không đủ giá trị. Không có rule/data thật nào biện minh cho badge (mock cũ gán badge tuỳ tiện: "Cognitive Psych", "Python"...). "Current Focus" (mock: "Neural Networks, Level 2 in progress") cũng bỏ — không có khái niệm "focus area" nào được track thật.
- [x] Không tạo route API riêng — dùng Server Actions: `app/settings/actions.ts` (`updateProfile`: name/bio/notification prefs) và `app/api/uploadthing/core.ts` mở rộng thêm endpoint `avatarUploader` (ghi thẳng `usersTable.avatarUrl` trong `onUploadComplete`, tái dùng hạ tầng UploadThing đã dựng ở phase 08).
- [x] Schema: thêm cột `bio` (text) và 4 cột boolean notification preference (`notifyCourseUpdates`, `notifyCommunityReplies`, `notifyWeeklyDigest`, `notifyProductAnnouncements`) vào `usersTable`, push Neon thật. **Bỏ "Username" và "Subscription"** khỏi form/schema — Username không có công dụng thật (không có public profile URL nào dùng nó), Subscription là plan/gói trả phí hoàn toàn hư cấu trong mock (không có hệ thống subscription nào được xây, chỉ có mua-lẻ-theo-khoá qua VNPay ở phase 12) — giữ lại 2 thứ này sẽ là UI giả 100%.

### Frontend wiring
- [x] Avatar upload qua UploadThing thật (`components/site/avatar-upload-button.tsx`, endpoint `avatarUploader`), lưu vào `usersTable.avatarUrl` (cột đã có sẵn từ phase 00).
- [x] `app/settings/page.tsx`: viết lại toàn bộ — 1 `<form action={updateProfile}>` duy nhất (Server Action, không cần `onSubmit`/client JS/toast — progressive enhancement như các phase trước). Email hiển thị read-only (disabled) kèm giải thích — email do Clerk quản lý, sửa độc lập trong DB sẽ gây lệch dữ liệu với tài khoản đăng nhập thật.
- [x] Card "Security" (mock cũ bịa "Last password change: 45 days ago" + nút Change Password/2FA không hoạt động) → thay bằng nút thật `components/site/account-security-button.tsx` gọi `useClerk().openUserProfile()` — mở đúng UI quản lý mật khẩu/2FA thật của Clerk, không giả nữa.
- [x] `app/profile/page.tsx`: viết lại — certificate thật (`getUserCertificates`), nút "Tải chứng chỉ" trỏ `/api/certificates/[certificateId]` (Route Handler mới, dùng `next/og` `ImageResponse` generate ảnh PNG chứng chỉ động, gate quyền chỉ chủ sở hữu certificate mới tải được). Thay "Learning History" (mock: 2 dòng hardcode "Ethics in AI"/"Data Visualization Capstone") bằng "Hoạt động gần đây" thật (`getRecentActivity` — 5 lesson hoàn thành gần nhất, join thật từ `progress`).
- [x] Stats header (Khoá học hoàn thành / Chứng chỉ / Giờ học) tái dùng thẳng `getEnrolledCourses`/`getHoursSpent` đã có từ phase 03 — không viết lại logic.

### Test
- [x] Certificate tự issue đúng lúc đạt 100% progress — verify thật bằng script: seed course 2 lesson + enrollment `paid`, mark lesson 1 xong → chưa issue (đúng, `completed:1/total:2`); mark lesson 2 xong → issue certificate ngay (`completed:2/total:2`); gọi lại lần nữa → không tạo duplicate (idempotent). `getUserCertificates`/`getRecentActivity` trả đúng data thật khớp thứ tự thời gian (mới nhất trước). Đã dọn sạch data test.
- [x] Guard auth: `/profile`, `/settings` chưa login → redirect (`/profile`, `/settings` đã có trong `proxy.ts` matcher từ phase 02, verify lại qua curl: cả 2 đều 307). `/api/certificates/[id]` chưa login → 401 (check riêng trong route vì route này không nằm trong middleware matcher).
- [ ] Đổi setting qua UI thật, reload xác nhận persist — **chưa test được qua browser** (cần session thật, không tự đăng nhập hộ theo chính sách an toàn); logic Server Action đã review kỹ + `tsc` sạch.

## File liên quan

- `app/profile/page.tsx` (viết lại)
- `app/settings/page.tsx` (viết lại)
- `app/settings/actions.ts` (mới — `updateProfile`)
- `app/api/certificates/[certificateId]/route.tsx` (mới — chú ý đuôi `.tsx` vì có JSX cho `ImageResponse`, `.ts` sẽ lỗi parse)
- `app/api/uploadthing/core.ts` (thêm endpoint `avatarUploader`)
- `app/learn/[lessonId]/actions.ts` (thêm `maybeIssueCertificate`)
- `components/site/avatar-upload-button.tsx`, `components/site/account-security-button.tsx` (mới, Client Components)
- `lib/queries.ts` (`getUserCertificates`, `getRecentActivity`)
- `config/schema.ts` (`usersTable` thêm `bio` + 4 cột `notify*`)
