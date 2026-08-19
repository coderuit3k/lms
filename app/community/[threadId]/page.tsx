import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { MaterialIcon } from "@/components/site/material-icon";
import { getCurrentAppUser } from "@/lib/auth";
import { getThreadDetail } from "@/lib/queries";
import { createReply } from "../actions";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId: threadIdParam } = await params;
  const threadId = Number(threadIdParam);
  if (!threadId) notFound();

  const thread = await getThreadDetail(threadId);
  if (!thread) notFound();

  const appUser = await getCurrentAppUser();
  const replyToThread = createReply.bind(null, thread.id);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SiteHeader active="community" showSearch={false} />
      <main className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <Link href="/community" className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 w-fit">
          <MaterialIcon name="arrow_back" className="text-[18px]" /> Quay lại Community
        </Link>

        <article className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            {thread.tag && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm">
                {thread.tag}
              </span>
            )}
            <span className="text-on-surface-variant font-label-sm text-label-sm">
              {thread.authorName} • {formatDate(thread.createdAt)}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">{thread.title}</h1>
          <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">{thread.body}</p>
        </article>

        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <MaterialIcon name="chat_bubble_outline" />
            {thread.replies.length} trả lời
          </h2>
          {thread.replies.map((reply) => (
            <div key={reply.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-label-md text-label-md text-on-surface">{reply.authorName}</span>
                <span className="text-on-surface-variant font-label-sm text-label-sm">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">{reply.body}</p>
            </div>
          ))}
        </div>

        {appUser ? (
          <form action={replyToThread} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 flex flex-col gap-3">
            <h3 className="font-label-md text-label-md text-on-surface">Trả lời</h3>
            <textarea
              name="body"
              required
              rows={3}
              placeholder="Viết trả lời..."
              className="bg-surface-container-high border border-outline-variant rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary resize-y"
            />
            <button
              type="submit"
              className="self-end px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors"
            >
              Gửi trả lời
            </button>
          </form>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 text-center">
            <Link href="/sign-in" className="text-primary hover:underline">
              Đăng nhập
            </Link>
            <span className="text-on-surface-variant"> để trả lời.</span>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
