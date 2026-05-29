import { Check, CheckCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { CHAT_MESSAGE_STATUS } from "../types/chat.types";
import type { ChatMessageStatus } from "../types/chat.types";

type MessageStatusIconProps = {
  status: ChatMessageStatus;
  className?: string;
};

export const MessageStatusIcon = ({ status, className }: MessageStatusIconProps) => {
  if (status === CHAT_MESSAGE_STATUS.READ) {
    return <CheckCheck className={cn("size-3.5 text-primary", className)} aria-hidden />;
  }
  if (
    status === CHAT_MESSAGE_STATUS.DELIVERED ||
    status === CHAT_MESSAGE_STATUS.SENT
  ) {
    return <CheckCheck className={cn("size-3.5 opacity-70", className)} aria-hidden />;
  }
  if (status === CHAT_MESSAGE_STATUS.PENDING) {
    return <Check className={cn("size-3.5 opacity-50", className)} aria-hidden />;
  }
  return <Check className={cn("size-3.5 opacity-50", className)} aria-hidden />;
};
