import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";

export const Notifications = () => {
  return (
    <Button variant="ghost" size="icon">
      <BellIcon className="size-4" />
    </Button>
  );
};
