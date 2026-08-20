"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MaterialIcon } from "@/components/site/material-icon";
import { toggleLessonReaction, toggleSavedLesson } from "@/app/learn/[lessonId]/actions";

export function LessonActionsBar({
  lessonId,
  helpfulCount,
  notHelpfulCount,
  userReaction,
  saved,
}: {
  lessonId: number;
  helpfulCount: number;
  notHelpfulCount: number;
  userReaction: boolean | null;
  saved: boolean;
}) {
  const [reaction, setReaction] = useState(userReaction);
  const [helpful, setHelpful] = useState(helpfulCount);
  const [notHelpful, setNotHelpful] = useState(notHelpfulCount);
  const [isSaved, setIsSaved] = useState(saved);
  const [, startTransition] = useTransition();

  function handleReaction(isHelpful: boolean) {
    const prev = { reaction, helpful, notHelpful };

    if (reaction === isHelpful) {
      setReaction(null);
      if (isHelpful) setHelpful((n) => n - 1);
      else setNotHelpful((n) => n - 1);
    } else {
      setReaction(isHelpful);
      if (isHelpful) {
        setHelpful((n) => n + 1);
        if (prev.reaction === false) setNotHelpful((n) => n - 1);
      } else {
        setNotHelpful((n) => n + 1);
        if (prev.reaction === true) setHelpful((n) => n - 1);
      }
    }

    startTransition(async () => {
      try {
        await toggleLessonReaction(lessonId, isHelpful);
      } catch (err) {
        setReaction(prev.reaction);
        setHelpful(prev.helpful);
        setNotHelpful(prev.notHelpful);
        toast.error(err instanceof Error ? err.message : "Không thể gửi đánh giá.");
      }
    });
  }

  function handleSave() {
    const prev = isSaved;
    setIsSaved(!prev);
    startTransition(async () => {
      try {
        await toggleSavedLesson(lessonId);
        toast.success(prev ? "Đã bỏ lưu bài học." : "Đã lưu bài học.");
      } catch (err) {
        setIsSaved(prev);
        toast.error(err instanceof Error ? err.message : "Không thể lưu bài học.");
      }
    });
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết bài học.");
    } catch {
      toast.error("Không thể sao chép liên kết.");
    }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 py-1">
      <div className="flex items-center rounded-full border border-outline-variant/50 overflow-hidden">
        <button
          type="button"
          onClick={() => handleReaction(true)}
          aria-pressed={reaction === true}
          aria-label="Hữu ích"
          className={
            reaction === true
              ? "flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary transition-colors"
              : "flex items-center gap-1.5 px-3 py-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          }
        >
          <MaterialIcon name="thumb_up" filled={reaction === true} className="text-[18px]" />
          <span className="font-label-md text-label-sm">{helpful}</span>
        </button>
        <div className="w-px self-stretch bg-outline-variant/50" />
        <button
          type="button"
          onClick={() => handleReaction(false)}
          aria-pressed={reaction === false}
          aria-label="Không hữu ích"
          className={
            reaction === false
              ? "flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error transition-colors"
              : "flex items-center gap-1.5 px-3 py-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          }
        >
          <MaterialIcon name="thumb_down" filled={reaction === false} className="text-[18px]" />
          <span className="font-label-md text-label-sm">{notHelpful}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-sm"
        >
          <MaterialIcon name="share" className="text-[18px]" />
          Chia sẻ
        </button>
        <button
          type="button"
          onClick={handleSave}
          aria-pressed={isSaved}
          className={
            isSaved
              ? "flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary bg-primary/10 text-primary transition-colors font-label-md text-label-sm"
              : "flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-sm"
          }
        >
          <MaterialIcon name="bookmark" filled={isSaved} className="text-[18px]" />
          {isSaved ? "Đã lưu" : "Lưu bài học"}
        </button>
      </div>
    </div>
  );
}
