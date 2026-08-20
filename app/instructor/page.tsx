import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";
import { formatPrice } from "@/components/site/course-card";
import { getCurrentAppUser } from "@/lib/auth";
import { getInstructorCourses } from "@/lib/queries";
import { createCourse, generateCourseWithAI, togglePublish } from "./actions";

// AI generate course đo thật ~45-50s (Claude Opus 5, effort thấp) — nâng trần thời gian Server
// Action trên page này để không bị cắt giữa chừng khi deploy serverless.
export const maxDuration = 60;

export default async function InstructorPage() {
  const appUser = await getCurrentAppUser();
  if (!appUser) return null; // layout đã guard, chỉ để TS an tâm

  const courses = await getInstructorCourses(appUser.id);
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const totalRevenue = courses.reduce((sum, c) => sum + c.enrollmentCount * Number(c.price ?? 0), 0);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="font-display text-headline-lg text-primary mb-2">Giảng viên</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Quản lý khoá học của bạn.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Khoá học</span>
            <span className="block font-headline-lg text-headline-lg text-primary">{courses.length}</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Học viên đã đăng ký</span>
            <span className="block font-headline-lg text-headline-lg text-primary">{totalEnrollments}</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Doanh thu (ước tính)</span>
            <span className="block font-headline-lg text-headline-lg text-primary">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {/* Create course */}
        <form action={createCourse} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Tên khoá học mới</label>
            <input
              name="title"
              required
              maxLength={255}
              placeholder="VD: Nhập môn React"
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Tạo khoá học
          </button>
        </form>

        {/* Create course with AI */}
        <form
          action={generateCourseWithAI}
          className="bg-surface-container-lowest border border-dashed border-primary/40 rounded-xl p-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
        >
          <div className="flex-1">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1">
              <MaterialIcon name="auto_awesome" className="text-[16px] text-primary" /> Tạo khoá học bằng AI
            </label>
            <input
              name="topic"
              required
              maxLength={200}
              placeholder="VD: Nhập môn TypeScript cho người mới"
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              AI tự sinh mô tả, danh mục, các chương và nội dung bài học từ chủ đề bạn nhập (mất khoảng 30-60 giây).
              Video cho từng bài học cũng do AI gợi ý từ YouTube — vào sửa khoá học sau khi tạo.
            </p>
          </div>
          <button
            type="submit"
            className="px-6 py-2 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap flex items-center gap-1 justify-center"
          >
            <MaterialIcon name="auto_awesome" className="text-[16px]" /> Tạo bằng AI
          </button>
        </form>

        {/* Course list */}
        {courses.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-12">
            Bạn chưa có khoá học nào. Tạo khoá học đầu tiên ở trên.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-label-md text-label-md text-on-surface">{course.title}</h3>
                    <span
                      className={
                        course.published
                          ? "px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm"
                          : "px-2 py-0.5 rounded-full bg-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm"
                      }
                    >
                      {course.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {course.moduleCount} chương • {course.lessonCount} bài học • {course.enrollmentCount} học viên •{" "}
                    {formatPrice(course.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/instructor/courses/${course.id}`}
                    className="px-4 py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1"
                  >
                    <MaterialIcon name="edit" className="text-[16px]" /> Sửa
                  </Link>
                  <form action={togglePublish.bind(null, course.id)}>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      {course.published ? "Gỡ xuất bản" : "Xuất bản"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
