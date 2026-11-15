import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DmThread } from "@/components/messages/DmThread";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/auth";
import { MESSAGE_PAGE_SIZE } from "@/lib/chat";
import type { DmMessage } from "@/lib/networking";
import { isUuid } from "@/lib/validation";

export const metadata: Metadata = {
  title: "گفتگو",
  robots: { index: false, follow: false },
};

export default async function DmThreadPage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId } = await params;
  if (!isUuid(connectionId)) notFound();

  const { supabase, user } = await requireSession(`/messages/${connectionId}`);

  const { data: canMessage } = await supabase.rpc("can_message_connection", {
    p_connection_id: connectionId,
  });

  if (!canMessage) {
    return (
      <section className="py-16">
        <Container>
          <Card className="mx-auto max-w-md p-8 text-center">
            <h1 className="text-lg font-bold text-navy-900">گفتگو در دسترس نیست</h1>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              این گفتگو در دسترس شما نیست یا یکی از طرفین ارتباط را قطع کرده است.
            </p>
            <ButtonLink href="/messages" variant="outline" className="mt-5">
              بازگشت به پیام‌ها
            </ButtonLink>
          </Card>
        </Container>
      </section>
    );
  }

  const [partnerResult, messagesResult, profileResult] = await Promise.all([
    supabase.rpc("get_connection_partner", { p_connection_id: connectionId }),
    supabase.rpc("get_direct_messages", {
      p_connection_id: connectionId,
      p_before: null,
      p_limit: MESSAGE_PAGE_SIZE,
    }),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
  ]);

  const partner = partnerResult.data?.[0] ?? null;
  const messages = (messagesResult.data ?? []) as DmMessage[];
  const profile = profileResult.data;

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/messages"
            className="inline-flex text-xs font-medium text-navy-800 hover:underline"
          >
            بازگشت به پیام‌ها
          </Link>

          <div className="mt-2 flex items-center gap-3">
            <Avatar
              src={partner?.other_avatar}
              name={partner?.other_name}
              size={40}
              className="size-10 shrink-0 text-sm"
            />
            <h1 className="truncate text-xl font-bold text-navy-900">
              {partner?.other_name ?? "عضو مهر دانا"}
            </h1>
          </div>

          <div className="mt-4">
            <DmThread
              connectionId={connectionId}
              currentUserId={user.id}
              currentUserName={profile?.full_name ?? null}
              currentUserAvatar={profile?.avatar_url ?? null}
              initialMessages={messages}
              otherId={partner?.other_id ?? ""}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
