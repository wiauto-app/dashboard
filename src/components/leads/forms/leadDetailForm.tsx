import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { leadsService, type Lead } from "../services/leadsService";

interface LeadDetailFormProps {
  lead: Lead;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const INSURANCE_LEAD_TYPE = "seguros";

export const LeadDetailForm = ({
  lead,
  onSuccess,
  onCancel,
}: LeadDetailFormProps) => {
  const [status, set_status] = useState(lead.status);
  const [is_submitting, set_is_submitting] = useState(false);

  useEffect(() => {
    set_status(lead.status);
  }, [lead.status]);

  const handleUpdateStatus = async () => {
    set_is_submitting(true);
    const response = await leadsService.update(lead.id, { status });
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

  const extra_data_entries = Object.entries(lead.extra_data ?? {});

  return (
    <div className="space-y-4 p-1">
      <div>
        <h3 className="text-lg font-semibold">
          {lead.first_name} {lead.last_name}
        </h3>
        <p className="text-sm text-muted-foreground">Tipo: {lead.type}</p>
        <p className="text-sm text-muted-foreground">
          DNI: {lead.dni ?? "—"} · Teléfono: {lead.phone}
        </p>
        <p className="text-sm text-muted-foreground">
          Correo: {lead.email} · Creado: {created_at_label}
        </p>
      </div>

      {extra_data_entries.length > 0 ? (
        <div className="space-y-1 rounded-md border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {lead.type === INSURANCE_LEAD_TYPE
              ? "Datos del vehículo"
              : "Datos adicionales"}
          </p>
          {extra_data_entries.map(([key, value]) => (
            <p key={key} className="text-sm">
              <span className="text-muted-foreground">{key}:</span>{" "}
              {String(value)}
            </p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <Field>
          <FieldLabel htmlFor="lead-status">Estado</FieldLabel>
          <Input
            id="lead-status"
            value={status}
            onChange={(event) => set_status(event.target.value)}
            aria-label="Estado del lead"
          />
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
