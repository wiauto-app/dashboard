import { CustomDialog } from "@/components/dynamic-table/customDialog";
import { SuspendUserForm } from "@/components/users/suspendUserForm";
import { UnsuspendUserDialog } from "@/components/users/unsuspendUserDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BanIcon } from "lucide-react";

type DisciplinaryActionButtonProps = {
  implicated_profile_id: string | null | undefined;
  implicated_is_suspended?: boolean;
  onSuccess?: () => void;
};

export const DisciplinaryActionButton = ({
  implicated_profile_id,
  implicated_is_suspended = false,
  onSuccess,
}: DisciplinaryActionButtonProps) => {
  if (!implicated_profile_id) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="warning"
              size="icon-sm"
              disabled
              aria-label="Acción disciplinaria no disponible"
            >
              <BanIcon className="size-4" aria-hidden />
            </Button>
          }
        />
        <TooltipContent>
          No hay un perfil implicado para sancionar
        </TooltipContent>
      </Tooltip>
    );
  }

  if (implicated_is_suspended) {
    return (
      <UnsuspendUserDialog
        targetUserId={implicated_profile_id}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <CustomDialog
      trigger={
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="warning"
                size="icon-sm"
                aria-label="Acción disciplinaria"
              >
                <BanIcon className="size-4" aria-hidden />
              </Button>
            }
          />
          <TooltipContent>Suspender al implicado</TooltipContent>
        </Tooltip>
      }
    >
      {({ closeDialog }) => (
        <SuspendUserForm
          targetUserId={implicated_profile_id}
          onSuccess={() => {
            closeDialog();
            onSuccess?.();
          }}
        />
      )}
    </CustomDialog>
  );
};
