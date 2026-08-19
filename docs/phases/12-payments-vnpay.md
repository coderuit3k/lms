# Phase 12 — Payments (VNPay)

## Mục tiêu

Học viên thanh toán khoá học trả phí qua VNPay, hệ thống ghi nhận đúng enrollment sau khi thanh toán thành công.

## Trạng thái hiện tại

Không tồn tại. `course.price`/`originalPrice` chỉ là field hiển thị trong mock data, không có SDK/route thanh toán nào.

## Việc cần làm

### Backend
- [x] `lib/vnpay.ts` — build URL thanh toán (sort key, encode `%20`→`+` đúng convention VNPay, HMAC-SHA512 với `VNP_HASH_SECRET`), `verifyVnpaySignature` (re-encode params nhận về, so khớp hash), `isVnpaySuccess`. Không có SDK npm chính thức cho VNPay nên tự implement theo spec công khai — **đã verify bằng cách gọi thật lên sandbox VNPay** (xem mục Test).
- [x] Tạo thanh toán: **dùng Server Action `payWithVnpay(courseId)`** (`app/courses/[slug]/actions.ts`) thay vì API route riêng — nhất quán pattern Server Actions xuyên suốt từ phase 05 (route riêng chỉ dùng cho endpoint bên thứ 3 gọi vào thật như return/IPN, không dùng cho action nội bộ). Tái dùng enrollment `pending` cũ nếu có (tránh rác), **không tái dùng enrollment `failed`** (bug đã bắt được lúc code: nếu tái dùng, thanh toán lại thành công vẫn bị coi "đã chốt" do idempotent guard, không bao giờ chuyển `paid` được — tạo enrollment mới id mới = txnRef mới để tránh).
- [x] `app/api/payments/vnpay/return/route.ts` — verify `vnp_SecureHash`, update trạng thái, redirect user tới `/payments/result`.
- [x] `app/api/payments/vnpay/ipn/route.ts` — endpoint riêng cho VNPay gọi server-to-server, trả đúng format `{RspCode, Message}` theo spec (00=thành công, 01=không tìm thấy đơn, 02=đã xác nhận rồi, 97=sai chữ ký). Logic finalize dùng chung (`lib/payments.ts`, `finalizeEnrollmentFromVnpay`) cho cả return và IPN — idempotent bằng cách chỉ ghi đè khi status hiện tại chưa phải `paid`/`failed`.
- [x] Test trên sandbox VNPay thật — `.env` đã có `VNP_TMN_CODE`/`VNP_HASH_SECRET`/`VNP_URL` sandbox thật từ đầu dự án.

### Frontend wiring
- [x] CTA "Thanh toán qua VNPay" ở course detail (phase 05) — thay nút disabled placeholder bằng `<form action={payWithVnpay}>` thật.
- [x] `app/payments/result/page.tsx` — 4 trạng thái (success/failed/invalid/error), CTA "Vào học ngay" khi thành công, "Thử lại" khi thất bại, luôn có link về Dashboard. Route public (không cần login — user có thể quay lại đây ngay cả khi phiên đăng nhập hết hạn giữa lúc thanh toán).
- [ ] Lịch sử giao dịch trong `/profile`/`/settings` — **bỏ khỏi MVP** (checklist gốc đã đánh dấu optional), `enrollments.paymentRef` đã lưu đủ dữ liệu thô nếu cần bổ sung UI sau.

### Test
- [x] **Gọi thật lên sandbox VNPay** (không mock): tạo URL thanh toán bằng credential thật trong `.env`, `fetch()` thẳng URL đó → sandbox trả **302 redirect kèm token thanh toán thật** (`PaymentMethod.html?token=...`) — đây chính xác là response VNPay trả khi chữ ký + `vnp_TmnCode` hợp lệ; nếu sai sẽ ra trang lỗi thay vì redirect có token. Xác nhận tích hợp đúng thật, không chỉ đúng theo trí nhớ spec.
- [x] Tự tính chữ ký HMAC-SHA512 y hệt thuật toán VNPay dùng, giả lập IPN/return thật gửi tới server đang chạy:
  - Thanh toán thành công (`vnp_ResponseCode=00`) → IPN trả `RspCode:00`, DB `enrollments.status='paid'`, `paymentRef` lưu đúng `vnp_TransactionNo`; `/return` redirect đúng `/payments/result?status=success&course=...`.
  - Gọi IPN lặp lại lần 2 (idempotency) → `RspCode:02` ("Order already confirmed"), **không ghi đè lại DB**.
  - Thanh toán thất bại/huỷ (`vnp_ResponseCode=24`) → `enrollments.status='failed'` đúng.
  - Chữ ký giả mạo (sửa `vnp_Amount`) → `RspCode:97` ("Invalid signature"), không update DB — chặn đúng tấn công giả mạo callback.
  - Đã dọn sạch toàn bộ enrollment/course test sau khi verify.
- [x] User vào học được ngay sau khi `paid` — logic đã có sẵn từ phase 05/06 (`getEnrollmentStatus` gate `/learn/[lessonId]`), không cần sửa gì thêm, chỉ cần `enrollments.status='paid'` đúng là tự động hoạt động.

## File liên quan

- `lib/vnpay.ts` (mới)
- `lib/payments.ts` (mới — `finalizeEnrollmentFromVnpay`, logic idempotent dùng chung)
- `app/courses/[slug]/actions.ts` (thêm `payWithVnpay`)
- `app/courses/[slug]/page.tsx` (CTA thanh toán thật)
- `app/api/payments/vnpay/return/route.ts` (mới)
- `app/api/payments/vnpay/ipn/route.ts` (mới)
- `app/payments/result/page.tsx` (mới)
- `config/schema.ts` (bảng `enrollments`, không cần đổi — `status`/`paymentRef` đã có từ phase 00)
