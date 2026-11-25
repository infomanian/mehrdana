"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { blockDmUser, loadOlderDmMessages } from "@/app/messages/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { inputStyles } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat";
import { cn } from "@/lib/cn";
import { formatEventTime } from "@/lib/format";
import type { DmMessage } from "@/lib/networking";
import { getBrowserClient } from "@/lib/supabase/client";

type RawDm = {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function DmThread({
  connectionId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  initialMessages,
  otherId,
}: {
  connectionId: string;
  currentUserId: string;
  currentUserName: string | null;
  currentUserAvatar: string | null;
  initialMessages: DmMessage[];
  otherId: string;
}) {
  const [messages, setMessages] = useState<DmMessage[]>(() => [...initialMessages].reverse());
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const router = useRouter();
  const profileCacheRef = useRef<Map<string, { name: string | null; avatar: string | null }>>(
    new Map(),
  );
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

  async function fetchProfile(userId: string) {
    const cache = profileCacheRef.current;
    const cached = cache.get(userId);
    if (cached) return cached;

    const supabase = getBrowserClient();
    let profile = { name: null as string | null, avatar: null as string | null };
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

  function append(message: DmMessage) {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`dm:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const row = payload.new as RawDm;
          if (row.sender_id === currentUserRef.current.id) {
            append({
              ...row,
              sender_name: currentUserRef.current.name,
              sender_avatar: currentUserRef.current.avatar,
            });
            return;
          }
          fetchProfile(row.sender_id).then((profile) => {
            append({ ...row, sender_name: profile.name, sender_avatar: profile.avatar });
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return;

    const supabase = getBrowserClient();
    if (!supabase) return;

    setSending(true);
    setNotice(null);

    const { data, error } = await supabase
      .from("direct_messages")
      .insert({ connection_id: connectionId, sender_id: currentUserId, content })
      .select("id, connection_id, sender_id, content, created_at")
      .single();

    setSending(false);
    if (error) {
      setNotice("ارسال پیام انجام نشد. دوباره تلاش کنید.");
      return;
    }

    setInput("");
    append({ ...(data as RawDm), sender_name: currentUserName, sender_avatar: currentUserAvatar });
  }

  async function loadOlder() {
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingOlder(true);
    const result = await loadOlderDmMessages(connectionId, oldest.created_at);
    setLoadingOlder(false);

    if (result.messages && result.messages.length > 0) {
      const older = [...result.messages].reverse();
      setMessages((prev) => [...older, ...prev]);
    }
  }

  async function block() {
    setBlocking(true);
    const result = await blockDmUser(otherId);
    setBlocking(false);
    setNotice(result.message ?? "مسدودسازی انجام نشد.");
    if (result.ok) router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="text-sm font-bold text-navy">گفتگوی خصوصی</p>
          <Button type="button" variant="ghost" size="sm" disabled={blocking} onClick={block}>
            {blocking ? "در حال مسدودسازی…" : "مسدود کردن"}
          </Button>
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
                <li key={message.id} className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
                  <Avatar
                    src={message.sender_avatar}
                    name={message.sender_name}
                    size={36}
                    className="size-9 shrink-0 text-xs"
                  />
                  <div className={cn("min-w-0 flex-1", isOwn && "text-end")}>
                    <div className={cn("flex items-center gap-2", isOwn && "flex-row-reverse")}>
                      <span className="truncate text-xs font-bold text-navy">
                        {message.sender_name ?? "عضو مهر دانا"}
                      </span>
                      <time className="shrink-0 text-[11px] text-ink-muted">
                        {formatEventTime(message.created_at)}
                      </time>
                    </div>
                    <p
                      className={cn(
                        "mt-1 inline-block max-w-full whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-7",
                        isOwn
                          ? "rounded-tr-md bg-navy text-white"
                          : "rounded-tl-md bg-canvas text-ink",
                      )}
                    >
                      {message.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div ref={endRef} />
        </div>

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
