import type { Metadata } from "next";
import Link from "next/link";

import { RequestActions } from "@/components/messages/RequestActions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ChatIcon } from "@/components/ui/icons";
import { requireSession } from "@/lib/auth";
import { formatEventTime } from "@/lib/format";
import type { Conversation, IncomingRequest } from "@/lib/networking";

export const metadata: Metadata = {
  title: "پیام‌ها",
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const { supabase } = await requireSession("/messages");

  const [conversationsResult, requestsResult] = await Promise.all([
    supabase.rpc("get_conversations"),
    supabase.rpc("get_incoming_requests"),
  ]);

  const conversations = (conversationsResult.data ?? []) as Conversation[];
  const requests = (requestsResult.data ?? []) as IncomingRequest[];

  return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-navy">پیام‌ها و ارتباطات</h1>
          <p className="mt-1 text-sm leading-7 text-ink-muted">
            درخواست‌های دوستی و گفتگوهای خصوصی شما.
          </p>

          {requests.length > 0 ? (
            <Card className="mt-6 overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
                <h2 className="text-sm font-bold text-navy">درخواست‌های دوستی</h2>
                <Badge tone="gold">{requests.length}</Badge>
              </div>

              <ul className="divide-y divide-line">
                {requests.map((request) => (
                  <li key={request.connection_id} className="flex items-center gap-3 p-4">
                    <Avatar
                      src={request.avatar_url}
                      name={request.full_name}
                      size={44}
                      className="size-11 shrink-0 text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-navy">
                        {request.full_name ?? "عضو مهر دانا"}
                      </p>
                      {request.profession ? (
                        <p className="truncate text-xs text-ink-muted">{request.profession}</p>
                      ) : null}
                    </div>
                    <RequestActions connectionId={request.connection_id} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <h2 className="mt-8 text-sm font-bold text-navy">گفتگوها</h2>

          {conversations.length === 0 ? (
            <Card className="mt-3 p-8 text-center">
              <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-navy/8 text-navy">
                <ChatIcon className="size-6" />
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">گفتگویی ندارید</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-ink-muted">
                پس از پذیرش درخواست دوستی یا ارتباط با شرکت‌کنندگان، گفتگوهای شما در همین
                صفحه نمایش داده می‌شود.
              </p>
            </Card>
          ) : (
            <ul className="mt-3 space-y-3">
              {conversations.map((conversation) => (
                <li key={conversation.connection_id}>
                  <Link href={`/messages/${conversation.connection_id}`}>
                    <Card interactive className="flex items-center gap-3 p-4">
                      <Avatar
                        src={conversation.other_avatar}
                        name={conversation.other_name}
                        size={48}
                        className="size-12 shrink-0 text-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy">
                          {conversation.other_name ?? "عضو مهر دانا"}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {conversation.last_message ?? "گفتگو را شروع کنید"}
                        </p>
                      </div>
                      {conversation.last_message_at ? (
                        <time className="shrink-0 text-[11px] text-ink-muted">
                          {formatEventTime(conversation.last_message_at)}
                        </time>
                      ) : null}
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
