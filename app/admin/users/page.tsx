import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { AdminNav } from "@/components/site/admin-nav";
import { getAllUsersAdmin } from "@/lib/queries";
import { toggleUserStatus, updateUserRole } from "../actions";

const ROLES: { value: string; label: string }[] = [
  { value: "student", label: "Học viên" },
  { value: "instructor", label: "Giảng viên" },
  { value: "admin", label: "Quản trị viên" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 20;

  const { users, total } = await getAllUsersAdmin(search, page, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <h1 className="font-display text-headline-lg text-primary">Quản trị</h1>
        <AdminNav active="users" />

        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={search}
            placeholder="Tìm theo tên hoặc email..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button type="submit" className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors">
            Tìm
          </button>
        </form>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant font-label-sm text-label-sm">
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="p-3 font-label-md text-label-md text-on-surface">{u.name}</td>
                  <td className="p-3 text-on-surface-variant">{u.email}</td>
                  <td className="p-3">
                    <form action={updateUserRole.bind(null, u.id)} className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="bg-surface border border-outline-variant rounded px-2 py-1 text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-primary hover:underline font-label-sm text-label-sm">
                        Lưu
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        u.status === "banned"
                          ? "px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm"
                          : "px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm"
                      }
                    >
                      {u.status === "banned" ? "Đã khoá" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="p-3">
                    <form action={toggleUserStatus.bind(null, u.id)}>
                      <button type="submit" className="text-on-surface-variant hover:text-error font-label-sm text-label-sm">
                        {u.status === "banned" ? "Mở khoá" : "Khoá tài khoản"}
                      </button>
                    </form>
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
                href={`/admin/users?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(p) })}`}
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
