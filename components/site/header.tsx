import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { MaterialIcon } from "@/components/site/material-icon";
import { UserMenu } from "@/components/site/user-menu";
import { NotificationBell } from "@/components/site/notification-bell";
import { SearchBox } from "@/components/site/search-box";
import { MobileNav } from "@/components/site/mobile-nav";
import { getCurrentAppUser } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount } from "@/lib/queries";

type NavKey = "browse" | "dashboard" | "community";

const navLinks: { key: NavKey; label: string; href: string }[] = [
  { key: "browse", label: "Khám phá", href: "/" },
  { key: "dashboard", label: "Học tập", href: "/dashboard" },
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
        {/* Logo + Search */}
        <div className="flex items-center gap-6 min-w-0">
          <Link className="font-display text-headline-md font-bold text-primary shrink-0" href="/">
            Scholaris
          </Link>
          {showSearch && <SearchBox />}
        </div>

        {/* Navigation + User actions */}
        <div className="flex items-center gap-6 shrink-0">
          <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? "page" : undefined}
                className={
                  active === link.key
                    ? "px-3 py-2.5 rounded-lg font-label-md text-label-md bg-primary/10 text-primary font-semibold transition-colors"
                    : "px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {showSearch && (
              <Link
                href="/courses"
                aria-label="Tìm khoá học"
                className="md:hidden text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-colors"
              >
                <MaterialIcon name="search" className="text-[22px]" />
              </Link>
            )}

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

            <MobileNav navLinks={navLinks} active={active} signedIn={Boolean(userId)} />
          </div>
        </div>
      </div>
    </header>
  );
}
