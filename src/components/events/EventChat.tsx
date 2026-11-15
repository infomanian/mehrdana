"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { blockUser, loadOlderMessages, reportMessage } from "@/app/events/[id]/chat/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { inputStyles } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MAX_MESSAGE_LENGTH, REPORT_REASONS, type ChatMessage } from "@/lib/chat";
import { cn } from "@/lib/cn";
import { formatEventTime } from "@/lib/format";
import { getBrowserClient } from "@/lib/supabase/client";

type RawMessage = {
  id: string;
  event_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type SenderProfile = { name: string | null; avatar: string | null };

export function EventChat({
  eventId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  initialMessages,
  initialBlockedIds,
}: {
  eventId: string;
  currentUserId: string;
  currentUserName: string | null;
  currentUserAvatar: string | null;
  initialMessages: ChatMessage[];
  initialBlockedIds: string[];
}) {
  // Messages are kept oldest-first for easy append/prepend.
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...initialMessages].reverse());
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportFor, setReportFor] = useState<ChatMessage | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportNote, setReportNote] = useState("");
  const [reporting, setReporting] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const blockedRef = useRef<Set<string>>(new Set(initialBlockedIds));
  const profileCacheRef = useRef<Map<string, SenderProfile>>(new Map());
  const currentUserRef = useRef({
    id: currentUserId,
    name: currentUserName,
    avatar: currentUserAvatar,
  });

  useEffect(() => {
    if (nearBottomRef.current) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function fetchProfile(userId: string): Promise<SenderProfile> {
    const cache = profileCacheRef.current;
    const cached = cache.get(userId);
    if (cached) return cached;

    const supabase = getBrowserClient();
    let profile: SenderProfile = { name: null, avatar: null };
    if (supabase) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (data) profile = { name: data.full_name, avatar: data.avatar_url };
    }
    cache.set(userId, profile);
    return profile;
  }

  function append(message: ChatMessage) {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }

  // Realtime: insert/delete messages for this event only (RLS still applies).
  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`chat:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_messages",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as RawMessage;
          if (row.sender_id === currentUserRef.current.id) {
            append({
              ...row,
              sender_name: currentUserRef.current.name,
              sender_avatar: currentUserRef.current.avatar,
            });
            return;
          }
          if (blockedRef.current.has(row.sender_id)) return;
          fetchProfile(row.sender_id).then((profile) => {
            append({ ...row, sender_name: profile.name, sender_avatar: profile.avatar });
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "event_messages",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return;

    const supabase = getBrowserClient();
    if (!supabase) return;

    setSending(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("event_messages")
      .insert({ event_id: eventId, sender_id: currentUserId, content })
      .select("id, event_id, sender_id, content, created_at")
      .single();

    setSending(false);
    if (error) {
      setNotice("ارسال پیام انجام نشد. دوباره تلاش کنید.");
      return;
    }

    setInput("");
    append({
      ...(data as RawMessage),
      sender_name: currentUserName,
      sender_avatar: currentUserAvatar,
    });
  }

  async function loadOlder() {
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingOlder(true);
    const result = await loadOlderMessages(eventId, oldest.created_at);
    setLoadingOlder(false);

    if (result.messages && result.messages.length > 0) {
      const older = [...result.messages].reverse();
      setMessages((prev) => [...older, ...prev]);
    }
  }

  async function handleBlock(message: ChatMessage) {
    setOpenMenuId(null);
    const result = await blockUser(eventId, message.sender_id);
    if (result.ok) {
      blockedRef.current.add(message.sender_id);
      setMessages((prev) => prev.filter((m) => m.sender_id !== message.sender_id));
    }
    setNotice(result.message ?? "مسدودسازی انجام نشد.");
  }

  function openReport(message: ChatMessage) {
    setOpenMenuId(null);
    setReportFor(message);
    setReportReason(REPORT_REASONS[0]);
    setReportNote("");
  }

  async function submitReport() {
    if (!reportFor) return;
    setReporting(true);
    const result = await reportMessage(eventId, reportFor.id, reportReason, reportNote);
    setReporting(false);
    setNotice(result.message ?? "ثبت گزارش انجام نشد.");
    if (result.ok) setReportFor(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-sm font-bold text-navy-900">گفتگوی زنده رویداد</p>
          <p className="text-[11px] text-ink-muted">پیام‌ها فقط برای دارندگان بلیت</p>
        </div>

        {notice ? (
          <div className="border-b border-line bg-canvas px-4 py-2 text-xs leading-6 text-ink-muted">
            {notice}
          </div>
        ) : null}

        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-[58vh] min-h-[20rem] overflow-y-auto px-4 py-4 sm:px-5"
        >
          {messages.length >= 50 ? (
            <div className="pb-3 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loadingOlder}
                onClick={loadOlder}
              >
                {loadingOlder ? "در حال بارگذاری…" : "پیام‌های قدیمی‌تر"}
              </Button>
            </div>
          ) : null}

          <ul className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              return (
                <li key={message.id} className="group flex gap-3">
                  <Avatar
                    src={message.sender_avatar}
                    name={message.sender_name}
                    className="size-9 shrink-0 text-xs"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-bold text-navy-900">
                        {message.sender_name ?? "عضو مهر دانا"}
                      </span>
                      <time className="shrink-0 text-[11px] text-ink-muted">
                        {formatEventTime(message.created_at)}
                      </time>
                    </div>
                    <p
                      className={cn(
                        "mt-1 whitespace-pre-wrap break-words rounded-2xl rounded-tr-md px-3 py-2 text-sm leading-7",
                        isOwn ? "bg-navy-800/6 text-ink" : "bg-canvas text-ink",
                      )}
                    >
                      {message.content}
                    </p>
                  </div>

                  {!isOwn ? (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === message.id ? null : message.id)}
                        aria-label="گزینه‌های پیام"
                        className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-canvas hover:text-navy-900"
                      >
                        ⋯
                      </button>

                      {openMenuId === message.id ? (
                        <div className="absolute end-0 top-9 z-10 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
                          <button
                            type="button"
                            onClick={() => openReport(message)}
                            className="block w-full px-3 py-2 text-start text-xs text-ink hover:bg-canvas"
                          >
                            گزارش این پیام
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBlock(message)}
                            className="block w-full px-3 py-2 text-start text-xs text-accent-strong hover:bg-accent/8"
                          >
                            مسدود کردن کاربر
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div ref={endRef} />
        </div>

        {reportFor ? (
          <div className="border-t border-line bg-canvas/60 px-4 py-3">
            <p className="text-xs font-bold text-navy-900">گزارش پیام</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy-800/40"
                aria-label="دلیل گزارش"
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <input
                value={reportNote}
                onChange={(event) => setReportNote(event.target.value)}
                maxLength={500}
                placeholder="توضیح اختیاری"
                className={cn(inputStyles, "min-w-40 flex-1")}
              />
              <Button
                type="button"
                size="sm"
                disabled={reporting}
                onClick={submitReport}
              >
                {reporting ? "در حال ثبت…" : "ثبت گزارش"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={reporting}
                onClick={() => setReportFor(null)}
              >
                انصراف
              </Button>
            </div>
          </div>
        ) : null}

        <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="پیام خود را بنویسید…"
            aria-label="پیام جدید"
            className={cn(inputStyles, "flex-1")}
          />
          <SubmitButton pendingLabel="در حال ارسال…" disabled={sending || !input.trim()}>
            ارسال
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
