# Phase 16 — Testing & QA

## Mục tiêu

Có test framework tối thiểu bảo vệ các luồng quan trọng (auth guard, payment, AI tutor API, progress tracking) trước khi coi platform "production-ready".

## Trạng thái hiện tại

Không có test framework nào (`package.json` không có Jest/Vitest/Playwright), không có file `*.test.*`/`*.spec.*` nào trong repo.

## Việc cần làm

### Setup
- [x] Cài Vitest — **không cài `@vitejs/plugin-react`**: peer-dependency conflict thật (`@babel/core@8` beta chain xung đột `@rolldown/plugin-babel`, npm error thật khi cài). Kiểm tra lại thấy không cần: scope test đã chọn là pure function/logic (không render component/DOM), Vite mặc định đã tự strip JSX qua esbuild cho file `.tsx` kể cả không có plugin — verify thật bằng cách import `formatPrice` từ 1 file `.tsx` có JSX (`course-card.tsx`) trong test, chạy pass bình thường.
- [x] Cài Playwright thật (`@playwright/test`) — **cũng cài được browser Chromium thật** (`npx playwright install chromium`, không cần `--with-deps` vì bước đó cần `sudo` mà môi trường không có terminal để auth — bỏ qua bước system deps, chromium vẫn tải và chạy được bình thường).
- [x] Thêm script `test` (`vitest run`), `test:watch` (`vitest`), `test:e2e` (`playwright test`) vào `package.json`.
- [x] `vitest.config.ts` (alias `@/` khớp `tsconfig.json`) + `tests/setup.ts` (load `dotenv/config` — vitest không tự load `.env` như Next dev server, thiếu bước này sẽ lỗi `DATABASE_URL` ngay khi import bất kỳ file nào chạm `config/db.ts`).
- [x] `playwright.config.ts` — `webServer.reuseExistingServer: true` để tái dùng dev server đang chạy sẵn thay vì tự spawn cái mới (tránh xung đột port).

### Unit/Integration tests ưu tiên
- [x] `lib/vnpay.ts` — test đầy đủ: build URL đúng field/format (amount ×100, strip dấu tiếng Việt ở `orderInfo`), round-trip verify chữ ký, **phát hiện + test đúng case tamper** (sửa `vnp_Amount` sau khi ký → signature invalid), lỗi rõ ràng khi thiếu env config, `isVnpaySuccess` đúng 3 case. Không gọi API thật trong test tự động (khác với verify thủ công ở phase 12) — dùng secret giả cố định, tự tính lại HMAC để so sánh.
- [x] AI tutor: **tách khác plan gốc** — không mock SDK trực tiếp trong route test vì `route.ts` import `lib/auth` → `@clerk/nextjs/server` → package `server-only` throw ngay khi import ngoài request context thật của Next (gặp lại đúng vấn đề đã biết từ lúc verify thủ công phase 06/09). Giải pháp: tách 2 hàm pure (`checkRateLimit`, `isChatMessage`) ra `lib/ai-tutor.ts` (file không đụng Clerk/DB), route import lại từ đó — vừa test được thật, vừa route giữ nguyên hành vi. Test rate limit đúng ngưỡng/reset/tách biệt theo key, validate message shape đúng mọi input xấu.
- [x] Certificate issuance: tách pure predicate `shouldIssueCertificate(total, completed)` ra `lib/certificates.ts` (lý do tách giống AI tutor — file gốc `app/learn/[lessonId]/actions.ts` toàn bộ là `"use server"`, export thêm 1 hàm sync sẽ bị Next hiểu nhầm thành Server Action không hợp lệ). Test đủ 4 case biên (0 lesson, chưa đủ, vừa đủ, vượt).
- [x] Search full-text: **không viết test tự động cho phần DB-dependent** — bản chất tính năng phụ thuộc thật vào Postgres + extension `unaccent`, mock được thì mất hết giá trị test. Đã verify kỹ bằng tay với data thật trên Neon ở phase 14 (ghi trong `docs/phases/14-search.md`), giữ nguyên làm bằng chứng thay vì viết lại thành automated test giả.
- [x] Bonus ngoài checklist gốc: test thêm `lib/instructor.ts` (`canManageCourses`) và `components/site/course-card.tsx` (`formatPrice`) — 2 hàm pure nhỏ, dễ test, có giá trị regression thật (VD lỗi format giá sẽ hiện sai khắp nơi).

