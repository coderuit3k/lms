import Anthropic from "@anthropic-ai/sdk";

export type YoutubeSuggestion = { title: string; url: string; videoId: string };

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/** Chỉ hỗ trợ Anthropic — đây là tính năng cần grounded search thật (web_search tool trả URL
 * thật từ kết quả tìm kiếm), không thể dùng GPT-4o-mini an toàn vì model chat thường không có
 * quyền truy cập web thời gian thực và sẽ tự bịa video ID/URL trông hợp lý nhưng không tồn tại. */
export async function suggestYoutubeVideos(topic: string): Promise<YoutubeSuggestion[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Cần ANTHROPIC_API_KEY để dùng tính năng tìm video YouTube (dựa trên web search thật).");
  }

  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3,
        allowed_domains: ["youtube.com", "www.youtube.com"],
      },
    ],
    messages: [
      {
        role: "user",
        content: `Tìm video YouTube phù hợp nhất để dạy/giải thích chủ đề: "${topic}". Chỉ cần tìm kiếm, không cần viết thêm nhận xét.`,
      },
    ],
  });

  const suggestions: YoutubeSuggestion[] = [];
  for (const block of response.content) {
    if (block.type !== "web_search_tool_result" || !Array.isArray(block.content)) continue;
    for (const result of block.content) {
      if (result.type !== "web_search_result") continue;
      const videoId = extractYoutubeId(result.url);
      if (!videoId || suggestions.some((s) => s.videoId === videoId)) continue;
      suggestions.push({ title: result.title, url: result.url, videoId });
    }
  }

  return suggestions.slice(0, 5);
}
