"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createLessonComment, deleteLessonComment } from "@/app/learn/[lessonId]/actions";
import type { LessonComment } from "@/lib/queries";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function CommentRow({
  comment,
  canDelete,
  onDelete,
  onReply,
}: {
  comment: LessonComment;
  canDelete: boolean;
  onDelete: () => void;
  onReply?: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md shrink-0 overflow-hidden">
        {comment.authorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-full h-full object-cover" />
        ) : (
          comment.authorName.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-label-md text-label-md text-on-surface">{comment.authorName}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap mt-0.5">{comment.body}</p>
        <div className="flex items-center gap-3 mt-1">
          {onReply && (
            <button type="button" onClick={onReply} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
              Trả lời
            </button>
          )}
          {canDelete && (
            <button type="button" onClick={onDelete} className="font-label-sm text-label-sm text-on-surface-variant hover:text-error transition-colors">
              Xoá
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function LessonComments({
  lessonId,
  comments,
  currentUserId,
  isAdmin,
}: {
  lessonId: number;
  comments: LessonComment[];
  currentUserId: number;
  isAdmin: boolean;
}) {
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const topLevel = comments.filter((c) => c.parentId === null);
  const repliesByParent = new Map<number, LessonComment[]>();
  for (const c of comments) {
    if (c.parentId === null) continue;
    const arr = repliesByParent.get(c.parentId) ?? [];
    arr.push(c);
    repliesByParent.set(c.parentId, arr);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>, parentId: number | null) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    try {
      await createLessonComment(lessonId, parentId, formData);
      form.reset();
      setReplyTo(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không gửi được bình luận.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await deleteLessonComment(commentId, lessonId);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không xoá được bình luận.");
    }
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 flex flex-col gap-4">
      <h3 className="font-headline-md text-headline-md text-on-surface text-[20px]">Bình luận ({comments.length})</h3>

      <form onSubmit={(e) => handleSubmit(e, null)} className="flex flex-col gap-2">
        <textarea
          name="body"
          required
          maxLength={2000}
          placeholder="Đặt câu hỏi hoặc chia sẻ suy nghĩ về bài học này..."
          className="w-full min-h-[80px] bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none [field-sizing:content]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="self-end px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-all active:scale-[0.97] disabled:opacity-50"
        >
          Gửi bình luận
        </button>
      </form>

      {topLevel.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant text-center py-6">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      ) : (
        <div className="flex flex-col gap-5">
          {topLevel.map((c) => (
            <div key={c.id}>
              <CommentRow
                comment={c}
                canDelete={c.authorId === currentUserId || isAdmin}
                onDelete={() => handleDelete(c.id)}
                onReply={() => setReplyTo(replyTo === c.id ? null : c.id)}
              />

              {replyTo === c.id && (
                <form onSubmit={(e) => handleSubmit(e, c.id)} className="flex flex-col gap-2 ml-11 mt-2">
                  <textarea
                    name="body"
                    required
                    maxLength={2000}
                    autoFocus
                    placeholder={`Trả lời ${c.authorName}...`}
                    className="w-full min-h-[60px] bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none [field-sizing:content]"
                  />
                  <div className="flex items-center gap-2 self-end">
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Huỷ
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-3 py-1.5 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary/90 transition-all active:scale-[0.97] disabled:opacity-50"
                    >
                      Gửi
                    </button>
                  </div>
                </form>
              )}

              {(repliesByParent.get(c.id) ?? []).length > 0 && (
                <div className="flex flex-col gap-4 ml-11 mt-4">
                  {(repliesByParent.get(c.id) ?? []).map((r) => (
                    <CommentRow key={r.id} comment={r} canDelete={r.authorId === currentUserId || isAdmin} onDelete={() => handleDelete(r.id)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
