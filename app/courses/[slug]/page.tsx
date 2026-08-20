import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";
import { formatPrice, levelLabel } from "@/components/site/course-card";
import { getCourseBySlug, getEnrollmentStatus } from "@/lib/queries";
import { getCurrentAppUser } from "@/lib/auth";
import { enrollFree, payWithVnpay } from "./actions";

function formatDuration(totalMinutes: number) {
  if (totalMinutes === 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const appUser = await getCurrentAppUser();
  const enrollmentStatus = appUser ? await getEnrollmentStatus(appUser.id, course.id) : null;

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalMinutes = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.duration ?? 0), 0),
    0,
  );
  const durationLabel = formatDuration(totalMinutes);
  const firstLessonId = course.modules[0]?.lessons[0]?.id;

  const price = course.price ? Number(course.price) : 0;
  const originalPrice = course.originalPrice ? Number(course.originalPrice) : null;
  const discountPercent =
    originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;
  const isFree = price === 0;

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <SiteHeader active="browse" showSearch={false} />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col lg:flex-row gap-gutter relative">
        {/* Left Column */}
        <div className="flex-1 max-w-[720px] lg:max-w-none lg:w-2/3 flex flex-col gap-stack-lg">
          <section className="flex flex-col gap-stack-md">
            <div className="flex gap-2 flex-wrap mb-2">
              {course.category && (
                <span className="bg-secondary-container/20 text-secondary font-label-sm text-label-sm px-3 py-1 rounded-full">
                  {course.category}
                </span>
              )}
              {course.level && (
                <span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-3 py-1 rounded-full">
                  {levelLabel(course.level)}
                </span>
              )}
            </div>
            <h1 className="font-display text-display text-on-background">{course.title}</h1>
            {course.description && (
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {course.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-stack-md mt-4 text-on-surface-variant font-body-md text-body-md">
              <div className="flex items-center gap-2">
                <MaterialIcon name="group" className="text-primary" /> {course.enrollmentCount} học viên
              </div>
              {durationLabel && (
                <div className="flex items-center gap-2">
                  <MaterialIcon name="schedule" className="text-primary" /> {durationLabel}
                </div>
              )}
              <div className="flex items-center gap-2">
                <MaterialIcon name="menu_book" className="text-primary" /> {totalLessons} bài học
              </div>
            </div>
          </section>

          {course.thumbnailUrl && (
            <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-sm border border-surface-variant">
              <div
                className="bg-cover bg-center w-full h-full absolute inset-0"
                style={{ backgroundImage: `url('${course.thumbnailUrl}')` }}
              />
            </div>
          )}

          <section className="flex flex-col gap-stack-md mt-stack-md">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              Nội dung khoá học
            </h2>
            {course.modules.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Giảng viên đang cập nhật nội dung khoá học.
              </p>
            ) : (
              <div className="flex flex-col gap-stack-sm">
                {course.modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="border border-surface-variant rounded-xl overflow-hidden bg-surface-container-lowest transition-all hover:border-outline-variant group"
                  >
                    <details className="w-full" open={idx === 0}>
                      <summary className="w-full flex items-center justify-between p-stack-md cursor-pointer list-none bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-stack-md">
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-label-md text-label-md">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <h3 className="font-headline-md text-headline-md text-on-background text-[20px] leading-tight">
                            {mod.title}
                          </h3>
                        </div>
                        <MaterialIcon
                          name="expand_more"
                          className="text-on-surface-variant group-open:rotate-180 transition-transform"
                        />
                      </summary>
                      <div className="px-stack-md pb-stack-md pt-2 border-t border-surface-variant flex flex-col gap-2 bg-surface-container-lowest">
                        {mod.lessons.length === 0 ? (
                          <p className="py-2 font-body-md text-body-md text-on-surface-variant">Chưa có bài học.</p>
                        ) : (
                          mod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between py-2 hover:bg-surface-container-low px-2 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-3 font-body-md text-body-md text-on-surface">
                                <MaterialIcon name="play_circle" className="text-on-surface-variant text-sm" />
                                {lesson.title}
                              </div>
                              {lesson.duration != null && (
                                <span className="text-on-surface-variant font-label-sm text-label-sm">
                                  {lesson.duration} phút
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-stack-md mt-stack-md bg-surface-container-low p-stack-lg rounded-2xl border border-surface-variant">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              Giảng viên
            </h2>
            <div className="flex items-center gap-stack-md">
              {course.instructorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={course.instructorName}
                  className="w-16 h-16 rounded-full object-cover border-4 border-surface shadow-sm"
                  src={course.instructorAvatarUrl}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center border-4 border-surface shadow-sm">
                  <MaterialIcon name="person" className="text-primary text-2xl" />
                </div>
              )}
              <h3 className="font-headline-md text-headline-md text-on-background">{course.instructorName}</h3>
            </div>
          </section>
        </div>

        {/* Sticky Sidebar */}
        <div className="w-full lg:w-1/3 relative mt-stack-lg lg:mt-0">
          <div className="sticky top-24 glass-card rounded-2xl p-stack-md flex flex-col gap-stack-md shadow-[0_4px_20px_rgba(26,35,126,0.05)] border border-outline-variant">
            <div className="text-center pb-stack-sm border-b border-surface-variant">
              {originalPrice && discountPercent && (
                <p className="font-label-md text-label-md text-on-surface-variant line-through">
                  {formatPrice(course.originalPrice)}
                </p>
              )}
              <div className="font-display text-display text-primary font-bold">{formatPrice(course.price)}</div>
              {discountPercent && (
                <p className="font-label-sm text-label-sm text-secondary mt-1 flex items-center justify-center gap-1">
                  <MaterialIcon name="local_offer" className="text-[14px]" /> Giảm {discountPercent}%
                </p>
              )}
            </div>

            {enrollmentStatus === "paid" ? (
              <Link
                href={firstLessonId ? `/learn/${firstLessonId}` : "#"}
                className="w-full text-center bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md text-lg"
              >
                Vào học
              </Link>
            ) : enrollmentStatus === "pending" ? (
              <div className="w-full text-center bg-surface-container-high text-on-surface-variant font-label-md text-label-md py-4 rounded-xl">
                Thanh toán đang chờ xử lý
              </div>
            ) : !appUser ? (
              <Link
                href="/sign-up"
                className="w-full text-center bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md text-lg"
              >
                Đăng nhập để đăng ký
              </Link>
            ) : isFree ? (
              <form action={enrollFree.bind(null, course.id)}>
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md text-lg"
                >
                  Đăng ký miễn phí
                </button>
              </form>
            ) : (
              <form action={payWithVnpay.bind(null, course.id)}>
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-md text-lg flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="lock" className="text-[18px]" />
                  Thanh toán qua VNPay
                </button>
              </form>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <h4 className="font-label-md text-label-md text-on-background font-bold mb-1">Khoá học bao gồm:</h4>
              <div className="flex items-center gap-3 font-body-md text-body-md text-on-surface-variant">
                <MaterialIcon name="ondemand_video" className="text-primary" /> {totalLessons} bài học
                {durationLabel ? ` · ${durationLabel}` : ""}
              </div>
              <div className="flex items-center gap-3 font-body-md text-body-md text-on-surface-variant">
                <MaterialIcon name="all_inclusive" className="text-primary" /> Truy cập trọn đời
              </div>
              <div className="flex items-center gap-3 font-body-md text-body-md text-on-surface-variant">
                <MaterialIcon name="workspace_premium" className="text-primary" /> Chứng chỉ khi hoàn thành
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
