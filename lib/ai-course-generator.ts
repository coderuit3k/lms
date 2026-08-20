import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const LessonSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type GeneratedLesson = z.infer<typeof LessonSchema>;

const ModuleSchema = z.object({
  title: z.string(),
  lessons: z.array(LessonSchema).min(2).max(3),
});

const CourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  modules: z.array(ModuleSchema).min(2).max(3),
});

export type GeneratedCourse = z.infer<typeof CourseSchema>;

// Phạm vi cố tình thu nhỏ (2-3 module, 2-3 bài/module, content ngắn) — bản đầy đủ (3-5 module x
// 3-5 bài, content 150-300 từ) đo thật mất ~190s/request (model Opus 5 + effort medium), vượt xa
// mức chấp nhận được cho 1 lần submit form đồng bộ và có nguy cơ chạm giới hạn thời gian hàm serverless.
const PROMPT_INSTRUCTIONS = (topic: string) =>
  `Thiết kế đề cương khoá học ngắn gọn bằng tiếng Việt cho chủ đề: "${topic}".
Yêu cầu: đúng 2-3 module, mỗi module 2-3 bài học. Mỗi bài học có nội dung giảng dạy thật (content) dài khoảng 80-150 từ — không phải chỉ 1 câu tóm tắt, nhưng cũng không cần dài dòng. category là 1 danh mục ngắn bằng tiếng Việt, người học phổ thông đọc hiểu ngay (VD: "Lập trình web", "Khoa học dữ liệu", "Thiết kế"). level là 1 trong "Beginner", "Intermediate", "Advanced" (giữ nguyên tiếng Anh, hệ thống tự dịch khi hiển thị).`;

export async function generateCourseContent(topic: string): Promise<GeneratedCourse> {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (!hasAnthropic && !hasOpenAI) {
    throw new Error("Chưa cấu hình AI provider — cần ANTHROPIC_API_KEY hoặc OPENAI_API_KEY trong .env.");
  }

  const prompt = PROMPT_INSTRUCTIONS(topic);

  if (hasAnthropic) {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.parse({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(CourseSchema) },
      messages: [{ role: "user", content: prompt }],
    });
    if (!response.parsed_output) throw new Error("AI không trả về dữ liệu hợp lệ.");
    return response.parsed_output;
  }

  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Bạn là chuyên gia thiết kế chương trình đào tạo. Luôn trả về đúng 1 JSON object khớp shape: {"title": string, "description": string, "category": string, "level": "Beginner"|"Intermediate"|"Advanced", "modules": [{"title": string, "lessons": [{"title": string, "content": string}]}]}. Không thêm text nào khác ngoài JSON.',
      },
      { role: "user", content: prompt },
    ],
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AI không trả về nội dung.");
  const parsed = CourseSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("AI trả về dữ liệu không đúng định dạng.");
  return parsed.data;
}

// Dùng model nhanh/rẻ (Haiku, gpt-4o-mini) vì chỉ sinh 1 bài học đơn lẻ — instructor bấm
// "Thêm bài học" và chờ ngay trong lúc thao tác, khác với generateCourseContent (sinh cả khoá học,
// chấp nhận chờ lâu hơn).
export async function generateLessonContent(topic: string): Promise<GeneratedLesson> {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  if (!hasAnthropic && !hasOpenAI) {
    throw new Error("Chưa cấu hình AI provider — cần ANTHROPIC_API_KEY hoặc OPENAI_API_KEY trong .env.");
  }

  const prompt = `Viết 1 bài học bằng tiếng Việt cho chủ đề: "${topic}". Đặt tên bài học (title) ngắn gọn, rõ ràng. Nội dung giảng dạy thật (content) dài khoảng 80-150 từ, không phải chỉ 1 câu tóm tắt.`;

  if (hasAnthropic) {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      // Haiku 4.5 không hỗ trợ output_config.effort (khác Opus 5 dùng ở generateCourseContent) — bỏ field này.
      output_config: { format: zodOutputFormat(LessonSchema) },
      messages: [{ role: "user", content: prompt }],
    });
    if (!response.parsed_output) throw new Error("AI không trả về dữ liệu hợp lệ.");
    return response.parsed_output;
  }

  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Bạn là chuyên gia thiết kế chương trình đào tạo. Luôn trả về đúng 1 JSON object khớp shape: {"title": string, "content": string}. Không thêm text nào khác ngoài JSON.',
      },
      { role: "user", content: prompt },
    ],
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AI không trả về nội dung.");
  const parsed = LessonSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("AI trả về dữ liệu không đúng định dạng.");
  return parsed.data;
}
