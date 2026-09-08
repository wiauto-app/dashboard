import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLAN_CONTACT_LEAD_STATUS_LABELS,
  planContactLeadsService,
  type PlanContactLead,
  type PlanContactLeadStatus,
} from "../services/planContactLeadsService";

interface PlanContactLeadDetailFormProps {
  lead: PlanContactLead;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PlanContactLeadDetailForm = ({
  lead,
  onSuccess,
  onCancel,
}: PlanContactLeadDetailFormProps) => {
  const [status, set_status] = useState<PlanContactLeadStatus>(lead.status);
  const [is_submitting, set_is_submitting] = useState(false);

  useEffect(() => {
    set_status(lead.status);
  }, [lead.status]);

  const handleUpdateStatus = async () => {
    set_is_submitting(true);
    const response = await planContactLeadsService.update(lead.id, { status });
    set_is_submitting(false);

    if (!response.ok) {
      toast.error(response.message || "No se pudo actualizar el estado");
      return;
    }

    toast.success("Estado actualizado");
    onSuccess?.();
  };

  const created_at_label = lead.created_at
    ? new Date(lead.created_at).toLocaleString("es-ES")
    : "—";

  return (
    <div className="space-y-4 p-1">
      <div>
        <h3 className="text-lg font-semibold">Lead de contacto</h3>
        <p className="text-sm text-muted-foreground">
          Teléfono: {lead.phone}
        </p>
        <p className="text-sm text-muted-foreground">
          Origen: {lead.source} · Creado: {created_at_label}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <Field>
          <FieldLabel htmlFor="plan-contact-lead-status">Estado</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) =>
              set_status(value as PlanContactLeadStatus)
            }
          >
            <SelectTrigger
              id="plan-contact-lead-status"
              className="w-full"
              aria-label="Estado del lead de contacto"
            >
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.keys(
                  PLAN_CONTACT_LEAD_STATUS_LABELS,
                ) as PlanContactLeadStatus[]
              ).map((key) => (
                <SelectItem key={key} value={key}>
                  {PLAN_CONTACT_LEAD_STATUS_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          type="button"
          variant="outline"
          onClick={handleUpdateStatus}
          disabled={is_submitting || status === lead.status}
          aria-label="Guardar estado del lead"
        >
          {is_submitting ? "Guardando…" : "Guardar estado"}
        </Button>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          aria-label="Cerrar detalle del lead"
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
};
