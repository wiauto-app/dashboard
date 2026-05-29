import { useQuery } from "@tanstack/react-query";
import { CHAT_QUERY_KEYS } from "@/components/chat/context/chatSocketContext";
import { chatService } from "@/components/chat/services/chatService";

export const MessagesNavBadge = () => {
  const { data } = useQuery({
    queryKey: CHAT_QUERY_KEYS.unreadTotal,
    queryFn: () => chatService.getUnreadTotal(),
    refetchInterval: 30_000,
  });

  const total = data?.total ?? 0;
  if (total <= 0) return null;

  return (
    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-ink">
      {total > 99 ? "99+" : total}
    </span>
  );
};
