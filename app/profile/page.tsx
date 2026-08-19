import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";
import { getCurrentAppUser } from "@/lib/auth";
import { getEnrolledCourses, getHoursSpent, getRecentActivity, getUserCertificates } from "@/lib/queries";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default async function ProfilePage() {
  const appUser = await getCurrentAppUser();
  if (!appUser) redirect("/sign-in");

  const [enrolledCourses, certificates, hoursSpent, recentActivity] = await Promise.all([
    getEnrolledCourses(appUser.id),
    getUserCertificates(appUser.id),
    getHoursSpent(appUser.id),
    getRecentActivity(appUser.id, 5),
  ]);

  const completedCoursesCount = enrolledCourses.filter(
    (c) => c.totalLessons > 0 && c.completedLessons === c.totalLessons,
  ).length;

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        {/* Profile Header */}
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6 md:p-8 mb-stack-lg flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 shrink-0">
            {appUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-full h-full object-cover rounded-full border-4 border-surface shadow-sm"
                alt={appUser.name}
                src={appUser.avatarUrl}
              />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-surface shadow-sm bg-primary-container flex items-center justify-center">
                <MaterialIcon name="person" className="text-primary text-5xl" />
              </div>
            )}
          </div>
          <div className="relative z-10 flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
                  {appUser.name}
                </h1>
              </div>
              <Link
                href="/settings"
                className="mt-4 md:mt-0 font-label-md text-label-md border border-outline-variant text-on-surface hover:bg-surface-container-high px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto md:mx-0"
              >
                <MaterialIcon name="settings" className="text-sm" />
                Sửa hồ sơ
              </Link>
            </div>
            {appUser.bio && (
              <p className="font-body-md text-body-md text-on-surface mb-6 max-w-2xl leading-relaxed">{appUser.bio}</p>
            )}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Khoá học hoàn thành</span>
                <span className="block font-headline-md text-headline-md text-primary">{completedCoursesCount}</span>
              </div>
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Chứng chỉ</span>
                <span className="block font-headline-md text-headline-md text-primary">{certificates.length}</span>
              </div>
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Giờ học</span>
                <span className="block font-headline-md text-headline-md text-primary">{hoursSpent}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Certificates */}
          <section className="lg:col-span-12 bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Chứng chỉ đã đạt</h2>
            {certificates.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Hoàn thành 100% một khoá học để nhận chứng chỉ đầu tiên.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-surface rounded-lg border border-outline-variant p-4 flex flex-col hover:shadow-md transition-shadow"
                  >
                    <div className="w-full h-32 bg-surface-container-high rounded-md mb-4 overflow-hidden relative flex items-center justify-center">
                      <MaterialIcon name="workspace_premium" className="text-primary text-4xl" />
                    </div>
                    <h3 className="font-label-md text-label-md text-on-surface mb-1">{cert.courseTitle}</h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
                      Cấp ngày: {formatDate(cert.issuedAt)}
                    </p>
                    <div className="mt-auto">
                      <a
                        href={`/api/certificates/${cert.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full font-label-md text-label-md border border-outline-variant text-on-surface hover:bg-surface-container-high px-3 py-1.5 rounded transition-colors text-center block"
                      >
                        Tải chứng chỉ
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Learning History */}
          <section className="lg:col-span-12 bg-surface-container-low border border-outline-variant rounded-xl p-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Hoạt động gần đây</h2>
            {recentActivity.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Chưa có hoạt động nào.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={item.lessonId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center shrink-0">
                        <MaterialIcon name="check_circle" filled className="text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface">{item.lessonTitle}</h3>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{item.courseTitle}</p>
                      </div>
                    </div>
                    {item.completedAt && (
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-2 sm:mt-0">
                        {timeAgo(item.completedAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
