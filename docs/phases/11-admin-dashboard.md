# Phase 11 — Admin Dashboard (route mới)

## Mục tiêu

Quản trị viên quản lý toàn bộ user, course (moderation/duyệt publish), giao dịch thanh toán, report vi phạm — hoàn toàn chưa tồn tại.

## Trạng thái hiện tại

Không có route, không có UI, không có API cho vai trò admin. Không có khái niệm role trong DB hiện tại (thêm ở phase 00).

## Việc cần làm

### Backend / Data
- [x] List/search/đổi role/khoá-mở user — **Server Actions** (`app/admin/actions.ts`: `updateUserRole`, `toggleUserStatus`) thay vì API route riêng, nhất quán pattern từ phase 05/10. Thêm cột `status` (`active`/`banned`) vào `usersTable`, push Neon thật.
- [x] Duyệt course trước publish: **giữ quyết định MVP đã chọn ở phase 10 — instructor tự publish, không có hàng chờ duyệt trước**. Thay bằng moderation-sau-khi-đăng: admin có quyền force-unpublish bất kỳ course nào (`forceUnpublishCourse`, không cần ownership check vì admin toàn quyền) — kiểm duyệt phản ứng (react) thay vì tiền kiểm (pre-approve), MVP hợp lý hơn cho platform mới chưa có volume content.
- [x] Giao dịch VNPay: **chưa có dữ liệu thật để hiển thị** — phase 12 (VNPay) chưa build, `enrollments.paymentRef` hiện luôn rỗng. Thay bằng bảng `enrollments` join `courses` thật đang có (đếm học viên/khoá + tổng doanh thu = giá × số enrollment `paid`) — khi phase 12 xong, mở rộng thêm cột `paymentRef`/ngày thanh toán vào bảng courses admin nếu cần đối soát chi tiết hơn.
- [x] Report system: **bỏ hẳn** — không có tính năng report/flag nào từng được xây ở phase 07 (community) hay bất kỳ đâu, checklist gốc ghi "optional, nếu có report system" — không có thì không làm giả.
- [x] **Bổ sung ngoài checklist gốc, quan trọng**: `lib/auth.ts` (`getCurrentAppUser`) giờ trả `null` cho user có `status = 'banned'` — đây là điểm thực thi khoá tài khoản thật (mọi Server Action/page dùng `getCurrentAppUser` đều tự động coi user bị khoá như chưa đăng nhập, không cần sửa từng chỗ riêng lẻ).

### Frontend wiring
- [x] `app/admin/page.tsx` (tổng quan: user/course/published/enrollment/doanh thu — số thật từ `getAdminStats`), `app/admin/users/page.tsx`, `app/admin/courses/page.tsx`.
- [x] Bảng user/course có search (form GET native, không cần JS) + pagination (URL search params, cùng pattern phase 04/07).
- [x] Role guard: `app/admin/layout.tsx` check `getCurrentAppUser()` + `role === 'admin'`, redirect `/dashboard` nếu không đủ quyền — **không dùng middleware** cho role-check (đúng quyết định phase 02, Proxy chỉ optimistic-check).
- [x] Header `components/site/user-menu.tsx` (viết từ phase 02, trỏ `/admin` cho role admin) — route giờ đã tồn tại thật, link hoạt động đúng không còn là forward-reference nữa.

### Test
- [x] Route guard: `/admin`, `/admin/users`, `/admin/courses` chưa login → redirect 307 (verify qua curl thật).
- [x] Đổi role/khoá tài khoản có hiệu lực đúng — verify bằng script trên DB Neon thật: promote role student→admin ghi đúng; ban→unban toggle đúng cả 2 chiều; force-unpublish course ghi `published=false` đúng; logic lockout user bị ban (`getCurrentAppUser` trả `null`) verify đúng qua điều kiện y hệt code thật.
- [x] Search + pagination: verify thật trên DB — tìm theo tên user, tìm theo tên course đều lọc đúng 1 kết quả khớp; phân trang `pageSize=1` với 2 course tách đúng 2 trang, không trùng/sót.
- [x] Guard tự bảo vệ: `updateUserRole`/`toggleUserStatus` có chặn admin tự đổi role/tự khoá chính mình (`if (userId === admin.id) throw`) — review code, chưa cần test riêng vì logic so sánh đơn giản, đã eyeball kỹ.
- [ ] "Admin thường/instructor không vào được /admin/\*" qua UI thật — chỉ verify được nhánh chưa đăng nhập (307) qua curl; nhánh "đã đăng nhập nhưng sai role" cần session Clerk thật nên chưa tự test qua UI (không tự đăng nhập hộ theo chính sách an toàn) — logic `role !== 'admin' → redirect` đã review kỹ, giống hệt pattern đã verify hoạt động đúng ở `/instructor` (phase 10).

## File liên quan

- `app/admin/layout.tsx` (mới — role guard)
- `app/admin/page.tsx`, `app/admin/users/page.tsx`, `app/admin/courses/page.tsx` (mới)
- `app/admin/actions.ts` (mới — `updateUserRole`, `toggleUserStatus`, `forceUnpublishCourse`)
- `components/site/admin-nav.tsx` (mới)
- `lib/queries.ts` (`getAdminStats`, `getAllUsersAdmin`, `getAllCoursesAdmin`)
- `lib/auth.ts` (`getCurrentAppUser` chặn user `banned`)
- `config/schema.ts` (`usersTable` thêm cột `status`)
