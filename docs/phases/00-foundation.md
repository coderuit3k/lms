# Phase 00 — Foundation (DB, bảo mật, SDK setup)

## Mục tiêu

Chuẩn bị nền tảng kỹ thuật (schema DB, bảo mật env, SDK các provider) trước khi build tính năng ở các phase sau. Đây là phase bắt buộc làm trước tiên.

## Trạng thái hiện tại

- DB (Drizzle + Neon) chỉ có 1 bảng `usersTable` (`config/schema.ts`): `id`, `name`, `email`, `subscription`.
- `.env` có lỗi bảo mật: `NEXT_PUBLIC_DATABASE_URL` trùng giá trị với `DATABASE_URL`, bị expose ra client bundle.
- Không có AI SDK, payment SDK, storage SDK, email SDK nào trong `package.json`.
- `react-router-dom` có trong dependencies nhưng không dùng ở đâu (App Router only) — cân nhắc gỡ bỏ để giảm confusion.

## Việc cần làm

### Bảo mật
- [x] Xoá dòng `NEXT_PUBLIC_DATABASE_URL` khỏi `.env` thật, chỉ giữ `DATABASE_URL`.
- [x] Kiểm tra không có code nào import `process.env.NEXT_PUBLIC_DATABASE_URL` (grep sạch).
- [x] Xác nhận `.env` nằm trong `.gitignore` (dòng `.env*`, verify OK).

### Database / Schema (`config/schema.ts`)
- [x] Thêm bảng `courses`: `id`, `slug`, `title`, `description`, `thumbnailUrl`, `price`, `originalPrice`, `category`, `level`, `instructorId` (FK → users), `published` (boolean), `createdAt`, `updatedAt`.
- [x] Thêm bảng `modules`: `id`, `courseId` (FK), `title`, `order`.
- [x] Thêm bảng `lessons`: `id`, `moduleId` (FK), `title`, `videoAssetId` (Mux asset id), `content`, `duration`, `order`.
- [x] Thêm bảng `enrollments`: `id`, `userId` (FK), `courseId` (FK), `status` (`pending`/`paid`/`refunded`), `paymentRef`, `enrolledAt`.
- [x] Thêm bảng `progress`: `id`, `userId` (FK), `lessonId` (FK), `completed` (boolean), `completedAt`.
- [x] Thêm bảng `certificates`: `id`, `userId` (FK), `courseId` (FK), `issuedAt`, `certificateUrl`.
- [x] Thêm role vào `usersTable`: cột `role` (`student`/`instructor`/`admin`, default `student`). Cũng thêm luôn `avatarUrl` (cần cho phase 09).
- [x] Áp schema lên DB thật qua `drizzle-kit push` (diff trực tiếp DB, không dùng migration file — repo chưa có journal migration nào từ trước nên `generate` sẽ tưởng DB rỗng và tạo lại `CREATE TABLE users` trùng; `push` an toàn hơn cho case này). Verify: 7 bảng đã tạo (`users`, `courses`, `modules`, `lessons`, `enrollments`, `progress`, `certificates`), data `users` cũ (1 row) không mất.

### SDK / Dependencies setup
- [x] `npm install @anthropic-ai/sdk openai` (AI — dùng ở phase 06).
- [x] `npm install uploadthing @uploadthing/react` (storage — dùng ở phase 00/09).
- [x] `npm install @mux/mux-node @mux/mux-player-react` (video — dùng ở phase 06).
- [x] `npm install resend` (email — dùng ở phase 13).
- [x] Gỡ `react-router-dom` — xác nhận không import ở đâu trong `app/`, `components/`, `lib/`, `context/` (grep sạch) → đã `npm uninstall`.

### Env
- [ ] Đối chiếu `.env` thật có đủ key theo `.env.example` mới — user tự điền key thật (Anthropic/OpenAI/VNPay/UploadThing/Mux/Resend/Analytics) khi có, không thuộc phạm vi tự động hoá phase này.

## File liên quan

- `config/schema.ts`
- `config/db.ts`
- `.env`, `.env.example`
- `package.json`
- `drizzle.config.ts`