### E2E critical path (Playwright)
- [x] Viết + **chạy thật thành công** 9 test smoke (không cần auth): trang chủ, catalog, 404 course không tồn tại, search box điều hướng đúng `/courses?q=...`, và **role/auth guard cho cả 5 route bảo vệ** (`/dashboard`, `/settings`, `/profile`, `/instructor`, `/admin` — chưa login đều redirect đúng `/sign-in`).
- [ ] Sign-up → header đổi trạng thái; Đăng ký free → vào học; Flow VNPay end-to-end qua UI; Instructor tạo course → hiện ở catalog; Role guard khi **đã login sai role** (khác nhánh "chưa login" đã test) — **chưa tự động hoá được**: cả 5 test này cần 1 phiên đăng nhập Clerk thật, và dự án chưa cấu hình Clerk test-mode (test token/testing instance để Playwright tự đăng nhập không cần OAuth thật qua Google). Đây là hạn mục lớn cần làm riêng (không phải chỉ thêm vài dòng test) — để lại cho khi có nhu cầu CI nghiêm ngặt hơn. Toàn bộ các luồng này đã được verify thủ công kỹ với data/API thật xuyên suốt phase 05–14 (ghi rõ trong từng phase doc tương ứng), chỉ là chưa thành regression test tự động chạy lại được.

### CI
- [x] `.github/workflows/ci.yml` — chạy `npm ci` + `npm run lint` + `npm run test` (không chạy `test:e2e` vì cần secrets/env thật + cài browser, ngoài phạm vi "tối thiểu" checklist yêu cầu). **Lưu ý**: repo hiện **chưa phải git repository** (`git status` báo "not a git repository") — file CI này sẵn sàng chờ, sẽ tự chạy khi repo được `git init` + push lên GitHub, không cần sửa gì thêm lúc đó.
- [x] **Phát hiện + sửa luôn 2 lỗi lint thật** khi chạy `npm run lint` lần đầu (nếu không sửa, CI vừa thêm sẽ đỏ ngay từ commit đầu tiên): (1) `app/provider.tsx` — lỗi pre-existing từ scaffold gốc, `createNewUser` dùng trước khi khai báo trong `useEffect` (hoist function lên trước effect); (2) rule mới `react-hooks/set-state-in-effect` (khá "nhạy" — flag cả gọi hàm async gián tiếp set state) bắt đúng 1 chỗ thật cần sửa ở `search-box.tsx` (`setLoading(true)` gọi đồng bộ trong effect thay vì trong callback debounce — dời vào đúng chỗ) và 1 chỗ false-positive ở `provider.tsx` (setState thật ra nằm sau `await`, không đồng bộ — disable có chú thích rõ lý do thay vì sửa sai cấu trúc code).

## File liên quan

- `package.json` (scripts `test`/`test:watch`/`test:e2e`)
- `vitest.config.ts`, `tests/setup.ts` (mới)
- `playwright.config.ts` (mới)
- `tests/unit/*.test.ts` (mới — vnpay, instructor, certificates, course-card, ai-tutor)
- `e2e/smoke.spec.ts` (mới)
- `lib/ai-tutor.ts`, `lib/certificates.ts` (mới — pure logic tách ra để test được, không đổi hành vi)
- `app/api/ai/tutor/route.ts`, `app/learn/[lessonId]/actions.ts` (import lại từ 2 file trên thay vì định nghĩa inline)
- `app/provider.tsx`, `components/site/search-box.tsx` (sửa lỗi lint thật phát hiện được)
- `.github/workflows/ci.yml` (mới)
- `.gitignore` (thêm `/test-results`, `/playwright-report`, `/blob-report`, `/playwright/.cache`)
