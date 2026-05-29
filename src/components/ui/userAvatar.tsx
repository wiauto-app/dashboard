import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { getImageUrl } from "@/lib/utils";

export const UserAvatar = (props?: React.ComponentProps<typeof Avatar>) => {
  const { user } = useAuth();
  return (
    <Avatar {...props}>
      <AvatarImage src={getImageUrl(user?.avatar_url)} />
      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
    </Avatar>
  );
};
