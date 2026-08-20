"use client";

import { useEffect, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { MaterialIcon } from "@/components/site/material-icon";
import { markLessonComplete, saveLessonPosition } from "@/app/learn/[lessonId]/actions";

const COMPLETE_THRESHOLD = 0.9;
const SAVE_INTERVAL_MS = 10000;

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YTPlayer = any;

let youtubeApiPromise: Promise<void> | null = null;
function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { YT?: { Player?: unknown }; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return youtubeApiPromise;
}

// Nhúng qua YouTube IFrame API (thay vì <iframe> tĩnh) để lấy được currentTime/duration thật —
// cần thiết để tự động lưu vị trí xem và đánh dấu hoàn thành bài học, giống hệt cơ chế của Mux
// bên dưới. Bản <iframe> tĩnh trước đây không làm được việc này (không có cách giao tiếp ra ngoài).
function YoutubeEmbed({
  youtubeId,
  title,
  lessonId,
  initialPosition,
  preview,
}: {
  youtubeId: string;
  title: string;
  lessonId: number;
  initialPosition: number | null | undefined;
  preview: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer>(null);
  const markedRef = useRef(false);

  useEffect(() => {
    let destroyed = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadYoutubeIframeApi().then(() => {
      if (destroyed || !containerRef.current) return;
      const YT = (window as unknown as { YT: YTPlayer }).YT;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId: youtubeId,
        playerVars: initialPosition && initialPosition > 0 ? { start: Math.floor(initialPosition) } : {},
        events: {
          onStateChange: (e: { data: number }) => {
            if (preview) return;
            if (e.data === YT.PlayerState.PLAYING) {
              if (interval) clearInterval(interval);
              interval = setInterval(() => {
                const player = playerRef.current;
                if (!player?.getCurrentTime) return;
                const current: number = player.getCurrentTime();
                const duration: number = player.getDuration();
                saveLessonPosition(lessonId, current);
                if (!markedRef.current && duration > 0 && current / duration >= COMPLETE_THRESHOLD) {
                  markedRef.current = true;
                  markLessonComplete(lessonId);
                }
              }, SAVE_INTERVAL_MS);
            } else if (interval) {
              clearInterval(interval);
              interval = null;
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (interval) clearInterval(interval);
      playerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId, lessonId, preview]);

  return <div ref={containerRef} className="w-full h-full" aria-label={title} />;
}

export function LessonVideoPlayer({
  lessonId,
  videoAssetId,
  youtubeUrl,
  title,
  initialPosition,
  preview = false,
}: {
  lessonId: number;
  videoAssetId: string | null;
  youtubeUrl: string | null;
  title: string;
  /** Vị trí xem lần trước (giây) — tự tiếp tục từ đây nếu có. */
  initialPosition?: number | null;
  /** Xem trước cho giảng viên — không lưu vị trí xem hay ghi nhận hoàn thành bài học. */
  preview?: boolean;
}) {
  const markedRef = useRef(false);
  const lastSaveRef = useRef(0);

  if (!videoAssetId && youtubeUrl) {
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (youtubeId) {
      return (
        <YoutubeEmbed
          youtubeId={youtubeId}
          title={title}
          lessonId={lessonId}
          initialPosition={preview ? null : initialPosition}
          preview={preview}
        />
      );
    }
  }

  if (!videoAssetId) {
    return (
      <div className="relative flex-1 w-full bg-on-surface flex flex-col items-center justify-center gap-2 text-surface/80">
        <MaterialIcon name="videocam_off" className="text-4xl" />
        <p className="font-body-md text-body-md">Video đang được giảng viên tải lên.</p>
      </div>
    );
  }

  return (
    <MuxPlayer
      playbackId={videoAssetId}
      metadata={{ video_title: title }}
      streamType="on-demand"
      className="w-full h-full"
      startTime={!preview && initialPosition ? initialPosition : undefined}
      onTimeUpdate={
        preview
          ? undefined
          : (e) => {
              const el = e.target as MuxPlayerRefAttributes;
              if (!el.duration) return;

              const now = Date.now();
              if (now - lastSaveRef.current >= SAVE_INTERVAL_MS) {
                lastSaveRef.current = now;
                saveLessonPosition(lessonId, el.currentTime);
              }

              if (markedRef.current) return;
              if (el.currentTime / el.duration >= COMPLETE_THRESHOLD) {
                markedRef.current = true;
                markLessonComplete(lessonId);
              }
            }
      }
    />
  );
}
