import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";
import { VideoUploadButton } from "@/components/site/video-upload-button";
import { getCurrentAppUser } from "@/lib/auth";
import { getOwnedCourse } from "@/lib/instructor";
import { getInstructorCourseDetail } from "@/lib/queries";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  moveLesson,
  moveModule,
  togglePublish,
  updateCourse,
  updateLesson,
  updateModuleTitle,
} from "../../actions";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: courseIdParam } = await params;
  const courseId = Number(courseIdParam);
  if (!courseId) notFound();

  const appUser = await getCurrentAppUser();
  if (!appUser) notFound();

  const course = await getOwnedCourse(appUser.id, appUser.role === "admin", courseId);
  if (!course) notFound();

  const modules = await getInstructorCourseDetail(courseId);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <Link href="/instructor" className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 w-fit">
          <MaterialIcon name="arrow_back" className="text-[18px]" /> Danh sách khoá học
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="font-display text-headline-lg text-primary">{course.title}</h1>
          <form action={togglePublish.bind(null, course.id)}>
            <button
              type="submit"
              className={
                course.published
                  ? "px-4 py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-colors"
                  : "px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
              }
            >
              {course.published ? "Gỡ xuất bản" : "Xuất bản khoá học"}
            </button>
          </form>
        </div>

        {/* Course info */}
        <form
          action={updateCourse.bind(null, course.id)}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 flex flex-col gap-3"
        >
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Thông tin khoá học</h2>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Tên khoá học</label>
            <input
              name="title"
              required
              maxLength={255}
              defaultValue={course.title}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Mô tả</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={course.description ?? ""}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Danh mục</label>
              <input
                name="category"
                defaultValue={course.category ?? ""}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Trình độ</label>
              <input
                name="level"
                defaultValue={course.level ?? ""}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Giá (đ, 0 = miễn phí)</label>
              <input
                name="price"
                type="number"
                min={0}
                step="1000"
                defaultValue={course.price ?? "0"}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Giá gốc (không bắt buộc)</label>
              <input
                name="originalPrice"
                type="number"
                min={0}
                step="1000"
                defaultValue={course.originalPrice ?? ""}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">URL ảnh thumbnail</label>
            <input
              name="thumbnailUrl"
              defaultValue={course.thumbnailUrl ?? ""}
              placeholder="https://..."
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="self-end px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
          >
            Lưu thông tin
          </button>
        </form>

        {/* Modules */}
        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Nội dung khoá học</h2>
          {modules.map((mod, modIdx) => (
            <div key={mod.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <form action={updateModuleTitle.bind(null, mod.id)} className="flex-1 flex items-center gap-2">
                  <input
                    name="title"
                    required
                    defaultValue={mod.title}
                    className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-label-md focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="text-primary hover:underline font-label-sm text-label-sm">
                    Lưu
                  </button>
                </form>
                <div className="flex items-center gap-1 shrink-0">
                  <form action={moveModule.bind(null, mod.id, "up")}>
                    <button type="submit" disabled={modIdx === 0} className="text-on-surface-variant hover:text-primary disabled:opacity-30">
                      <MaterialIcon name="arrow_upward" className="text-[18px]" />
                    </button>
                  </form>
                  <form action={moveModule.bind(null, mod.id, "down")}>
                    <button
                      type="submit"
                      disabled={modIdx === modules.length - 1}
                      className="text-on-surface-variant hover:text-primary disabled:opacity-30"
                    >
                      <MaterialIcon name="arrow_downward" className="text-[18px]" />
                    </button>
                  </form>
                  <form action={deleteModule.bind(null, mod.id)}>
                    <button type="submit" className="text-on-surface-variant hover:text-error">
                      <MaterialIcon name="delete" className="text-[18px]" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Lessons */}
              <div className="flex flex-col gap-2 pl-2 border-l-2 border-outline-variant/30">
                {mod.lessons.map((lesson, lessonIdx) => (
                  <details key={lesson.id} className="bg-surface rounded-lg border border-outline-variant/30">
                    <summary className="cursor-pointer list-none p-3 flex items-center gap-2">
                      <MaterialIcon
                        name={lesson.videoAssetId ? "videocam" : "videocam_off"}
                        className={lesson.videoAssetId ? "text-secondary text-[18px]" : "text-on-surface-variant text-[18px]"}
                      />
                      <span className="font-label-md text-label-md text-on-surface truncate">{lesson.title}</span>
                    </summary>
                    <div className="p-3 pt-0 flex flex-col gap-3">
                      <div className="flex items-center justify-end gap-1 -mt-1">
                        <form action={moveLesson.bind(null, lesson.id, "up")}>
                          <button type="submit" disabled={lessonIdx === 0} className="text-on-surface-variant hover:text-primary disabled:opacity-30">
                            <MaterialIcon name="arrow_upward" className="text-[16px]" />
                          </button>
                        </form>
                        <form action={moveLesson.bind(null, lesson.id, "down")}>
                          <button
                            type="submit"
                            disabled={lessonIdx === mod.lessons.length - 1}
                            className="text-on-surface-variant hover:text-primary disabled:opacity-30"
                          >
                            <MaterialIcon name="arrow_downward" className="text-[16px]" />
                          </button>
                        </form>
                        <form action={deleteLesson.bind(null, lesson.id)}>
                          <button type="submit" className="text-on-surface-variant hover:text-error">
                            <MaterialIcon name="delete" className="text-[16px]" />
                          </button>
                        </form>
                      </div>
                      <form action={updateLesson.bind(null, lesson.id)} className="flex flex-col gap-2">
                        <input
                          name="title"
                          required
                          defaultValue={lesson.title}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                        />
                        <textarea
                          name="content"
                          rows={2}
                          placeholder="Nội dung / transcript bài học (AI Tutor sẽ dùng để trả lời câu hỏi)"
                          defaultValue={lesson.content ?? ""}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary resize-y"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            name="duration"
                            type="number"
                            min={0}
                            placeholder="Thời lượng (phút)"
                            defaultValue={lesson.duration ?? ""}
                            className="w-32 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                          />
                          <button type="submit" className="text-primary hover:underline font-label-sm text-label-sm">
                            Lưu bài học
                          </button>
                        </div>
                      </form>
                      <VideoUploadButton lessonId={lesson.id} hasVideo={Boolean(lesson.videoAssetId)} />
                    </div>
                  </details>
                ))}

                {/* Add lesson */}
                <form action={createLesson.bind(null, mod.id)} className="flex items-center gap-2 p-2">
                  <input
                    name="title"
                    required
                    placeholder="Tên bài học mới"
                    className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="text-primary hover:underline font-label-sm text-label-sm whitespace-nowrap">
                    + Thêm bài học
                  </button>
                </form>
              </div>
            </div>
          ))}

          {/* Add module */}
          <form action={createModule.bind(null, course.id)} className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-4 flex items-center gap-2">
            <input
              name="title"
              required
              placeholder="Tên module mới"
              className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button type="submit" className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
              + Thêm module
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
