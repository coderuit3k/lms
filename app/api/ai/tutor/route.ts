import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable, lessonsTable, modulesTable } from "@/config/schema";
import { getCurrentAppUser } from "@/lib/auth";
import { getEnrollmentStatus } from "@/lib/queries";
import { checkRateLimit, isChatMessage, type ChatMessage } from "@/lib/ai-tutor";

export async function POST(req: NextRequest) {
  const appUser = await getCurrentAppUser();
  if (!appUser) return new Response("Bạn cần đăng nhập.", { status: 401 });

  let payload: { lessonId?: unknown; message?: unknown; history?: unknown };
  try {
    payload = await req.json();
  } catch {
    return new Response("Body không hợp lệ.", { status: 400 });
  }

  const lessonId = Number(payload.lessonId);
  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 2000) : "";
  const history: ChatMessage[] = Array.isArray(payload.history)
    ? payload.history.filter(isChatMessage).slice(-10)
    : [];

  if (!lessonId || !message) {
    return new Response("Thiếu lessonId hoặc message.", { status: 400 });
  }

  const [row] = await db
    .select({
      lessonTitle: lessonsTable.title,
      lessonContent: lessonsTable.content,
      courseId: modulesTable.courseId,
      courseTitle: coursesTable.title,
    })
    .from(lessonsTable)
    .innerJoin(modulesTable, eq(lessonsTable.moduleId, modulesTable.id))
    .innerJoin(coursesTable, eq(modulesTable.courseId, coursesTable.id))
    .where(eq(lessonsTable.id, lessonId));

  if (!row) return new Response("Bài học không tồn tại.", { status: 404 });

  const status = await getEnrollmentStatus(appUser.id, row.courseId);
  if (status !== "paid") return new Response("Bạn chưa đăng ký khoá học này.", { status: 403 });

  if (!checkRateLimit(`${appUser.id}:${lessonId}`)) {
    return new Response("Bạn hỏi hơi nhiều rồi, thử lại sau 1 giờ nhé.", { status: 429 });
  }

  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (!hasAnthropic && !hasOpenAI) {
    return new Response(
      "Chưa cấu hình AI provider — cần ANTHROPIC_API_KEY hoặc OPENAI_API_KEY trong .env.",
      { status: 500 },
    );
  }

  const systemPrompt = `Bạn là Scholaris AI Tutor, trợ giảng cho bài học "${row.lessonTitle}" thuộc khoá học "${row.courseTitle}".
Nội dung bài học: ${row.lessonContent ?? "(giảng viên chưa cập nhật nội dung chi tiết cho bài học này)"}

Chỉ trả lời các câu hỏi liên quan tới bài học này. Nếu học viên hỏi ngoài chủ đề, nhắc nhở lịch sự và hướng họ quay lại nội dung bài học. Trả lời ngắn gọn, rõ ràng, phù hợp hiển thị trong khung chat nhỏ. Dùng tiếng Việt trừ khi học viên hỏi bằng ngôn ngữ khác.`;

  const encoder = new TextEncoder();

  try {
    if (hasAnthropic) {
      const anthropic = new Anthropic();
      const stream = anthropic.messages.stream({
        model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
        max_tokens: 1024,
        // effort: "low" — đây là chat hỏi-đáp ngắn theo nội dung bài học, không cần suy luận sâu.
        // Không tắt hẳn thinking (biết lỗi: Opus 5 tắt thinking có thể rò tool-call/tag vào text).
        output_config: { effort: "low" },
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: [
          ...history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user" as const, content: message },
        ],
      });

      const body = new ReadableStream({
        start(controller) {
          stream.on("text", (text) => controller.enqueue(encoder.encode(text)));
          stream.on("end", () => controller.close());
          stream.on("error", (err) => controller.error(err));
        },
        cancel() {
          stream.abort();
        },
      });

      return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user" as const, content: message },
      ],
    });

    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định từ AI provider.";
    return new Response(`AI Tutor gặp lỗi: ${msg}`, { status: 502 });
  }
}
