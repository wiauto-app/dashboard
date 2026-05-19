import { CustomDialog } from "@/components/dynamic-table/customDialog";
import type { DynamicTableAction } from "@/components/dynamic-table/types";
import { Button } from "@/components/ui/button";
import { SuspendUserForm } from "@/components/users/suspendUserForm";
import { UnsuspendUserDialog } from "@/components/users/unsuspendUserDialog";
import type { Profile } from "@/types/profiles.types";
import { BanIcon } from "lucide-react";

export const moderationActions = (
  row: Profile,
  onSuccess?: () => void,
): DynamicTableAction[] => {
  const actions: DynamicTableAction[] = [
    {
      key: "suspend",
      label: "Suspender",
      component: (
        <CustomDialog
          trigger={
            <Button key="suspend" variant="warning" size="icon-sm">
              <BanIcon className="size-4" />
            </Button>
          }
        >
          {({ closeDialog }) => (
            <SuspendUserForm
              onSuccess={() => {
                closeDialog();
                onSuccess?.();
              }}
              targetUserId={row.id}
            />
          )}
        </CustomDialog>
      ),
    },
    {
      key: "unsuspend",
      label: "Reactivar",
      component: (
        <UnsuspendUserDialog onSuccess={onSuccess} targetUserId={row.id} />
      ),
    },
  ];

  return actions.filter((action) => {
    return row.user.is_suspended
      ? action.key === "unsuspend"
      : action.key === "suspend";
  });
};
