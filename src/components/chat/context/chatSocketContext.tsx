import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

import { CHAT_SOCKET_EVENTS } from "../constants/chatSocketEvents";
import type {
  ChatMessageListItem,
  MessageDeletedPayload,
  MessagesReadPayload,
  PresenceStatus,
  PresenceUserSnapshot,
  TypingPayload,
} from "../types/chat.types";
import { getSocketBaseUrl } from "../utils/getSocketBaseUrl";

type PresenceMap = Record<string, PresenceStatus>;

interface ChatSocketContextValue {
  is_connected: boolean;
  presence_by_user_id: PresenceMap;
  typing_by_chat_id: Record<string, Set<string>>;
  joinChat: (chat_id: string) => Promise<void>;
  leaveChat: (chat_id: string) => Promise<void>;
  emitTypingStart: (chat_id: string) => void;
  emitTypingStop: (chat_id: string) => void;
  subscribePresence: (user_ids: string[]) => Promise<PresenceUserSnapshot[]>;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

const CHAT_UNREAD_TOTAL_QUERY_KEY = ["chat-unread-total"] as const;
const CHAT_LIST_QUERY_KEY = ["chat-list"] as const;

export const ChatSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const query_client = useQueryClient();
  const socket_ref = useRef<Socket | null>(null);
  const joined_chats_ref = useRef<Set<string>>(new Set());
  const [is_connected, set_is_connected] = useState(false);
  const [presence_by_user_id, set_presence_by_user_id] = useState<PresenceMap>({});
  const [typing_by_chat_id, set_typing_by_chat_id] = useState<
    Record<string, Set<string>>
  >({});

  const invalidate_chat_queries = useCallback(() => {
    void query_client.invalidateQueries({ queryKey: CHAT_LIST_QUERY_KEY });
    void query_client.invalidateQueries({ queryKey: CHAT_UNREAD_TOTAL_QUERY_KEY });
  }, [query_client]);

  const upsert_message_in_cache = useCallback(
    (message: ChatMessageListItem) => {
      query_client.setQueryData<{
        data: ChatMessageListItem[];
        total: number;
        page: number;
        limit: number;
      }>(["chat-messages", message.chat_id], (previous) => {
        if (!previous) return previous;
        const exists_index = previous.data.findIndex((item) => item.id === message.id);
        if (exists_index >= 0) {
          const next_data = [...previous.data];
          next_data[exists_index] = message;
          return { ...previous, data: next_data };
        }
        return { ...previous, data: [...previous.data, message] };
      });
      invalidate_chat_queries();
    },
    [query_client, invalidate_chat_queries],
  );

