import Link from "next/link";

const links = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/courses", label: "Khoá học" },
];

export function AdminNav({ active }: { active: "overview" | "users" | "courses" }) {
  const activeHref = active === "overview" ? "/admin" : active === "users" ? "/admin/users" : "/admin/courses";

  return (
    <nav className="flex gap-2 border-b border-outline-variant/30 pb-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            link.href === activeHref
              ? "px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md"
              : "px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md transition-colors"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
