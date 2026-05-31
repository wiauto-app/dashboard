import { openInvestigationChat } from "@/components/chat/openInvestigationChat";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type InvestigationChatButtonProps = {
  profile_id: string | null | undefined;
  vehicle_id?: string | null;
  label: string;
  tooltip: string;
  disabled?: boolean;
  variant?: "reporter" | "implicated";
  className?: string;
};

export const InvestigationChatButton = ({
  profile_id,
  vehicle_id,
  label,
  tooltip,
  disabled,
  variant = "implicated",
  className,
}: InvestigationChatButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [is_loading, set_is_loading] = useState(false);

  const is_self = Boolean(profile_id && user?.id === profile_id);
  const is_disabled = disabled || !profile_id || is_self || is_loading;

  const handleClick = async () => {
    if (!profile_id || is_disabled) {
      return;
    }

    set_is_loading(true);
    try {
      await openInvestigationChat({
        profile_id,
        vehicle_id,
        navigate,
      });
      toast.success("Chat abierto");
    } catch {
      toast.error("No se pudo abrir el chat");
    } finally {
      set_is_loading(false);
    }
  };

  const Icon = variant === "reporter" ? MessageCircle : MessageSquare;
  const tooltip_text = is_self
    ? "No puedes abrir un chat contigo mismo"
    : !profile_id
      ? tooltip
      : label;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className={cn("text-muted-foreground hover:text-foreground", className)}
            aria-label={label}
            disabled={is_disabled}
            onClick={handleClick}
          >
            <Icon className="size-4" aria-hidden />
          </Button>
        }
      />
      <TooltipContent>{tooltip_text}</TooltipContent>
    </Tooltip>
  );
};
