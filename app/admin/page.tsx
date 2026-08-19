import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { AdminNav } from "@/components/site/admin-nav";
import { getAdminStats } from "@/lib/queries";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <h1 className="font-display text-headline-lg text-primary">Quản trị</h1>
        <AdminNav active="overview" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Người dùng</span>
            <span className="block font-headline-lg text-headline-lg text-primary">{stats.userCount}</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Khoá học</span>
            <span className="block font-headline-lg text-headline-lg text-primary">{stats.courseCount}</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Đã xuất bản</span>
            <span className="block font-headline-lg text-headline-lg text-primary">{stats.publishedCourseCount}</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Lượt đăng ký (paid)</span>
            <span className="block font-headline-lg text-headline-lg text-primary">{stats.paidEnrollmentCount}</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
            <span className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Doanh thu</span>
            <span className="block font-headline-lg text-headline-lg text-primary">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
