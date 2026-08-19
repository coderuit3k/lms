import Link from "next/link";
import { MaterialIcon } from "@/components/site/material-icon";
import { AiTutorPanel } from "@/components/site/ai-tutor-panel";
import { LessonVideoPlayer } from "@/components/site/lesson-video-player";
import type { LearnPageData } from "@/lib/queries";

export function LearningPlayer({ data }: { data: LearnPageData }) {
  const { course, module: mod, lesson, curriculum, prevLessonId, nextLessonId } = data;

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
          </div>
          <div className="flex items-center gap-2">
            {prevLessonId && (
              <Link
                href={`/learn/${prevLessonId}`}
                className="bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg font-label-md text-label-md hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
              >
                <MaterialIcon name="arrow_back" className="text-[18px]" />
              </Link>
            )}
            {nextLessonId && (
              <Link
                href={`/learn/${nextLessonId}`}
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

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter flex-1">
          {/* Video Player */}
          <div className="bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl overflow-hidden md:col-span-8 lg:col-span-9 relative flex flex-col min-h-[400px] md:min-h-[500px]">
            <LessonVideoPlayer lessonId={lesson.id} videoAssetId={lesson.videoAssetId} title={lesson.title} />
          </div>

          {/* AI Tutor */}
          <AiTutorPanel lessonId={lesson.id} />

          {/* Curriculum List */}
          <div className="bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] transition-all duration-300 rounded-xl p-6 flex flex-col md:col-span-12 h-[300px]">
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
