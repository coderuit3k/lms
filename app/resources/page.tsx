import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { HubSidebar } from "@/components/site/hub-sidebar";
import { MaterialIcon } from "@/components/site/material-icon";
import { ResourceUploadButton } from "@/components/site/resource-upload-button";
import { getCurrentAppUser } from "@/lib/auth";
import { getResources, getUserPaidCourseIds } from "@/lib/queries";

function fileIcon(fileType: string | null) {
  if (!fileType) return "description";
  if (fileType.includes("pdf")) return "picture_as_pdf";
  if (fileType.startsWith("image/")) return "image";
  return "description";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

export default async function ResourcesPage() {
  const appUser = await getCurrentAppUser();
  const [resources, paidCourseIds] = await Promise.all([
    getResources(50),
    appUser ? getUserPaidCourseIds(appUser.id) : Promise.resolve(new Set<number>()),
  ]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader />
      <div className="flex flex-1">
        <HubSidebar active="resources" />

        <main className="flex-1 p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto">
          <div className="mb-stack-lg flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">
                Thư viện tài liệu
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Tài liệu học tập, ghi chú do học viên và giảng viên chia sẻ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Upload */}
            <div className="md:col-span-4 bg-primary-container text-on-primary-container rounded-xl p-6 flex flex-col justify-center items-center text-center gap-4">
              <MaterialIcon name="cloud_upload" filled className="text-5xl" />
              <div>
                <h3 className="font-headline-md text-headline-md mb-1">Đóng góp tài liệu</h3>
                <p className="font-label-md text-label-md text-primary-fixed-dim">
                  Chia sẻ ghi chú, tài liệu học tập với cộng đồng.
                </p>
              </div>
              {appUser ? (
                <ResourceUploadButton />
              ) : (
                <p className="font-label-sm text-label-sm">Đăng nhập để tải lên.</p>
              )}
            </div>

            {/* Resource list */}
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
                <MaterialIcon name="folder_open" className="text-secondary" /> Tài liệu
              </h3>
              {resources.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant text-center py-12">
                  Chưa có tài liệu nào. Hãy là người đầu tiên đóng góp!
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {resources.map((item) => {
                    const gated = item.courseId !== null && !paidCourseIds.has(item.courseId);
                    return (
                      <li
                        key={item.id}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <MaterialIcon name={fileIcon(item.fileType)} className="text-outline shrink-0" />
                          <div className="min-w-0">
                            <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors truncate">
                              {item.title}
                            </p>
                            <p className="font-label-sm text-label-sm text-outline truncate">
                              {item.uploaderName} • {formatDate(item.createdAt)}
                              {item.courseTitle ? ` • ${item.courseTitle}` : ""}
                            </p>
                          </div>
                        </div>
                        {gated ? (
                          <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0 flex items-center gap-1">
                            <MaterialIcon name="lock" className="text-[16px]" /> Cần đăng ký khoá học
                          </span>
                        ) : (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-on-surface-variant hover:text-secondary shrink-0"
                          >
                            <MaterialIcon name="download" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
