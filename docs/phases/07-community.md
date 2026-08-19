# Phase 07 — Community (`/community`)

## Mục tiêu

Forum thảo luận thật: user tạo thread, reply, thay toàn bộ mock forum data.

## Trạng thái hiện tại

`app/community/page.tsx` — static, forum threads/contributors từ `lib/mock-data.ts` (`Thread`, `Contributor` types), không có form đăng bài thật.

## Việc cần làm

### Backend / Data
- [x] Thêm bảng `threads` (`id`, `authorId`, `courseId` nullable, `tag`, `title`, `body`, `createdAt`) và `replies` (`id`, `threadId`, `authorId`, `body`, `createdAt`) vào `config/schema.ts`, push lên Neon thật. **Thêm cột `tag` so với plan gốc** — cần để giữ tính năng "Chủ đề nổi bật" (trending tag) và chip hiển thị trên UI như bản mock cũ, không có trong checklist ban đầu nhưng cần thiết để không mất tính năng.
- [x] Server Actions thay vì API route riêng: `app/community/actions.ts` (`createThread`, `createReply`) — dùng `<form action={...}>` trực tiếp, không cần `fetch`/client JS, tự động có CSRF protection theo cơ chế Server Actions của Next (xem note bảo mật ở phase 05). Auth check bên trong action (`getCurrentAppUser`), nhưng form cũng chỉ render khi đã login nên đây là lớp phòng thủ thứ 2.

### Frontend wiring
- [x] Query threads thật (`lib/queries.ts`: `getThreads`, `getThreadDetail`) — render list ở `/community`, chi tiết + replies ở `/community/[threadId]` (route mới).
- [x] Form đăng thread mới (`/community`) và form reply (`/community/[threadId]`) — dùng HTML `required` để chặn submit rỗng (progressive enhancement, không cần JS), `revalidatePath` sau khi submit để list/detail cập nhật ngay.
- [x] Contributors leaderboard tính thật: `getTopContributors` — rank theo `(số thread + số reply)` mỗi user, chỉ hiện user có đóng góp > 0.
- [x] "Chủ đề nổi bật" (trending) cũng đổi thành thật: `getTrendingTags` — đếm tần suất `tag` thật trong `threads`, KHÔNG còn mảng `trendingTopics` hardcode 3 dòng cứng như bản cũ.
- [x] Bỏ `views` (lượt xem) và badge `hot`/`pinned`/`verified` khỏi UI — đây là số liệu/gắn cờ kiểm duyệt bịa trong mock, không có cơ chế tracking view hay hệ thống moderator nào được xây, giữ lại sẽ vi phạm chủ trương không fake data.
- [x] Nút "Read Full Guidelines" (mock cũ trỏ `href="#"`) — bỏ hẳn vì không có trang guidelines đầy đủ nào tồn tại, giữ lại text nội quy tĩnh (chính sách thật, không phải data).

### Test
- [x] Seed thread + reply thật lên DB Neon (script, xoá ngay sau khi verify) → confirm qua `curl`: `/community` list đúng title/tag/reply count, contributor leaderboard đúng "1 thảo luận • 1 trả lời", `/community/[threadId]` hiện đúng nội dung thread + reply + đếm đúng "1 trả lời". `/community/999` (không tồn tại) → 404 đúng. Đã dọn sạch data test.
- [x] Thứ tự thời gian: list order theo `createdAt desc` (mới nhất trước), replies trong thread order theo `createdAt asc` (cũ nhất trước, đúng luồng đọc hội thoại).

## File liên quan

- `app/community/page.tsx` (viết lại — list + form tạo thread)
- `app/community/[threadId]/page.tsx` (mới — detail + reply)
- `app/community/actions.ts` (mới — `createThread`, `createReply`)
- `lib/queries.ts` (`getThreads`, `getThreadDetail`, `getTopContributors`, `getTrendingTags`)
- `config/schema.ts` (bảng `threads`, `replies`)
- `lib/mock-data.ts` (đã verify `grep` không còn nơi nào import `Thread`/`Contributor`/`threads`/`topContributors` — export vẫn còn trong file nhưng dead code, chưa xoá hẳn để tránh đụng chạm ngoài phạm vi phase này)
