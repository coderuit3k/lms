import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { MaterialIcon } from "@/components/site/material-icon";
import { getCurrentAppUser } from "@/lib/auth";
import { canManageCourses } from "@/lib/instructor";
import { getEnrolledCourses, getHoursSpent, type EnrolledCourse } from "@/lib/queries";
import { becomeInstructor } from "@/app/instructor/actions";

const sidebarTabs = [
  { icon: "dashboard", label: "Overview", href: "/dashboard" },
  { icon: "folder_open", label: "Resources", href: "/resources" },
  { icon: "forum", label: "Community", href: "/community" },
];

function progressOf(course: EnrolledCourse) {
  if (course.totalLessons === 0) return 0;
  return Math.round((course.completedLessons / course.totalLessons) * 100);
}

function EmptyState() {
  return (
    <div className="md:col-span-12 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/50 flex flex-col items-center justify-center gap-4 py-24 text-center">
      <MaterialIcon name="school" className="text-4xl text-on-surface-variant" />
      <h2 className="font-headline-md text-headline-md text-on-surface">Bạn chưa đăng ký khoá học nào</h2>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        Khám phá thư viện khoá học và bắt đầu lộ trình học của riêng bạn.
      </p>
      <Link
        href="/courses"
        className="px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
      >
        Khám phá khoá học
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const appUser = await getCurrentAppUser();
  const enrolledCourses = appUser ? await getEnrolledCourses(appUser.id) : [];
  const hoursSpent = appUser ? await getHoursSpent(appUser.id) : 0;

  const completedCoursesCount = enrolledCourses.filter(
    (c) => c.totalLessons > 0 && c.completedLessons === c.totalLessons,
  ).length;

  const activeCourse =
    enrolledCourses.find((c) => c.totalLessons === 0 || c.completedLessons < c.totalLessons) ?? enrolledCourses[0];

  const displayName = appUser?.name?.split(" ")[0] ?? "bạn";

  return (
    <div className="bg-background text-on-background h-screen font-body-md text-body-md flex flex-col overflow-hidden">
      <SiteHeader active="dashboard" />
      <div className="flex flex-1 overflow-hidden">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col h-full w-64 bg-surface-container-low border-r border-outline-variant/30 flex-shrink-0">
          <div className="flex flex-col h-full py-stack-md px-4 gap-stack-sm">
            <div className="flex items-center gap-4 mb-6 px-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary-container shrink-0 flex items-center justify-center">
                {activeCourse?.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Course thumbnail" className="w-full h-full object-cover" src={activeCourse.thumbnailUrl} />
                ) : (
                  <MaterialIcon name="school" className="text-primary" />
                )}
              </div>
              <div>
                <h2 className="font-display text-headline-md text-primary leading-tight">Scholaris</h2>
                <p className="font-body-md text-label-sm text-on-surface-variant mt-1 truncate">
                  {activeCourse ? activeCourse.title : "Chưa có khoá học"}
                </p>
              </div>
            </div>
            {activeCourse && (
              <Link
                href={`/courses/${activeCourse.slug}`}
                className="mb-2 w-full text-center bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <MaterialIcon name="play_arrow" filled className="text-[18px]" />
                Tiếp tục học
              </Link>
            )}
            <nav className="flex-1 flex flex-col gap-2 font-label-md text-label-md">
              {sidebarTabs.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={
                    tab.label === "Overview"
                      ? "flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 transition-transform"
                      : "flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg transition-transform"
                  }
                >
                  <MaterialIcon name={tab.icon} filled={tab.label === "Overview"} />
                  {tab.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/30 pt-4">
              {appUser && canManageCourses(appUser) ? (
                <Link href="/instructor" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-container-high rounded-lg transition-colors font-label-md text-label-md">
                  <MaterialIcon name="school" />
                  Trang giảng viên
                </Link>
              ) : appUser ? (
                <form action={becomeInstructor}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-container-high rounded-lg transition-colors font-label-md text-label-md text-left"
                  >
                    <MaterialIcon name="school" />
                    Trở thành giảng viên
                  </button>
                </form>
              ) : null}
              <Link href="/settings" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-container-high rounded-lg transition-colors font-label-md text-label-md">
                <MaterialIcon name="settings" />
                Settings
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-margin-mobile md:p-margin-desktop">
          <div className="max-w-container-max mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Welcome */}
            <div className="md:col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-stack-lg border border-outline-variant/30 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 relative z-10">
                Welcome back, {displayName}.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant relative z-10 max-w-lg">
                {activeCourse
                  ? `Bạn đang học ${activeCourse.title}. Tiếp tục nào?`
                  : "Bắt đầu khoá học đầu tiên của bạn ngay hôm nay."}
              </p>
            </div>

            {/* Stat: Hours */}
            <div className="md:col-span-6 lg:col-span-2 bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <MaterialIcon name="schedule" filled className="text-secondary" />
                </div>
              </div>
              <div>
                <div className="font-display text-[40px] leading-none text-on-surface font-bold mb-1">
                  {hoursSpent}
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant">Giờ đã học</div>
              </div>
            </div>

            {/* Stat: Completed courses */}
            <div className="md:col-span-6 lg:col-span-2 bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MaterialIcon name="military_tech" filled className="text-primary" />
                </div>
              </div>
              <div>
                <div className="font-display text-[40px] leading-none text-on-surface font-bold mb-1">
                  {completedCoursesCount}
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant">Khoá học hoàn thành</div>
              </div>
            </div>

            {enrolledCourses.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Continue Learning */}
                {activeCourse && (
                  <Link
                    href={`/courses/${activeCourse.slug}`}
                    className="md:col-span-12 lg:col-span-8 lg:row-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden group relative min-h-[380px] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(26,35,126,0.08)]"
                  >
                    <div className="relative h-48 w-full shrink-0 overflow-hidden bg-surface-container-high">
                      {activeCourse.thumbnailUrl ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                          style={{ backgroundImage: `url('${activeCourse.thumbnailUrl}')` }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent" />
                      <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md border border-outline-variant/30 text-primary font-label-sm text-label-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        Đang học
                      </div>
                    </div>
                    <div className="p-stack-md flex-1 flex flex-col justify-between relative z-10 bg-surface-container-lowest">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">{activeCourse.title}</h3>
                        {activeCourse.description && (
                          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mb-6">
                            {activeCourse.description}
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-label-sm text-on-surface-variant mb-2">
                          <span>Tiến độ</span>
                          <span>{progressOf(activeCourse)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#ECEFF1] rounded-full overflow-hidden mb-6">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${progressOf(activeCourse)}%` }} />
                        </div>
                        <span className="px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg group-hover:bg-primary/90 transition-colors flex items-center gap-2 font-semibold w-fit">
                          Tiếp tục học
                          <MaterialIcon name="arrow_forward" className="text-[18px]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Your Courses */}
                <div className="md:col-span-12 lg:col-span-4 lg:row-span-2 bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/30 flex flex-col h-full">
                  <h3 className="font-headline-md text-headline-md text-on-surface text-[20px] mb-6">Khoá học của bạn</h3>
                  <div className="flex-1 flex flex-col gap-4">
                    {enrolledCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="p-4 rounded-lg bg-surface-container-high border-l-4 border-secondary hover:bg-surface-container-highest transition-colors group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                            {course.title}
                          </h4>
                          <span className="font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded shrink-0">
                            {progressOf(course)}%
                          </span>
                        </div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {course.completedLessons}/{course.totalLessons} bài học
                        </p>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/courses"
                    className="w-full mt-4 py-3 border border-outline-variant text-primary font-label-md text-label-md rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                  >
                    Khám phá thêm khoá học
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
