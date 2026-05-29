import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareText } from "lucide-react";

import { useFiltersManager } from "@/hooks/useFiltersManager";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { chatService } from "./services/chatService";
import { formatListMessageTime } from "./utils/formatMessageTime";
import { formatParticipantNames } from "./utils/formatParticipantNames";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "../ui/avatar";

export const ChatList = () => {
  const { values, handleChange } = useFiltersManager({ path: "/messages" });

  const selected_chat_id = values.chat_id;
  const search = values.search;

  const { data, isLoading } = useQuery({
    queryKey: ["chat-list", search],
    queryFn: () =>
      chatService.findAll({
        page: 1,
        limit: 30,
        search,
        order_by: "updated_at",
        order_direction: "DESC",
      }),
  });

  const chats = useMemo(() => data?.data ?? [], [data]);

  const handleSelectChat = (chat_id: string) => {
    handleChange("chat_id", chat_id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`chat-skeleton-${index}`}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
        <MessageSquareText className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No hay chats disponibles{search ? " para esta búsqueda." : "."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
      {chats.map((chat) => {
        const title = formatParticipantNames(chat.other_participants);
        const subtitle =
          chat.last_message_preview?.trim() ||
          chat.other_participants[0]?.email?.trim() ||
          "Sin mensajes";
        const time_label = formatListMessageTime(chat.last_message_at);
        const has_unread = chat.unread_count > 0;

        return (
          <button
            key={chat.id}
            type="button"
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
              selected_chat_id === chat.id
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50",
              has_unread && selected_chat_id !== chat.id && "border-primary/30 bg-primary/5",
            )}
            onClick={() => handleSelectChat(chat.id)}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <AvatarGroup>
                {chat.other_participants.map((participant) => (
                  <Avatar key={participant.id}>
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback>
                      {participant.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      has_unread ? "font-semibold" : "font-medium",
                    )}
                  >
                    {title}
                  </p>
                  {time_label ? (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {time_label}
                    </span>
                  ) : null}
                </div>
                <p
                  className={cn(
                    "truncate text-xs",
                    has_unread ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {subtitle}
                </p>
              </div>
            </div>
            {has_unread ? (
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                aria-label={`${chat.unread_count} sin leer`}
              >
                {chat.unread_count > 9 ? "9+" : chat.unread_count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
