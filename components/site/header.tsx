import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { MaterialIcon } from "@/components/site/material-icon";
import { UserMenu } from "@/components/site/user-menu";
import { NotificationBell } from "@/components/site/notification-bell";
import { SearchBox } from "@/components/site/search-box";
import { getCurrentAppUser } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount } from "@/lib/queries";

type NavKey = "browse" | "dashboard" | "community";

const navLinks: { key: NavKey; label: string; href: string }[] = [
  { key: "browse", label: "Khám phá", href: "/" },
  { key: "dashboard", label: "Trang học tập", href: "/dashboard" },
  { key: "community", label: "Cộng đồng", href: "/community" },
];

export async function SiteHeader({
  active,
  showSearch = true,
}: {
  active?: NavKey;
  showSearch?: boolean;
}) {
  const { userId } = await auth();
  const appUser = userId ? await getCurrentAppUser() : null;
  const [notifications, unreadCount] = appUser
    ? await Promise.all([getNotifications(appUser.id, 10), getUnreadNotificationCount(appUser.id)])
    : [[], 0];

  return (
    <header className="bg-surface sticky top-0 z-50 w-full border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16">
        <div className="flex items-center gap-8">
          <Link className="font-display text-headline-md font-bold text-primary" href="/">
            Scholaris
          </Link>
          {showSearch && <SearchBox />}
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={
                active === link.key
                  ? "text-primary font-bold border-b-2 border-primary pb-1 transition-colors"
                  : "text-on-surface-variant hover:text-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {userId ? (
            <>
              <NotificationBell notifications={notifications} unreadCount={unreadCount} />
              <UserMenu role={appUser?.role ?? null} />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden md:block text-primary font-label-md text-label-md hover:underline transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                href="/sign-up"
                className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md hover:bg-primary/90 transition-colors"
              >
                Bắt đầu ngay
              </Link>
            </>
          )}
          <button className="md:hidden text-on-surface">
            <MaterialIcon name="menu" />
          </button>
        </div>
      </div>
    </header>
  );
}
