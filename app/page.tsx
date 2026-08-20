import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";
import { CourseCard } from "@/components/site/course-card";
import { getCategories, getPublishedCourseCount, getTrendingCourses } from "@/lib/queries";

function EmptyState() {
  return (
    <div className="col-span-1 border border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center gap-3 py-24 text-center">
      <MaterialIcon name="school" className="text-4xl text-on-surface-variant" />
      <h2 className="font-headline-md text-headline-md text-on-surface">Chưa có khoá học nào được xuất bản</h2>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        Giảng viên đang chuẩn bị nội dung. Quay lại sau nhé!
      </p>
    </div>
  );
}

export default async function DiscoverPage() {
  const { userId } = await auth();
  const [trending, courseCount, categories] = await Promise.all([
    getTrendingCourses(3),
    getPublishedCourseCount(),
    getCategories(),
  ]);

  const [hero, ...rest] = trending;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <SiteHeader active="browse" />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        {/* Header Text */}
        <div className="text-center md:text-left">
          <h1 className="font-display text-display max-md:text-[36px] max-md:leading-[44px] text-on-surface mb-4 tracking-tight">
            Làm chủ tương lai, <span className="text-primary">từng chương một.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto md:mx-0">
            Khám phá những khoá học chất lượng cao, được tuyển chọn bởi chuyên gia đầu ngành để giúp bạn học sâu và
            hiệu quả.
          </p>
        </div>

        {!hero ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[240px] md:auto-rows-[300px] gap-gutter">
            <div className="col-span-1 md:col-span-8 row-span-1 md:row-span-2">
              <CourseCard course={hero} size="hero" />
            </div>

            {rest[0] && (
              <div className="col-span-1 md:col-span-4 row-span-1">
                <CourseCard course={rest[0]} size="compact" />
              </div>
            )}

            {/* Stats */}
            <div className="col-span-1 md:col-span-2 row-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex flex-col justify-center items-center p-6 text-center group">
              <MaterialIcon name="school" filled className="text-4xl text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-display text-headline-lg text-on-surface font-bold">{courseCount}</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Khoá học</span>
            </div>

            {/* Categories quick link */}
            <Link
              href="/courses"
              className="col-span-1 md:col-span-2 row-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex flex-col justify-center items-center p-6 text-center group cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <MaterialIcon name="grid_view" className="text-on-surface-variant group-hover:text-primary transition-colors" />
              </div>
              <span className="font-label-md text-label-md text-on-surface">
                {categories.length > 0 ? categories.join(" · ") : "Tất cả danh mục"}
              </span>
            </Link>

            {/* Assessment prompt */}
            <div className="col-span-1 md:col-span-8 row-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low to-transparent z-0" />
              <div className="relative z-10 flex w-full justify-between items-center">
                <div>
                  <h3 className="font-display text-headline-md text-on-surface mb-2">Chưa biết bắt đầu từ đâu?</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                    {userId
                      ? "Vào trang học tập để tiếp tục lộ trình học của bạn."
                      : "Tạo tài khoản miễn phí để nhận lộ trình học phù hợp với mục tiêu của bạn."}
                  </p>
                </div>
                <Link
                  href={userId ? "/dashboard" : "/sign-up"}
                  className="hidden md:flex border border-primary text-primary hover:bg-primary/5 font-label-md text-label-md px-6 py-3 rounded-lg transition-all items-center gap-2 flex-shrink-0"
                >
                  {userId ? "Vào trang học tập" : "Bắt đầu ngay"} <MaterialIcon name="east" />
                </Link>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
            </div>

            {rest[1] && (
              <div className="col-span-1 md:col-span-4 row-span-1">
                <CourseCard course={rest[1]} size="compact" />
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
