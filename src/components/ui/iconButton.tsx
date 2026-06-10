import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export const IconButton = ({
  type = "button",
  children,
  onClick,
  text,
  variant = "outline",
  size = "icon",
  disabled = false,
  ariaLabel,
}: {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: () => void;
  text: string;
  disabled?: boolean;
  ariaLabel?: string;
  variant?:
    | "outline"
    | "ghost"
    | "default"
    | "secondary"
    | "destructive"
    | "link"
    | "warning";
  size?:
    | "icon"
    | "default"
    | "xs"
    | "sm"
    | "lg"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg";
}) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button type={type} variant={variant} size={size} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
            {children}
          </Button>
        }
      />
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
};
