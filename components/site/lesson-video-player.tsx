"use client";

import { useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { MaterialIcon } from "@/components/site/material-icon";
import { markLessonComplete } from "@/app/learn/[lessonId]/actions";

const COMPLETE_THRESHOLD = 0.9;

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function LessonVideoPlayer({
  lessonId,
  videoAssetId,
  youtubeUrl,
  title,
}: {
  lessonId: number;
  videoAssetId: string | null;
  youtubeUrl: string | null;
  title: string;
}) {
  const markedRef = useRef(false);

  if (!videoAssetId && youtubeUrl) {
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
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
      onTimeUpdate={(e) => {
        const el = e.target as MuxPlayerRefAttributes;
        if (markedRef.current || !el.duration) return;
        if (el.currentTime / el.duration >= COMPLETE_THRESHOLD) {
          markedRef.current = true;
          markLessonComplete(lessonId);
        }
      }}
    />
  );
}
