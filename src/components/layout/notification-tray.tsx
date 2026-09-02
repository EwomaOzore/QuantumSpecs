"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";

type InboxItem = {
  id: string;
  team: string;
  channel: string;
  message: string;
  createdAt: string;
  status: string;
  readAt: string | null;
  href: string | null;
};

type Inbox = { items: InboxItem[]; unread: number };

export function NotificationTray() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const inbox = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      return (await res.json()) as Inbox;
    },
    refetchInterval: 8_000,
  });

  const mark = useMutation({
    mutationFn: async (body: { id?: string; all?: boolean }) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = inbox.data?.unread ?? 0;
  const items = inbox.data?.items ?? [];

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        className="relative rounded-md p-1.5 text-qs-muted hover:bg-qs-hover hover:text-qs-text"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-qs-warning px-1 font-mono text-[9px] text-qs-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-lg border border-qs-border bg-qs-surface">
          <div className="flex items-center justify-between border-b border-qs-border px-3 py-2">
            <div className="text-[12px] font-medium">Notifications</div>
            <button
              type="button"
              className="text-[11px] text-qs-accent disabled:text-qs-faint"
              disabled={unread === 0 || mark.isPending}
              onClick={() => mark.mutate({ all: true })}
            >
              Mark all read
            </button>
          </div>
          <div className="qs-scroll max-h-[420px] overflow-auto">
            {items.length === 0 ? (
              <p className="px-3 py-8 text-center text-[12px] text-qs-muted">No pages yet.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-start gap-2.5 border-b border-qs-border px-3 py-2.5 text-left last:border-b-0 hover:bg-qs-hover"
                  onClick={() => {
                    if (!item.readAt) mark.mutate({ id: item.id });
                    setOpen(false);
                    router.push(item.href || "/incidents");
                  }}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${item.readAt ? "bg-qs-border" : "bg-qs-accent"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium capitalize">{item.team}</span>
                      <Badge>{item.channel}</Badge>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-qs-faint">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-qs-muted">{item.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
