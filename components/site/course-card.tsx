import Link from "next/link";
import { MaterialIcon } from "@/components/site/material-icon";
import type { CourseCardData } from "@/lib/queries";

export function formatPrice(price: string | null) {
  if (!price || Number(price) === 0) return "Miễn phí";
  return `${Number(price).toLocaleString("vi-VN")}đ`;
}

export function CourseCard({ course, size }: { course: CourseCardData; size: "hero" | "compact" }) {
  const isHero = size === "hero";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={
        isHero
          ? "h-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden relative group flex flex-col justify-end p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(26,35,126,0.1)]"
          : "h-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden relative group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)] min-h-[240px]"
      }
    >
      {course.thumbnailUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url('${course.thumbnailUrl}')` }}
          />
          {isHero && <div className="absolute inset-0 bg-gradient-to-t from-on-surface/95 via-on-surface/50 to-transparent" />}
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent" />
      )}

      {isHero ? (
        <div className="relative z-10 flex flex-col gap-4 max-w-lg">
          <div className="flex items-center gap-2">
            {course.category && (
              <span className="bg-surface/90 text-primary font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
                {course.category}
              </span>
            )}
            <span className="bg-surface/70 backdrop-blur-sm text-surface-container-lowest font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1">
              <MaterialIcon name="group" className="text-[14px] text-secondary" /> {course.enrollmentCount} học viên
            </span>
          </div>
          <h2 className="font-display text-headline-lg-mobile md:text-headline-lg text-surface font-bold">
            {course.title}
          </h2>
          {course.description && (
            <p className="font-body-md text-body-md text-surface/80 line-clamp-2">{course.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg inline-flex items-center gap-2 group-hover:bg-primary/90 transition-colors">
              Xem khoá học <MaterialIcon name="arrow_forward" className="text-[18px]" />
            </span>
            <span className="font-label-md text-label-md text-surface/90">{formatPrice(course.price)}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-auto relative z-10">
            {course.level && (
              <span className="bg-secondary/10 text-secondary border border-secondary/20 font-label-sm text-label-sm px-2 py-1 rounded">
                {course.level}
              </span>
            )}
            <MaterialIcon name="bookmark_border" className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>
          <div className="relative z-10 mt-auto">
            {course.category && (
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">{course.category}</span>
            )}
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2 mt-1 group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
            <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
              <span className="flex items-center gap-1">
                <MaterialIcon name="group" className="text-[16px]" /> {course.enrollmentCount} học viên
              </span>
              <span>{formatPrice(course.price)}</span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
