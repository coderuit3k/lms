import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { HubSidebar } from "@/components/site/hub-sidebar";
import { MaterialIcon } from "@/components/site/material-icon";
import { getCurrentAppUser } from "@/lib/auth";
import { getThreads, getTopContributors, getTrendingTags } from "@/lib/queries";
import { createThread } from "./actions";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default async function CommunityPage() {
  const appUser = await getCurrentAppUser();
  const [threads, contributors, trendingTags] = await Promise.all([
    getThreads(20),
    getTopContributors(5),
    getTrendingTags(5),
  ]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader active="community" showSearch={false} />
      <div className="flex flex-1">
        <HubSidebar active="community" />

        {/* Main Content */}
        <main className="flex-1 p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto">
          <header className="mb-stack-lg">
            <h1 className="font-display text-display max-md:text-headline-lg text-primary mb-2">Community Forum</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
              Trao đổi, thảo luận và chia sẻ kiến thức cùng học viên và giảng viên khác.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* New thread form */}
            {appUser ? (
              <form
                action={createThread}
                className="md:col-span-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 flex flex-col gap-3"
              >
                <h2 className="font-headline-md text-headline-md text-primary-container">Tạo thảo luận mới</h2>
                <input
                  name="title"
                  required
                  maxLength={255}
                  placeholder="Tiêu đề"
                  className="bg-surface-container-high border border-outline-variant rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  name="tag"
                  maxLength={100}
                  placeholder="Chủ đề (VD: Physics, Peer Support...) — không bắt buộc"
                  className="bg-surface-container-high border border-outline-variant rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <textarea
                  name="body"
                  required
                  rows={3}
                  placeholder="Nội dung..."
                  className="bg-surface-container-high border border-outline-variant rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary resize-y"
                />
                <button
                  type="submit"
                  className="self-end px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Đăng thảo luận
                </button>
              </form>
            ) : (
              <div className="md:col-span-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 text-center">
                <Link href="/sign-in" className="text-primary hover:underline">
                  Đăng nhập
                </Link>
                <span className="text-on-surface-variant"> để tạo thảo luận mới.</span>
              </div>
            )}

            {/* Recent Discussions */}
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0_4px_20px_rgba(26,35,126,0.02)] p-6 flex flex-col">
              <h2 className="font-headline-md text-headline-md text-primary-container flex items-center gap-2 mb-6">
                <MaterialIcon name="forum" />
                Thảo luận gần đây
              </h2>
              {threads.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant text-center py-12">
                  Chưa có thảo luận nào. Hãy là người đầu tiên!
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {threads.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/community/${thread.id}`}
                      className="p-4 rounded-lg bg-surface hover:bg-surface-container-low transition-colors border border-outline-variant/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
                          <span className="font-label-md text-primary">{thread.authorName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.tag && (
                              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm">
                                {thread.tag}
                              </span>
                            )}
                            <span className="text-on-surface-variant font-label-sm text-label-sm">
                              {thread.authorName} • {timeAgo(thread.createdAt)}
                            </span>
                          </div>
                          <h3 className="font-label-md text-label-md text-on-surface mb-1 truncate">{thread.title}</h3>
                          <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">{thread.body}</p>
                          <div className="flex items-center gap-4 mt-3 text-on-surface-variant font-label-sm text-label-sm">
                            <span className="flex items-center gap-1">
                              <MaterialIcon name="chat_bubble_outline" className="text-[16px]" /> {thread.replyCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Topics */}
            <div className="md:col-span-4 bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-[0_4px_20px_rgba(26,35,126,0.02)] p-6">
              <h2 className="font-headline-md text-headline-md text-primary-container mb-4 flex items-center gap-2">
                <MaterialIcon name="trending_up" />
                Chủ đề nổi bật
              </h2>
              {trendingTags.length === 0 ? (
                <p className="font-label-sm text-label-sm text-on-surface-variant">Chưa có dữ liệu.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {trendingTags.map((t, i) => (
                    <li key={t.tag} className="flex items-center justify-between p-2 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-on-surface-variant font-label-md text-label-md font-bold">{i + 1}</span>
                        <span className="font-label-md text-label-md text-on-surface">{t.tag}</span>
                      </div>
                      <span className="text-on-surface-variant font-label-sm text-label-sm">{t.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Top Contributors */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0_4px_20px_rgba(26,35,126,0.02)] p-6">
              <h2 className="font-headline-md text-headline-md text-primary-container mb-4 flex items-center gap-2">
                <MaterialIcon name="military_tech" />
                Đóng góp nhiều nhất
              </h2>
              {contributors.length === 0 ? (
                <p className="font-label-sm text-label-sm text-on-surface-variant">Chưa có dữ liệu.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {contributors.map((person) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-label-sm">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-label-md text-label-md text-on-surface">{person.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {person.threadCount} thảo luận • {person.replyCount} trả lời
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Community Guidelines */}
            <div className="md:col-span-8 bg-primary-fixed/30 border border-primary-fixed-dim rounded-xl p-6">
              <h2 className="font-headline-md text-headline-md text-primary-container mb-2 flex items-center gap-2">
                <MaterialIcon name="gavel" />
                Nội quy cộng đồng
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Giữ tinh thần học thuật, tôn trọng lẫn nhau, trích dẫn nguồn khi cần.
              </p>
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
