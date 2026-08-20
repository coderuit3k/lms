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

  return (
    <>
      <div
        className={
          open
            ? "absolute inset-x-0 bottom-0 p-2 flex justify-end gap-1.5 opacity-100 transition-opacity bg-gradient-to-t from-on-surface/70 to-transparent"
            : "absolute inset-x-0 bottom-0 p-2 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-gradient-to-t from-on-surface/70 to-transparent"
        }
      >
        {hasYoutubeVideo ? (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 bg-surface/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm px-2.5 py-1.5 rounded-full hover:bg-surface transition-colors"
            >
              <MaterialIcon name="sync" className="text-[14px]" /> Đổi video
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              aria-label="Xoá video khỏi bài học"
              title="Xoá video"
              className="bg-surface/90 backdrop-blur-sm text-on-surface hover:text-error disabled:opacity-50 p-1.5 rounded-full hover:bg-surface transition-colors"
            >
              <MaterialIcon name="delete" className="text-[14px]" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 bg-surface/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm px-2.5 py-1.5 rounded-full hover:bg-surface transition-colors"
          >
            <MaterialIcon name="travel_explore" className="text-[14px]" /> Tìm video YouTube
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 flex flex-col gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 shadow-lg opacity-100">
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
    </>
  );
}
