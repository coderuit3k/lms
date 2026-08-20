"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MaterialIcon } from "@/components/site/material-icon";
import { searchYoutubeForLesson, setLessonYoutubeVideo, clearLessonYoutubeVideo } from "@/app/instructor/actions";
import type { YoutubeSuggestion } from "@/lib/youtube-search";

export function YoutubeVideoPicker({
  lessonId,
  defaultTopic,
  hasYoutubeVideo,
}: {
  lessonId: number;
  defaultTopic: string;
  hasYoutubeVideo: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(defaultTopic);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<YoutubeSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      const found = await searchYoutubeForLesson(lessonId, topic);
      setResults(found);
      if (found.length === 0) setError("Không tìm thấy video phù hợp, thử chủ đề khác.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tìm video thất bại.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(suggestion: YoutubeSuggestion) {
    setLoading(true);
    try {
      await setLessonYoutubeVideo(lessonId, suggestion.url);
      setOpen(false);
      setResults(null);
      toast.success("Đã gắn video YouTube cho bài học.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gắn video thất bại.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setLoading(true);
    try {
      await clearLessonYoutubeVideo(lessonId);
      toast.success("Đã gỡ video khỏi bài học.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gỡ video thất bại.");
    } finally {
      setLoading(false);
    }
  }

  if (hasYoutubeVideo) {
    return (
      <button
        type="button"
        onClick={handleClear}
        disabled={loading}
        aria-label="Gỡ video YouTube khỏi bài học"
        title="Gỡ video"
        className="self-start text-on-surface-variant hover:text-error disabled:opacity-50 p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
      >
        <MaterialIcon name="delete" className="text-[18px]" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-primary hover:text-primary-container flex items-center gap-1 font-label-sm text-label-sm w-fit"
      >
        <MaterialIcon name="travel_explore" className="text-[16px]" /> Tìm video YouTube
      </button>

      {open && (
        <div className="flex flex-col gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Chủ đề video..."
              className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || !topic.trim()}
              className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm disabled:opacity-50 whitespace-nowrap transition-transform active:scale-[0.97]"
            >
              {loading ? "Đang tìm..." : "Tìm"}
            </button>
          </div>

          {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}

          {results && results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((r) => (
                <div key={r.videoId} className="flex items-center gap-2 bg-surface rounded-lg p-2 border border-outline-variant/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${r.videoId}/mqdefault.jpg`}
                    alt=""
                    className="w-24 h-14 object-cover rounded shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-label-sm text-label-sm text-on-surface truncate">{r.title}</p>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-label-sm text-label-sm text-primary hover:underline">
                      Xem trước
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect(r)}
                    disabled={loading}
                    className="px-3 py-1.5 border border-primary text-primary rounded-lg text-sm hover:bg-primary/10 disabled:opacity-50 whitespace-nowrap"
                  >
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
