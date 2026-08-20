"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/site/material-icon";
import { AiTutorPanel } from "@/components/site/ai-tutor-panel";
import { LessonVideoPlayer } from "@/components/site/lesson-video-player";
import { LessonActionsBar } from "@/components/site/lesson-actions-bar";
import type { LearnPageData } from "@/lib/queries";

function formatTimestamp(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function LearningPlayer({ data }: { data: LearnPageData }) {
  const { course, module: mod, lesson, curriculum, prevLessonId, nextLessonId } = data;
  const currentItem = curriculum.find((c) => c.lessonId === lesson.id);
  const showResumeHint =
    !currentItem?.completed && lesson.lastPositionSeconds !== null && lesson.lastPositionSeconds > 5;
  const [cinema, setCinema] = useState(false);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-gutter flex flex-col gap-gutter">
        {/* Header */}
        <header className="flex justify-between items-center w-full pb-2">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {mod.title}: {course.title}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{lesson.title}</p>
            {showResumeHint && (
              <p className="font-label-sm text-label-sm text-primary mt-1 flex items-center gap-1">
                <MaterialIcon name="history" className="text-[16px]" />
                Đang xem tiếp từ {formatTimestamp(lesson.lastPositionSeconds ?? 0)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCinema((v) => !v)}
              aria-pressed={cinema}
              aria-label={cinema ? "Tắt chế độ rạp chiếu phim" : "Bật chế độ rạp chiếu phim"}
              title={cinema ? "Tắt chế độ rạp chiếu phim" : "Chế độ rạp chiếu phim"}
              className={
                cinema
                  ? "bg-primary/10 border-[1.5px] border-primary text-primary px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                  : "bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
              }
            >
              <MaterialIcon name="theaters" filled={cinema} className="text-[18px]" />
            </button>
            {prevLessonId && (
              <Link
                href={`/learn/${prevLessonId}`}
                aria-label="Bài học trước"
                className="bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg font-label-md text-label-md hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
              >
                <MaterialIcon name="arrow_back" className="text-[18px]" />
              </Link>
            )}
            {nextLessonId && (
              <Link
                href={`/learn/${nextLessonId}`}
                aria-label="Bài học tiếp theo"
                className="bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg font-label-md text-label-md hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
              >
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </Link>
            )}
            <Link
              href={`/courses/${course.slug}`}
              className="bg-transparent border-[1.5px] border-primary text-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary/10 transition-colors flex items-center gap-1"
            >
              <MaterialIcon name="close" filled className="text-[18px]" />
              Thoát
            </Link>
          </div>
        </header>

        {/* Hàng 1: Video (+ AI Tutor bên cạnh khi không ở chế độ rạp chiếu phim) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div
            className={
              cinema
                ? "bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl overflow-hidden md:col-span-12 relative flex flex-col min-h-[420px] md:min-h-[640px]"
                : "bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl overflow-hidden md:col-span-8 lg:col-span-9 relative flex flex-col min-h-[400px] md:min-h-[500px]"
            }
          >
            <LessonVideoPlayer
              lessonId={lesson.id}
              videoAssetId={lesson.videoAssetId}
              youtubeUrl={lesson.youtubeUrl}
              title={lesson.title}
              initialPosition={lesson.lastPositionSeconds}
            />
          </div>

          {!cinema && <AiTutorPanel lessonId={lesson.id} compact={false} />}
        </div>

        {/* Thanh hành động — luôn ngay dưới video, giống YouTube */}
        <div className="px-1">
          <LessonActionsBar
            lessonId={lesson.id}
            helpfulCount={lesson.helpfulCount}
            notHelpfulCount={lesson.notHelpfulCount}
            userReaction={lesson.userReaction}
            saved={lesson.saved}
          />
        </div>

        {/* Hàng 2: AI Tutor (khi ở chế độ rạp chiếu phim) + Nội dung khoá học */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter flex-1">
          {cinema && <AiTutorPanel lessonId={lesson.id} compact />}

          <div
            className={
              cinema
                ? "bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl p-6 flex flex-col md:col-span-6 h-[300px]"
                : "bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl p-6 flex flex-col md:col-span-12 h-[300px]"
            }
          >
            <h3 className="font-headline-md text-headline-md text-on-surface text-[20px] mb-4">Nội dung khoá học</h3>
            <div className="overflow-y-auto pr-2 flex flex-col gap-2">
              {curriculum.map((item) => {
                const isActive = item.lessonId === lesson.id;
                return (
                  <Link
                    key={item.lessonId}
                    href={`/learn/${item.lessonId}`}
                    className={
                      isActive
                        ? "flex items-center gap-4 p-3 rounded-lg border border-primary bg-primary/5"
                        : "flex items-center gap-4 p-3 rounded-lg bg-surface-container-high/50 hover:bg-surface-container-high transition-colors"
                    }
                  >
                    <MaterialIcon
                      name={isActive ? "play_circle" : item.completed ? "check_circle" : "radio_button_unchecked"}
                      filled={isActive || item.completed}
                      className={isActive ? "text-primary animate-pulse" : item.completed ? "text-secondary" : "text-on-surface-variant"}
                    />
                    <div className="flex-1">
                      <p className={isActive ? "font-label-md text-label-md text-primary" : "font-label-md text-label-md text-on-surface"}>
                        {item.title}
                      </p>
                      <p className={isActive ? "font-label-sm text-label-sm text-primary/80" : "font-label-sm text-label-sm text-on-surface-variant"}>
                        {item.moduleTitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
