import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

import {
  respondAppraisalRequestSchema,
  type RespondAppraisalRequestSchema,
} from "../schemas/respond-appraisal-request.schema";
import { appraisalRequestsService } from "../services/appraisalRequestsService";
import { get_appraisal_request_status_label } from "../constants/appraisal-request-status.constants";
import type { AppraisalRequestListItem } from "../types/appraisal-request.types";

export const AppraisalRequestForm = ({
  requests,
  onSuccess,
}: {
  requests: AppraisalRequestListItem[];
  onSuccess?: () => void;
}) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const request = requests.find((item) => item.id === selectedId);

  const form = useForm<RespondAppraisalRequestSchema>({
    resolver: standardSchemaResolver(respondAppraisalRequestSchema),
    defaultValues: {
      estimated_price_min: request?.estimated_price_min ?? 0,
      estimated_price_max: request?.estimated_price_max ?? 0,
      admin_note: request?.admin_note ?? "",
    },
  });

  if (!request) {
    return (
      <p className="text-sm text-muted-foreground">
        No se encontró la solicitud seleccionada.
      </p>
    );
  }

  const isClosed = request.status === "closed";

  const onSubmit = async (data: RespondAppraisalRequestSchema) => {
    const response = await appraisalRequestsService.respond(request.id, {
      estimated_price_min: data.estimated_price_min,
      estimated_price_max: data.estimated_price_max,
      admin_note: data.admin_note?.trim() || undefined,
    });

    if (response.ok) {
      toast.success("Respuesta enviada al cliente correctamente");
      setIsOpen(false);
      setSelectedId(null);
      onSuccess?.();
    } else {
      toast.error(response.message || "Error al responder la solicitud");
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Solicitud de tasación</h2>
          <p className="text-sm text-muted-foreground">
            Estado actual: {get_appraisal_request_status_label(request.status)}
          </p>
        </div>

        <div className="grid gap-3 rounded-lg bg-muted/40 p-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Vehículo</p>
            <p>{request.vehicle_label}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Kilometraje</p>
            <p>{request.mileage.toLocaleString("es-ES")} km</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Contacto</p>
            <p>{request.contact_label}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Email</p>
            <p>{request.email}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Ubicación</p>
            <p>{request.address ?? "No disponible"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            name="estimated_price_min"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="estimated_price_min">
                  Precio mínimo estimado
                </FieldLabel>
                <Input
                  id="estimated_price_min"
                  type="number"
                  min={0}
                  disabled={isClosed}
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="estimated_price_max"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="estimated_price_max">
                  Precio máximo estimado
                </FieldLabel>
                <Input
                  id="estimated_price_max"
                  type="number"
                  min={0}
                  disabled={isClosed}
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="admin_note"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="admin_note">Nota orientativa</FieldLabel>
              <Textarea
                id="admin_note"
                placeholder="Comentarios sobre el estado, el mercado, etc."
                aria-invalid={fieldState.invalid}
                disabled={isClosed}
                rows={4}
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </section>

      {!isClosed ? (
        <div className="flex justify-end">
          <Button type="submit">
            {request.status === "answered" ? "Actualizar respuesta" : "Responder"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Esta solicitud está cerrada y no admite más respuestas.
        </p>
      )}
    </form>
  );
};
