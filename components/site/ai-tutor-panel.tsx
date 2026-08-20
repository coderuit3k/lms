"use client";

import { useState, type FormEvent } from "react";
import { MaterialIcon } from "@/components/site/material-icon";

type ChatMessage = { role: "user" | "assistant"; content: string };

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Gia sư AI đang trả lời" role="status">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant animate-bounce" />
    </span>
  );
}

export function AiTutorPanel({ lessonId, compact = false }: { lessonId: number; compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const history = messages;
    setInput("");
    setError(null);
    setMessages([...history, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, message: text, history }),
      });

      if (!res.ok || !res.body) {
        throw new Error((await res.text()) || "Không kết nối được Gia sư AI.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: snapshot };
          return copy;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại nhé.");
      // Xoá placeholder "assistant" rỗng vừa thêm, giữ lại tin nhắn user đã gửi.
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        compact
          ? "bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl flex flex-col md:col-span-6 min-h-[300px]"
          : "bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl flex flex-col md:col-span-4 lg:col-span-3 min-h-[400px]"
      }
    >
      <div className="p-4 border-b border-outline-variant/30 flex items-center gap-2 bg-surface-container-high/50 rounded-t-xl">
        <MaterialIcon name="smart_toy" className="text-primary" />
        <h2 className="font-headline-md text-headline-md text-on-surface text-[18px]">Gia sư AI</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
            Hỏi Gia sư AI bất cứ điều gì về bài học này.
          </p>
        )}
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div key={i} className="bg-surface-container-high px-4 py-3 rounded-lg rounded-tl-none self-start max-w-[90%]">
              {msg.content ? (
                <p className="font-body-md text-body-md text-on-surface text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                loading && i === messages.length - 1 && <TypingDots />
              )}
            </div>
          ) : (
            <div
              key={i}
              className="bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 rounded-lg rounded-tr-none self-end max-w-[90%]"
            >
              <p className="font-body-md text-body-md text-on-surface text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ),
        )}
        {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-outline-variant/30">
        <div className="relative">
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-sm text-on-surface placeholder:text-on-surface-variant disabled:opacity-60"
            placeholder="Đặt câu hỏi..."
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            aria-label="Gửi câu hỏi"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container disabled:opacity-40"
            disabled={loading || !input.trim()}
          >
            <MaterialIcon name="send" filled className="text-[20px]" />
          </button>
        </div>
      </form>
    </div>
  );
}
