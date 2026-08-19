/** Pure logic tách riêng khỏi app/api/ai/tutor/route.ts để test được mà không kéo theo
 * @clerk/nextjs/server (route.ts import lib/auth → server-only guard → throw khi import ngoài
 * request context thật của Next, kể cả trong file test). */

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const RATE_LIMIT_PER_HOUR = 20;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// In-memory, single-instance rate limit — đủ cho MVP. Reset khi restart server,
// không đồng bộ giữa nhiều instance nếu sau này scale ngang.
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_PER_HOUR) return false;
  entry.count += 1;
  return true;
}

export function isChatMessage(v: unknown): v is ChatMessage {
  return (
    typeof v === "object" &&
    v !== null &&
    ((v as ChatMessage).role === "user" || (v as ChatMessage).role === "assistant") &&
    typeof (v as ChatMessage).content === "string"
  );
}
