export const CHAT_TYPE = {
  INDIVIDUAL: "individual",
  GROUP: "group",
} as const;

export type ChatType = (typeof CHAT_TYPE)[keyof typeof CHAT_TYPE];

export const CHAT_MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  FILE: "file",
} as const;

export type ChatMessageType =
  (typeof CHAT_MESSAGE_TYPE)[keyof typeof CHAT_MESSAGE_TYPE];

export const CHAT_MESSAGE_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
} as const;

export type ChatMessageStatus =
  (typeof CHAT_MESSAGE_STATUS)[keyof typeof CHAT_MESSAGE_STATUS];

export interface ChatMessageMetadata {
  file_name?: string;
  mime_type?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ChatParticipantSummary {
  id: string;
  name: string;
  last_name?: string;
  avatar_url?: string;
  email?: string;
}

export interface ChatListItem {
  id: string;
  chat_type: ChatType;
  vehicle_id: string | null;
  created_at: string;
  updated_at: string;
  other_participants: ChatParticipantSummary[];
  unread_count: number;
  last_message_preview: string | null;
  last_message_at: string | null;
  last_message_type: ChatMessageType | null;
}

export interface ChatItem {
  id: string;
  participants: string[];
  chat_type: ChatType;
  vehicle_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageListItem {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: ChatMessageType;
  status: ChatMessageStatus;
  metadata: ChatMessageMetadata | null;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  media_url: string | null;
}

export interface MarkChatMessagesReadResult {
  updated_messages: ChatMessageListItem[];
  unread_count: number;
}

export interface ChatUnreadTotalResult {
  total: number;
}

export type PresenceStatus = "online" | "offline";

export interface PresenceUserSnapshot {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string | null;
}

export interface MessagesReadPayload {
  chat_id: string;
  reader_id: string;
  message_ids: string[];
}

export interface UnreadUpdatedPayload {
  chat_id: string;
  user_id: string;
  unread_count: number;
}

export interface TypingPayload {
  chat_id: string;
  user_id: string;
}

export interface MessageDeletedPayload {
  id: string;
  chat_id: string;
}
