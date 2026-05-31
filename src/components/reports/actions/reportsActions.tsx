import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import type { DynamicTableAction } from "@/components/dynamic-table/types";
import { DisciplinaryActionButton } from "@/components/moderation/DisciplinaryActionButton";
import { InvestigationChatButton } from "@/components/moderation/InvestigationChatButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlagIcon } from "lucide-react";
import { toast } from "sonner";
import {
  get_report_status_label,
  REPORT_STATUS_OPTIONS,
} from "../constants/report-status.constants";
import { reportsService } from "../services/reportsService";
import type { ReportListItem, ReportStatus } from "../types/report.types";

const ReportQuickStatusMenu = ({
  row,
  onSuccess,
}: {
  row: ReportListItem;
  onSuccess?: () => void;
}) => {
  const available_statuses = REPORT_STATUS_OPTIONS.filter(
    (option) => option.value !== row.status,
  );

  const handleStatusChange = async (status: ReportStatus) => {
    const response = await reportsService.update(row.id, { status });
    if (response.ok) {
      toast.success(
        `Denuncia marcada como «${get_report_status_label(status)}»`,
      );
      onSuccess?.();
      return;
    }
    toast.error(response.message || "Error al actualizar el estado");
  };

  if (available_statuses.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Cambiar estado de la denuncia"
          />
        }
      >
        <FlagIcon className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {available_statuses.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const reportsActions = (
  row: ReportListItem,
  onSuccess?: () => void,
): DynamicTableAction[] => {
  const actions: DynamicTableAction[] = [
    {
      key: "chat-reporter",
      label: "Chat con denunciante",
      component: (
        <InvestigationChatButton
          key={`report-chat-reporter-${row.id}`}
          profile_id={row.reporter_profile_id}
          label="Chat con denunciante"
          tooltip="Denunciante no disponible"
          variant="reporter"
        />
      ),
    },
    {
      key: "chat-implicated",
      label: "Chat con implicado",
      component: (
        <InvestigationChatButton
          key={`report-chat-implicated-${row.id}`}
          profile_id={row.implicated_profile_id}
          vehicle_id={row.vehicle_id_for_chat}
          label="Chat con implicado"
          tooltip="No se pudo resolver el perfil implicado"
          variant="implicated"
        />
      ),
    },
    {
      key: "disciplinary-action",
      label: "Acción disciplinaria",
      component: (
        <DisciplinaryActionButton
          key={`report-disciplinary-${row.id}`}
          implicated_profile_id={row.implicated_profile_id}
          implicated_is_suspended={row.implicated_is_suspended}
          onSuccess={onSuccess}
        />
      ),
    },
    {
      key: "quick-status",
      label: "Cambiar estado",
      component: (
        <ReportQuickStatusMenu
          key={`report-status-${row.id}`}
          row={row}
          onSuccess={onSuccess}
        />
      ),
    },
    deleteRowAction(row.id, onSuccess, {
      deleteFn: reportsService.delete,
      title: "Eliminar denuncia",
      description: `¿Eliminar la denuncia «${row.title}»? Esta acción no se puede deshacer.`,
      successToast: "Denuncia eliminada correctamente",
      errorToast: "Error al eliminar la denuncia",
    }),
  ];

  return actions;
};
