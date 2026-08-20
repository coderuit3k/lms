"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/site/material-icon";
import { markAllNotificationsRead, markNotificationRead } from "@/app/notifications/actions";
import type { NotificationItem } from "@/lib/queries";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-colors"
        aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
      >
        <MaterialIcon name="notifications" className="text-[22px]" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-error text-on-error text-[10px] leading-none rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant/30 rounded-xl shadow-lg z-50 flex flex-col max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-outline-variant/30">
              <span className="font-label-md text-label-md text-on-surface">Thông báo</span>
              {unreadCount > 0 && (
                <form action={markAllNotificationsRead}>
                  <button type="submit" className="text-primary hover:underline font-label-sm text-label-sm">
                    Đánh dấu đã đọc hết
                  </button>
                </form>
              )}
            </div>
            <div className="overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center font-body-md text-body-md text-on-surface-variant">
                  Chưa có thông báo nào.
                </p>
              ) : (
                notifications.map((n) => (
                  <form key={n.id} action={markNotificationRead.bind(null, n.id)}>
                    <button
                      type="submit"
                      className={
                        n.read
                          ? "w-full text-left p-3 border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low transition-colors"
                          : "w-full text-left p-3 border-b border-outline-variant/10 last:border-0 bg-primary/5 hover:bg-primary/10 transition-colors"
                      }
                    >
                      <p className="font-label-md text-label-md text-on-surface">{n.title}</p>
                      {n.body && <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{n.body}</p>}
                      <p className="font-label-sm text-label-sm text-outline mt-1">{timeAgo(n.createdAt)}</p>
                    </button>
                  </form>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
