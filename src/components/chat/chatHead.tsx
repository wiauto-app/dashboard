import { UserAvatar } from "../ui/userAvatar";
import { ChatSearchInput } from "./chatSearchInput";
import { CreateChatDialog } from "./createChatDialog";

export const ChatHead = () => {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar className="size-10" />
      <ChatSearchInput />
      <CreateChatDialog />
    </div>
  );
};
