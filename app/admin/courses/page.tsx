import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { AdminNav } from "@/components/site/admin-nav";
import { getAllCoursesAdmin } from "@/lib/queries";
import { forceUnpublishCourse } from "../actions";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 20;

  const { courses, total } = await getAllCoursesAdmin(search, page, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <h1 className="font-display text-headline-lg text-primary">Quản trị</h1>
        <AdminNav active="courses" />

        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={search}
            placeholder="Tìm theo tên khoá học..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button type="submit" className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-all active:scale-[0.97]">
            Tìm
          </button>
        </form>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant font-label-sm text-label-sm">
                <th className="p-3">Khoá học</th>
                <th className="p-3">Giảng viên</th>
                <th className="p-3">Học viên</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="p-3">
                    <Link href={`/courses/${c.slug}`} target="_blank" className="font-label-md text-label-md text-on-surface hover:text-primary">
                      {c.title}
                    </Link>
                  </td>
                  <td className="p-3 text-on-surface-variant">{c.instructorName}</td>
                  <td className="p-3 text-on-surface-variant">{c.enrollmentCount}</td>
                  <td className="p-3">
                    <span
                      className={
                        c.published
                          ? "px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm"
                          : "px-2 py-0.5 rounded-full bg-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm"
                      }
                    >
                      {c.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                  </td>
                  <td className="p-3">
                    {c.published && (
                      <form action={forceUnpublishCourse.bind(null, c.id)}>
                        <button type="submit" className="text-on-surface-variant hover:text-error font-label-sm text-label-sm">
                          Gỡ xuất bản
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/courses?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(p) })}`}
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
