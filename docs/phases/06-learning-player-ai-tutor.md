# Phase 06 — Learning Player + AI Tutor thật (`/learn/[lessonId]`, đổi tên từ `[id]`)

## Mục tiêu

Đây là phase lõi biến sản phẩm thành **AI** Online Learning Platform thật: video học thật (Mux) + AI Tutor trả lời thật (Claude/OpenAI) thay vì UI giả.

## Trạng thái hiện tại

`app/learn/[id]/page.tsx` render `<LearningPlayer>` (`components/site/learning-player.tsx`) — 100% tĩnh:
- Không có `<video>` thật, chỉ ảnh nền giả lập player với nút play/seek không hoạt động.
- "AI Tutor" panel hiển thị mảng `lesson.aiMessages` hardcode, input box không có `onChange`/`onSubmit`, không gọi API nào.

## Việc cần làm

### Backend / Data
- [x] Query lesson thật kèm next/prev lesson + curriculum toàn khoá — `lib/queries.ts` (`getLearnPageData`), đổi route folder `app/learn/[id]` → `app/learn/[lessonId]` (khớp cách phase 05 đã đổi `[id]` → `[slug]`; các link tạo ở phase 03/05 vốn đã trỏ theo lesson id thật).
- [x] Lịch sử chat AI tutor: **quyết định lưu client-side (React state) cho MVP, không tạo bảng `ai_messages`** — chat mất khi refresh trang, chấp nhận được cho bản đầu; nếu sau cần lưu lâu dài thì thêm bảng lúc đó (đúng như phase doc gốc đã để ngỏ quyết định này).

### AI Tutor (trọng tâm)
- [x] API route `app/api/ai/tutor/route.ts` — nhận `{ lessonId, message, history }`, ưu tiên Anthropic (`ANTHROPIC_API_KEY`) nếu có, fallback OpenAI (`OPENAI_API_KEY`). Có xác thực + kiểm tra ownership: user phải đăng nhập VÀ đã `enrollments.status = 'paid'` khoá học chứa lesson đó mới gọi được (không tin `lessonId` từ client là đủ).
- [x] System prompt nhúng `lesson.content` + tên bài/tên khoá thật từ DB, giới hạn AI trả lời trong phạm vi bài học.
- [x] Streaming thật qua Anthropic SDK `messages.stream()` (event `text`/`end`/`error`) pipe thẳng vào `ReadableStream` trả về client dạng text thuần (không dùng SSE hay thêm dependency `ai` SDK — giữ tối giản, client chỉ cần `fetch` + `response.body.getReader()`). OpenAI fallback dùng `stream: true` chuẩn của `openai` SDK.
- [x] `components/site/ai-tutor-panel.tsx` (Client Component mới, tách khỏi `learning-player.tsx` vì cần `useState`/interactivity): input `onChange`/`onSubmit` thật, gọi API route, render token đổ dần theo stream.
- [x] Rate limit đơn giản: in-memory `Map` theo `userId:lessonId`, 20 tin nhắn/giờ. **Giới hạn đã biết**: reset khi restart server, không đồng bộ nếu scale nhiều instance — đủ cho MVP một instance.
- [x] Thiếu cả 2 API key → trả lỗi 500 rõ ràng thay vì crash.
- [x] **Phát hiện quan trọng khi test thật**: Claude Opus 5 (model mặc định) bật adaptive thinking sẵn — với `max_tokens` nhỏ, thinking token ăn hết budget khiến câu trả lời bị cắt cụt (test thật: `max_tokens:30` → chỉ ra được 4 ký tự, `thinking_tokens:26`). Fix: thêm `output_config: { effort: "low" }` (phù hợp tác vụ hỏi-đáp ngắn theo bài học, không cần suy luận sâu) — test lại cho câu trả lời đầy đủ, `stop_reason: end_turn`, thinking token giảm còn 14. Không tắt hẳn thinking vì theo tài liệu Claude API, tắt thinking trên Opus 5 có thể làm lộ tool-call/tag vào text.

### Video (Mux)
- [x] `components/site/lesson-video-player.tsx` (Client Component mới) dùng `@mux/mux-player-react`, phát theo `lessons.videoAssetId` (dùng làm Mux playback ID). Khi `videoAssetId` null (mọi lesson hiện tại — chưa có instructor upload flow, phase 10 chưa build) → hiện placeholder "Video đang được giảng viên tải lên" thay vì crash hoặc giả video.
- [x] Track tiến độ: `onTimeUpdate` tính `currentTime/duration`, ≥ 90% → gọi Server Action `markLessonComplete` (chỉ gọi 1 lần nhờ `useRef` guard).
- [x] `markLessonComplete` (`app/learn/[lessonId]/actions.ts`) verify lại ownership (lesson thuộc course mà user đã `paid`) trước khi ghi `progress`, upsert idempotent (không tạo duplicate row nếu gọi lại).

### Frontend wiring
- [x] Next/prev lesson điều hướng thật theo thứ tự trong `curriculum` (đã sort theo `module.order` rồi `lesson.order`).
- [x] Curriculum panel hiển thị trạng thái hoàn thành thật (icon check) thay vì mock trạng thái "locked" giả — bỏ hẳn khái niệm "locked" vì chưa có tính năng khoá bài học theo thứ tự nào được xây.
- [x] Bỏ panel "Lesson Resources" khỏi UI — không có bảng `resources` nào trong schema (đó là việc của phase 08), giữ nguyên UI với data giả là vi phạm chủ trương không fake data của dự án.

### Test
- [x] Seed course/module/2 lesson/enrollment `paid` tạm lên DB Neon thật → verify trực tiếp: `getLearnPageData` trả đúng curriculum/next/prev; upsert `progress` idempotent (chạy 2 lần không tạo duplicate); `getHoursSpent` cộng dồn đúng sau khi đánh dấu hoàn thành. Gọi **Anthropic API thật** (không mock) 2 lần với `max_tokens` nhỏ để tìm ra vấn đề effort/thinking ở trên — xác nhận fix hoạt động bằng response thật. Đã dọn sạch toàn bộ data test sau khi xong.
- [ ] Video phát đúng asset — **chưa test được**, chưa có Mux asset thật nào (cần upload flow ở phase 10).
- [x] User chưa mua khoá học không truy cập được `/learn/[lessonId]` — `page.tsx` check `getEnrollmentStatus` != `'paid'` → `redirect` về trang course; verify unauth request bị middleware redirect 307 tới `/sign-in` (route `/learn` đã có trong matcher từ phase 02).
- [ ] Gửi câu hỏi AI Tutor qua UI thật (không phải script) — **chưa test được qua browser** (cần session đăng nhập thật, không tự đăng nhập hộ theo chính sách an toàn); logic backend đã verify bằng lời gọi API thật ở trên.

## File liên quan

- `app/learn/[lessonId]/page.tsx` (đổi tên từ `[id]`)
- `app/learn/[lessonId]/actions.ts` (mới — Server Action `markLessonComplete`)
- `components/site/learning-player.tsx` (viết lại — bố cục server, ghép 2 client island)
- `components/site/ai-tutor-panel.tsx` (mới, Client Component)
- `components/site/lesson-video-player.tsx` (mới, Client Component)
- `app/api/ai/tutor/route.ts` (mới)
- `lib/queries.ts` (`getLearnPageData`)
- `config/schema.ts` (bảng `lessons`, `progress` — không thêm `ai_messages`, xem quyết định ở trên)
