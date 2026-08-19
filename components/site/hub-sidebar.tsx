import Link from "next/link";
import { MaterialIcon } from "@/components/site/material-icon";

export type HubKey = "dashboard" | "courses" | "community" | "resources" | "settings";

const hubLinks: { key: HubKey; icon: string; label: string; href: string }[] = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "courses", icon: "school", label: "My Courses", href: "/dashboard" },
  { key: "community", icon: "biotech", label: "Research", href: "/community" },
  { key: "resources", icon: "library_books", label: "Library", href: "/resources" },
];

export function HubSidebar({ active }: { active: HubKey }) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-surface-container-low border-r border-outline-variant/30 p-4 gap-1">
      <div className="mb-4 px-4 font-label-md text-label-md text-on-surface-variant">Academic Hub</div>
      <nav className="flex-1 flex flex-col gap-2">
        {hubLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={
              active === link.key
                ? "flex items-center gap-4 bg-secondary-container text-on-secondary-container rounded-xl px-4 py-3 font-label-md text-label-md"
                : "flex items-center gap-4 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-xl transition-all font-label-md text-label-md"
            }
          >
            <MaterialIcon name={link.icon} filled={active === link.key} />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant/30">
        <Link
          href="/settings"
          className={
            active === "settings"
              ? "flex items-center gap-4 bg-secondary-container text-on-secondary-container rounded-xl px-4 py-3 font-label-md text-label-md"
              : "flex items-center gap-4 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-xl transition-all font-label-md text-label-md"
          }
        >
          <MaterialIcon name="settings" filled={active === "settings"} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
