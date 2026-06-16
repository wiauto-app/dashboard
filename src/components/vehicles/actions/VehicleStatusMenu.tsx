import { useState } from "react";
import { toast } from "sonner";
import { CircleDotIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

import {
  get_vehicle_status_label,
  VEHICLE_STATUS_OPTIONS,
  type VehicleStatus,
} from "../constants/vehicle-status.constants";
import { vehiclesService } from "../services/vehiclesService";
import type { AdminVehicleListItem } from "../types/vehicles.types";
import { getVehicleDisplayName } from "../utils/getVehicleDisplayName";
import { IconButton } from "@/components/ui/iconButton";

export const VehicleStatusMenu = ({
  row,
  onSuccess,
}: {
  row: AdminVehicleListItem;
  onSuccess?: () => void;
}) => {
  const [dialog_open, setDialogOpen] = useState(false);
  const [pending_status, setPendingStatus] = useState<VehicleStatus | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [is_submitting, setIsSubmitting] = useState(false);

  const available_statuses = VEHICLE_STATUS_OPTIONS.filter(
    (option) => option.value !== row.status,
  );

  const handleStatusChange = async (
    status: VehicleStatus,
    status_message?: string,
  ) => {
    setIsSubmitting(true);
    const response = await vehiclesService.updateStatus(row.id, {
      status,
      message: status_message,
    });
    setIsSubmitting(false);

    if (response.ok) {
      toast.success(
        `Anuncio marcado como «${get_vehicle_status_label(status)}»`,
      );
      setDialogOpen(false);
      setPendingStatus(null);
      setMessage("");
      onSuccess?.();
      return;
    }

    toast.error(response.message || "Error al actualizar el estado");
  };

  const handleSelectStatus = (status: VehicleStatus) => {
    if (status === "active") {
      void handleStatusChange(status);
      return;
    }

    setPendingStatus(status);
    setMessage("");
    setDialogOpen(true);
  };

  const handleConfirmNonActiveStatus = () => {
    if (!pending_status) {
      return;
    }

    void handleStatusChange(pending_status, message.trim() || undefined);
  };

  if (available_statuses.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton
              variant="outline"
              size="icon-sm"
              text="Cambiar estado del anuncio"
            >
              <CircleDotIcon className="size-4" aria-hidden />
            </IconButton>
          }
        >
          <CircleDotIcon className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {available_statuses.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSelectStatus(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialog_open} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estado del anuncio</DialogTitle>
            <DialogDescription>
              {pending_status
                ? `El anuncio «${getVehicleDisplayName(row)}» pasará a «${get_vehicle_status_label(pending_status)}». Puedes incluir un mensaje opcional para el publicador.`
                : "Confirma el cambio de estado."}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Mensaje opcional para el publicador"
            aria-label="Mensaje opcional para el publicador"
            rows={4}
            disabled={is_submitting}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={is_submitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmNonActiveStatus}
              disabled={is_submitting || !pending_status}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