  const remove_message_from_cache = useCallback(
    (payload: MessageDeletedPayload) => {
      query_client.setQueryData<{
        data: ChatMessageListItem[];
        total: number;
        page: number;
        limit: number;
      }>(["chat-messages", payload.chat_id], (previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          data: previous.data.filter((item) => item.id !== payload.id),
        };
      });
      invalidate_chat_queries();
    },
    [query_client, invalidate_chat_queries],
  );

  const apply_messages_read = useCallback(
    (payload: MessagesReadPayload) => {
      query_client.setQueryData<{
        data: ChatMessageListItem[];
        total: number;
        page: number;
        limit: number;
      }>(["chat-messages", payload.chat_id], (previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          data: previous.data.map((item) =>
            payload.message_ids.includes(item.id)
              ? { ...item, status: "read" as const }
              : item,
          ),
        };
      });
      invalidate_chat_queries();
    },
    [query_client, invalidate_chat_queries],
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const socket = io(`${getSocketBaseUrl()}/chat`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socket_ref.current = socket;

    const handle_connect = () => set_is_connected(true);
    const handle_disconnect = () => set_is_connected(false);

    const handle_message_created = (message: ChatMessageListItem) => {
      upsert_message_in_cache(message);
    };

    const handle_message_updated = (message: ChatMessageListItem) => {
      upsert_message_in_cache(message);
    };

    const handle_message_deleted = (payload: MessageDeletedPayload) => {
      remove_message_from_cache(payload);
    };

    const handle_messages_read = (payload: MessagesReadPayload) => {
      apply_messages_read(payload);
    };

    const handle_unread_updated = () => {
      invalidate_chat_queries();
    };

    const handle_typing_start = (payload: TypingPayload) => {
      set_typing_by_chat_id((previous) => {
        const current = new Set(previous[payload.chat_id] ?? []);
        current.add(payload.user_id);
        return { ...previous, [payload.chat_id]: current };
      });
    };

    const handle_typing_stop = (payload: TypingPayload) => {
      set_typing_by_chat_id((previous) => {
        const current = new Set(previous[payload.chat_id] ?? []);
        current.delete(payload.user_id);
        return { ...previous, [payload.chat_id]: current };
      });
    };

    const handle_presence_changed = (payload: {
      user_id: string;
      status: PresenceStatus;
    }) => {
      set_presence_by_user_id((previous) => ({
        ...previous,
        [payload.user_id]: payload.status,
      }));
    };

    socket.on("connect", handle_connect);
    socket.on("disconnect", handle_disconnect);
    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_CREATED, handle_message_created);
    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_UPDATED, handle_message_updated);
    socket.on(CHAT_SOCKET_EVENTS.MESSAGE_DELETED, handle_message_deleted);
    socket.on(CHAT_SOCKET_EVENTS.MESSAGES_READ, handle_messages_read);
    socket.on(CHAT_SOCKET_EVENTS.UNREAD_UPDATED, handle_unread_updated);
    socket.on(CHAT_SOCKET_EVENTS.TYPING_START, handle_typing_start);
    socket.on(CHAT_SOCKET_EVENTS.TYPING_STOP, handle_typing_stop);
    socket.on(CHAT_SOCKET_EVENTS.PRESENCE_CHANGED, handle_presence_changed);

    return () => {
      socket.off("connect", handle_connect);
      socket.off("disconnect", handle_disconnect);
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_CREATED, handle_message_created);
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_UPDATED, handle_message_updated);
      socket.off(CHAT_SOCKET_EVENTS.MESSAGE_DELETED, handle_message_deleted);
      socket.off(CHAT_SOCKET_EVENTS.MESSAGES_READ, handle_messages_read);
      socket.off(CHAT_SOCKET_EVENTS.UNREAD_UPDATED, handle_unread_updated);
      socket.off(CHAT_SOCKET_EVENTS.TYPING_START, handle_typing_start);
      socket.off(CHAT_SOCKET_EVENTS.TYPING_STOP, handle_typing_stop);
      socket.off(CHAT_SOCKET_EVENTS.PRESENCE_CHANGED, handle_presence_changed);
      socket.disconnect();
      socket_ref.current = null;
      joined_chats_ref.current.clear();
      set_is_connected(false);
    };
  }, [
    isAuthenticated,
    user?.id,
    upsert_message_in_cache,
    remove_message_from_cache,
    apply_messages_read,
    invalidate_chat_queries,
  ]);

  const joinChat = useCallback(async (chat_id: string) => {
    const socket = socket_ref.current;
    if (!socket?.connected || joined_chats_ref.current.has(chat_id)) return;
    await socket.emitWithAck(CHAT_SOCKET_EVENTS.JOIN_CHAT, { chat_id });
    joined_chats_ref.current.add(chat_id);
  }, []);

  const leaveChat = useCallback(async (chat_id: string) => {
    const socket = socket_ref.current;
    if (!socket?.connected || !joined_chats_ref.current.has(chat_id)) return;
    await socket.emitWithAck(CHAT_SOCKET_EVENTS.LEAVE_CHAT, { chat_id });
    joined_chats_ref.current.delete(chat_id);
  }, []);

  const emitTypingStart = useCallback((chat_id: string) => {
    socket_ref.current?.emit(CHAT_SOCKET_EVENTS.TYPING_START, { chat_id });
  }, []);

  const emitTypingStop = useCallback((chat_id: string) => {
    socket_ref.current?.emit(CHAT_SOCKET_EVENTS.TYPING_STOP, { chat_id });
  }, []);

  const subscribePresence = useCallback(async (user_ids: string[]) => {
    const socket = socket_ref.current;
    if (!socket?.connected || user_ids.length === 0) return [];
    const response = (await socket.emitWithAck(
      CHAT_SOCKET_EVENTS.PRESENCE_SUBSCRIBE,
      { user_ids },
    )) as { users?: PresenceUserSnapshot[] };
    const users = response.users ?? [];
    set_presence_by_user_id((previous) => {
      const next = { ...previous };
      for (const item of users) {
        next[item.user_id] = item.status;
      }
      return next;
    });
    return users;
  }, []);

  const value = useMemo(
    () => ({
      is_connected,
      presence_by_user_id,
      typing_by_chat_id,
      joinChat,
      leaveChat,
      emitTypingStart,
      emitTypingStop,
      subscribePresence,
    }),
    [
      is_connected,
      presence_by_user_id,
      typing_by_chat_id,
      joinChat,
      leaveChat,
      emitTypingStart,
      emitTypingStop,
      subscribePresence,
    ],
  );

  return (
    <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>
  );
};

export const useChatSocket = (): ChatSocketContextValue => {
  const context = useContext(ChatSocketContext);
  if (!context) {
    throw new Error("useChatSocket debe usarse dentro de ChatSocketProvider.");
  }
  return context;
};

export const CHAT_QUERY_KEYS = {
  unreadTotal: CHAT_UNREAD_TOTAL_QUERY_KEY,
  chatList: CHAT_LIST_QUERY_KEY,
} as const;
