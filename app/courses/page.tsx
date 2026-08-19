import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";
import { CourseCard } from "@/components/site/course-card";
import { getCategories, getCourseList, getLevels, type CourseListSort } from "@/lib/queries";

const SORT_OPTIONS: { value: CourseListSort; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
];

type SearchParams = { category?: string; level?: string; sort?: string; page?: string; q?: string };

function buildHref(current: SearchParams, changes: Partial<SearchParams>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };

  if (merged.q) params.set("q", merged.q);
  if (merged.category) params.set("category", merged.category);
  if (merged.level) params.set("level", merged.level);
  if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
  if (merged.page && merged.page !== "1") params.set("page", merged.page);

  const qs = params.toString();
  return qs ? `/courses?${qs}` : "/courses";
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "bg-primary text-on-primary font-label-sm text-label-sm px-4 py-2 rounded-full whitespace-nowrap"
          : "bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-4 py-2 rounded-full whitespace-nowrap hover:bg-surface-container-highest transition-colors"
      }
    >
      {label}
    </Link>
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const sort: CourseListSort =
    sp.sort === "popular" || sp.sort === "price_asc" || sp.sort === "price_desc" ? sp.sort : "newest";
  const page = Math.max(1, Number(sp.page) || 1);

  const [categories, levels, { courses, total, pageSize }] = await Promise.all([
    getCategories(),
    getLevels(),
    getCourseList({ category: sp.category, level: sp.level, search: sp.q, sort, page }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <SiteHeader active="browse" />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface mb-2">Khám phá khoá học</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {sp.q ? (
              <>
                {total} kết quả cho &quot;{sp.q}&quot;
              </>
            ) : (
              <>{total} khoá học đang mở đăng ký</>
            )}
          </p>
        </div>

        {/* Search */}
        <form action="/courses" method="GET" className="relative">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          {sp.level && <input type="hidden" name="level" value={sp.level} />}
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          <MaterialIcon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none"
          />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Tìm khoá học, chủ đề..."
            className="w-full max-w-md pl-11 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <FilterChip label="Tất cả danh mục" href={buildHref(sp, { category: undefined, page: undefined })} active={!sp.category} />
              {categories.map((c) => (
                <FilterChip key={c} label={c} href={buildHref(sp, { category: c, page: undefined })} active={sp.category === c} />
              ))}
            </div>
          )}
          {levels.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <FilterChip label="Mọi trình độ" href={buildHref(sp, { level: undefined, page: undefined })} active={!sp.level} />
              {levels.map((l) => (
                <FilterChip key={l} label={l} href={buildHref(sp, { level: l, page: undefined })} active={sp.level === l} />
              ))}
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SORT_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                href={buildHref(sp, { sort: opt.value, page: undefined })}
                active={sort === opt.value}
              />
            ))}
          </div>
        </div>

        {/* Results */}
        {courses.length === 0 ? (
          <div className="border border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center gap-3 py-24 text-center">
            <MaterialIcon name="search_off" className="text-4xl text-on-surface-variant" />
            <h2 className="font-headline-md text-headline-md text-on-surface">Không tìm thấy khoá học nào</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              Thử bỏ bớt bộ lọc hoặc quay lại sau khi có thêm khoá học mới.
            </p>
            {(sp.category || sp.level || sp.q) && (
              <Link
                href="/courses"
                className="px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
              >
                Xoá bộ lọc
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} size="compact" />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-stack-md">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildHref(sp, { page: String(p) })}
                className={
                  p === page
                    ? "w-10 h-10 flex items-center justify-center rounded-full bg-primary text-on-primary font-label-md text-label-md"
                    : "w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors"
                }
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
