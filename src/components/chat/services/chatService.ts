import { objectToQueryString } from "@/lib/utils";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type { PaginatedResult } from "@/types/general.types";
import type {
  ChatItem,
  ChatListItem,
  ChatMessageListItem,
  ChatMessageMetadata,
  ChatMessageType,
  ChatUnreadTotalResult,
  MarkChatMessagesReadResult,
} from "../types/chat.types";
import { CHAT_TYPE } from "../types/chat.types";

const V1_CHATS = "/v1/chats";
const V1_CHAT_MESSAGES = "/v1/chat-messages";

type FindAllChatsParams = {
  page?: number;
  limit?: number;
  order_by?: string;
  order_direction?: "ASC" | "DESC";
  search?: string;
};

type FindMessagesParams = {
  page?: number;
  limit?: number;
  order_by?: string;
  order_direction?: "ASC" | "DESC";
};

export const chatService = {
  async findAll(params?: FindAllChatsParams): Promise<PaginatedResult<ChatListItem>> {
    const merged_params = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 30,
      order_by: params?.order_by,
      order_direction: params?.order_direction ?? "DESC",
      search: params?.search,
    };

    const query_string = objectToQueryString(merged_params);
    const response = await apiGet<PaginatedResult<ChatListItem>>(
      `${V1_CHATS}${query_string ? `?${query_string}` : ""}`,
    );

    return response.data;
  },

  async create(params: {
    participants: string[];
    vehicle_id: string | null;
    chat_type?: (typeof CHAT_TYPE)[keyof typeof CHAT_TYPE];
  }): Promise<ChatItem> {
    const response = await apiPost<ChatItem>(V1_CHATS, {
      participants: params.participants,
      vehicle_id: params.vehicle_id,
      chat_type: params.chat_type ?? CHAT_TYPE.INDIVIDUAL,
    });

    return response.data;
  },

  async findMessages(
    chat_id: string,
    params?: FindMessagesParams,
  ): Promise<PaginatedResult<ChatMessageListItem>> {
    const merged_params = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      order_by: params?.order_by ?? "created_at",
      order_direction: params?.order_direction ?? "ASC",
    };
    const query_string = objectToQueryString(merged_params);
    const response = await apiGet<PaginatedResult<ChatMessageListItem>>(
      `${V1_CHATS}/${chat_id}/messages?${query_string}`,
    );
    return response.data;
  },

  async sendMessage(
    chat_id: string,
    body: {
      content: string;
      type: ChatMessageType;
      metadata?: ChatMessageMetadata;
    },
  ): Promise<ChatMessageListItem> {
    const response = await apiPost<ChatMessageListItem>(
      `${V1_CHATS}/${chat_id}/messages`,
      body,
    );
    return response.data;
  },

  async updateMessage(
    message_id: string,
    body: { content?: string; metadata?: ChatMessageMetadata },
  ): Promise<ChatMessageListItem> {
    const response = await apiPatch<ChatMessageListItem>(
      `${V1_CHAT_MESSAGES}/${message_id}`,
      body,
    );
    return response.data;
  },

  async deleteMessage(message_id: string): Promise<void> {
    await apiDelete(`${V1_CHAT_MESSAGES}/${message_id}`);
  },

  async markAsRead(
    chat_id: string,
    last_message_id?: string,
  ): Promise<MarkChatMessagesReadResult> {
    const response = await apiPost<MarkChatMessagesReadResult>(
      `${V1_CHATS}/${chat_id}/read`,
      last_message_id ? { last_message_id } : {},
    );
    return response.data;
  },

  async getUnreadTotal(): Promise<ChatUnreadTotalResult> {
    const response = await apiGet<ChatUnreadTotalResult>(`${V1_CHATS}/unread-total`);
    return response.data;
  },
};
