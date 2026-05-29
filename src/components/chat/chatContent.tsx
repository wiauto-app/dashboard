import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useFiltersManager } from "@/hooks/useFiltersManager";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

import { ChatMessageComposer } from "./chatMessageComposer";
import { MessageStatusIcon } from "./components/MessageStatusIcon";
import { useChatSocket } from "./context/chatSocketContext";
import { chatService } from "./services/chatService";
import { CHAT_MESSAGE_TYPE } from "./types/chat.types";
import type { ChatListItem, ChatMessageListItem } from "./types/chat.types";
import { formatMessageTime } from "./utils/formatMessageTime";
import { formatParticipantNames } from "./utils/formatParticipantNames";

const MessageBubble = ({
  message,
  is_own,
}: {
  message: ChatMessageListItem;
  is_own: boolean;
}) => {
  const render_body = () => {
    if (message.type === CHAT_MESSAGE_TYPE.TEXT) {
      return (
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content}
        </p>
      );
    }
    if (message.type === CHAT_MESSAGE_TYPE.IMAGE && message.media_url) {
      return (
        <a href={message.media_url} target="_blank" rel="noreferrer">
          <img
            src={message.media_url}
            alt={message.metadata?.caption ?? "Imagen"}
            className="max-h-64 max-w-full rounded-md object-cover"
          />
        </a>
      );
    }
    if (message.type === CHAT_MESSAGE_TYPE.AUDIO && message.media_url) {
      return (
        <audio controls src={message.media_url} className="max-w-full">
          <track kind="captions" />
        </audio>
      );
    }
    if (message.type === CHAT_MESSAGE_TYPE.FILE && message.media_url) {
      return (
        <a
          href={message.media_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          {message.metadata?.file_name ?? "Descargar archivo"}
        </a>
      );
    }
    return (
      <p className="text-sm text-muted-foreground">Adjunto no disponible</p>
    );
  };

  return (
    <div
      className={cn("flex w-full", is_own ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[min(85%,28rem)] rounded-2xl px-3 py-2 shadow-sm",
          is_own ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {render_body()}
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            is_own ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {message.edited_at ? <span>editado</span> : null}
          <span>{formatMessageTime(message.created_at)}</span>
          {is_own ? <MessageStatusIcon status={message.status} /> : null}
        </div>
      </div>
    </div>
  );
};

export const ChatContent = () => {
  const { user } = useAuth();
  const { values } = useFiltersManager({ path: "/messages" });
  const chat_id = values.chat_id;
  const query_client = useQueryClient();
  const messages_end_ref = useRef<HTMLDivElement>(null);
  const marked_read_ref = useRef<string | null>(null);
  const messages_container_ref = useRef<HTMLDivElement>(null);
  const {
    is_connected,
    joinChat,
    leaveChat,
    emitTypingStart,
    emitTypingStop,
    subscribePresence,
    presence_by_user_id,
    typing_by_chat_id,
  } = useChatSocket();

  const { data: chat_list_data } = useQuery({
    queryKey: ["chat-list"],
    queryFn: () =>
      chatService.findAll({
        page: 1,
        limit: 30,
        order_direction: "DESC",
      }),
  });

  useEffect(() => {
    setTimeout(() => {
      if (messages_container_ref.current) {
        messages_container_ref.current.scrollTo({
          top: messages_container_ref.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 500);
  }, [messages_container_ref,chat_list_data]);

  const selected_chat: ChatListItem | undefined = useMemo(
    () => chat_list_data?.data.find((chat) => chat.id === chat_id),
    [chat_list_data, chat_id],
  );

  const other_participant_ids = useMemo(
    () => selected_chat?.other_participants.map((p) => p.id) ?? [],
    [selected_chat],
  );

  const { data: messages_data, isLoading: is_loading_messages } = useQuery({
    queryKey: ["chat-messages", chat_id],
    queryFn: () => chatService.findMessages(chat_id!, { limit: 100 }),
    enabled: Boolean(chat_id),
  });

  const messages = useMemo(() => messages_data?.data ?? [], [messages_data]);

  const scroll_to_bottom = useCallback(() => {
    messages_end_ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!chat_id || !is_connected) return;
    void joinChat(chat_id);
    return () => {
      void leaveChat(chat_id);
    };
  }, [chat_id, is_connected, joinChat, leaveChat]);

  useEffect(() => {
    if (!chat_id || !is_connected || other_participant_ids.length === 0) return;
    void subscribePresence(other_participant_ids);
  }, [chat_id, is_connected, other_participant_ids, subscribePresence]);

  useEffect(() => {
    scroll_to_bottom();
  }, [messages, scroll_to_bottom]);

  const mark_messages_read = useCallback(async () => {
    if (!chat_id || messages.length === 0) return;
    const last_message = messages[messages.length - 1];
    if (marked_read_ref.current === last_message.id) return;
    marked_read_ref.current = last_message.id;
    try {
      await chatService.markAsRead(chat_id, last_message.id);
      void query_client.invalidateQueries({ queryKey: ["chat-list"] });
      void query_client.invalidateQueries({ queryKey: ["chat-unread-total"] });
    } catch {
      marked_read_ref.current = null;
    }
  }, [chat_id, messages, query_client]);

  useEffect(() => {
    if (!chat_id || messages.length === 0) return;
    void mark_messages_read();
  }, [chat_id, messages, mark_messages_read]);

  const handle_message_sent = useCallback(() => {
    scroll_to_bottom();
    void mark_messages_read();
  }, [scroll_to_bottom, mark_messages_read]);

  const typing_user_ids = useMemo(() => {
    if (!chat_id) return [];
    const set = typing_by_chat_id[chat_id];
    if (!set) return [];
    return Array.from(set).filter((id) => id !== user?.id);
  }, [typing_by_chat_id, chat_id, user?.id]);

  const header_title = selected_chat
    ? formatParticipantNames(selected_chat.other_participants)
    : "Conversación";

  const presence_label = useMemo(() => {
    if (other_participant_ids.length === 0) return null;
    const online_count = other_participant_ids.filter(
      (id) => presence_by_user_id[id] === "online",
    ).length;
    if (online_count === other_participant_ids.length) {
      return "En línea";
    }
    if (online_count > 0) {
      return `${online_count} en línea`;
    }
    return "Desconectado";
  }, [other_participant_ids, presence_by_user_id]);

  if (!chat_id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <MessageSquare className="size-8 opacity-50" />
        <p className="text-sm">Selecciona un chat para ver la conversación.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      <header className="flex items-center gap-3 border-b pb-3">
        <Avatar className="size-10">
          <AvatarImage src={selected_chat?.other_participants[0]?.avatar_url} />
          <AvatarFallback>
            {selected_chat?.other_participants[0]?.name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{header_title}</h2>
          {presence_label ? (
            <p className="text-xs text-muted-foreground">{presence_label}</p>
          ) : null}
        </div>
      </header>

      <div
        ref={messages_container_ref}
        className="flex flex-1 flex-col gap-3 overflow-y-auto py-4 max-h-[70vh] "
      >
        {is_loading_messages ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={`msg-skel-${index}`}
                className="h-12 w-2/3 rounded-xl"
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Aún no hay mensajes. Envía el primero.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              is_own={message.sender_id === user?.id}
            />
          ))
        )}
        {typing_user_ids.length > 0 ? (
          <p className="text-xs text-muted-foreground italic">Escribiendo…</p>
        ) : null}
        <div ref={messages_end_ref} />
      </div>

      <ChatMessageComposer
        chat_id={chat_id}
        onMessageSent={handle_message_sent}
        onTypingStart={() => emitTypingStart(chat_id)}
        onTypingStop={() => emitTypingStop(chat_id)}
      />
    </div>
  );
};
