import { chatService } from "@/components/chat/services/chatService";

type InvestigationChatNavigate = (options: {
  to: "/messages";
  search: { chat_id: string };
}) => void | Promise<void>;

export const openInvestigationChat = async ({
  profile_id,
  vehicle_id,
  navigate,
}: {
  profile_id: string;
  vehicle_id?: string | null;
  navigate: InvestigationChatNavigate;
}) => {
  const chat = await chatService.create({
    participants: [profile_id],
    vehicle_id: vehicle_id ?? null,
  });

  await navigate({
    to: "/messages",
    search: { chat_id: chat.id },
  });
};
