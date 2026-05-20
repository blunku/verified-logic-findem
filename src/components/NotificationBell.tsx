import { useEffect, useState } from "react";
import { Bell, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  from_company: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

const NotificationBell = () => {
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);

  const load = async (cid: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id, from_company, subject, message, is_read, created_at")
      .eq("to_candidate_id", cid)
      .order("created_at", { ascending: false })
      .limit(20);
    setMessages((data as Message[]) ?? []);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: cand } = await supabase
        .from("candidates")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!cand) return;
      setCandidateId(cand.id);
      await load(cand.id);

      channel = supabase
        .channel(`messages-${cand.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `to_candidate_id=eq.${cand.id}` },
          () => load(cand.id),
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const unread = messages.filter((m) => !m.is_read).length;

  const markAllRead = async () => {
    if (!candidateId || unread === 0) return;
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("to_candidate_id", candidateId)
      .eq("is_read", false);
    setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
  };

  if (!candidateId) return null;

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) markAllRead(); }}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative ml-1 flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-card/40 hover:bg-primary/10 hover:border-primary/40 transition-colors"
        >
          <Bell className="h-4 w-4 text-foreground" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <span className="text-xs text-muted-foreground">{messages.length} message{messages.length === 1 ? "" : "s"}</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "px-4 py-3 border-b border-border/50 last:border-b-0",
                  !m.is_read && "bg-primary/5",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold truncate flex-1">
                    {m.from_company || "A company"}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
                {m.subject && (
                  <p className="text-xs font-medium text-foreground mb-1">{m.subject}</p>
                )}
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{m.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
