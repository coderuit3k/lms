import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { HubSidebar } from "@/components/site/hub-sidebar";
import { MaterialIcon } from "@/components/site/material-icon";
import { AvatarUploadButton } from "@/components/site/avatar-upload-button";
import { AccountSecurityButton } from "@/components/site/account-security-button";
import { getCurrentAppUser } from "@/lib/auth";
import { updateProfile } from "./actions";

const notificationOptions: { key: string; label: string }[] = [
  { key: "notifyCourseUpdates", label: "Cập nhật khoá học & bài học mới" },
  { key: "notifyCommunityReplies", label: "Trả lời & nhắc đến trong Cộng đồng" },
  { key: "notifyWeeklyDigest", label: "Tổng kết tiến độ hàng tuần" },
  { key: "notifyProductAnnouncements", label: "Thông báo sản phẩm mới" },
];

export default async function SettingsPage() {
  const appUser = await getCurrentAppUser();
  if (!appUser) redirect("/sign-in");

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader />
      <div className="flex flex-1">
        <HubSidebar active="settings" />

        <main className="flex-1 p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto">
          <header className="mb-stack-lg">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">
              Cài đặt tài khoản
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Quản lý hồ sơ, bảo mật và thông báo của bạn.
            </p>
          </header>

          <form action={updateProfile} className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Profile Information */}
            <section className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border border-outline-variant/30 p-gutter">
              <div className="flex items-center gap-4 mb-stack-md">
                <MaterialIcon name="person" className="text-primary text-3xl" />
                <h3 className="font-headline-md text-headline-md text-on-surface">Thông tin hồ sơ</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-stack-md items-start">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  {appUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary-container"
                      alt={appUser.name}
                      src={appUser.avatarUrl}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary-container">
                      <MaterialIcon name="person" className="text-primary text-4xl" />
                    </div>
                  )}
                  <AvatarUploadButton />
                </div>
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Họ tên</label>
                    <input
                      name="name"
                      required
                      maxLength={255}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      type="text"
                      defaultValue={appUser.name}
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Email</label>
                    <input
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface-variant"
                      type="email"
                      value={appUser.email}
                      disabled
                      title="Email được quản lý qua tài khoản đăng nhập, không sửa được ở đây."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Giới thiệu</label>
                    <textarea
                      name="bio"
                      maxLength={1000}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      rows={2}
                      defaultValue={appUser.bio ?? ""}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border border-outline-variant/30 p-gutter flex flex-col">
              <div className="flex items-center gap-4 mb-stack-md">
                <MaterialIcon name="security" className="text-secondary text-3xl" />
                <h3 className="font-headline-md text-headline-md text-on-surface">Bảo mật</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
                  <MaterialIcon name="verified_user" className="text-on-secondary-container text-3xl" />
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  Mật khẩu & xác thực 2 lớp được quản lý qua tài khoản đăng nhập của bạn.
                </p>
              </div>
              <div className="mt-stack-md">
                <AccountSecurityButton />
              </div>
            </section>

            {/* Notifications */}
            <section className="col-span-1 md:col-span-12 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(26,35,126,0.05)] border border-outline-variant/30 p-gutter">
              <div className="flex items-center gap-4 mb-stack-md">
                <MaterialIcon name="notifications_active" className="text-primary text-3xl" />
                <h3 className="font-headline-md text-headline-md text-on-surface">Thông báo</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notificationOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between gap-4">
                    <p className="font-label-md text-label-md text-on-surface">{opt.label}</p>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        name={opt.key}
                        className="sr-only peer"
                        defaultChecked={Boolean(appUser[opt.key as keyof typeof appUser])}
                      />
                      <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <div className="col-span-1 md:col-span-12 flex justify-end">
              <button
                type="submit"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary/90 transition-all active:scale-[0.97] shadow-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
