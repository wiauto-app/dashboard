import { TicketCategoriesSelector } from "@/components/dynamicSelectors/ticketCategoriesSelector";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FileInput } from "@/components/ui/fileInput";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { TICKET_STATUS_OPTIONS } from "../constants/ticket-status.constants";
import {
  createTicketSchema,
  updateTicketSchema,
} from "../schemas/ticket.schema";
import { ticketsService } from "../services/ticketsService";
import type { TicketStatus } from "../types/ticket.types";

export const TicketForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const formSchema = selectedId ? updateTicketSchema : createTicketSchema;
  type FormSchema = z.infer<typeof formSchema>;

  const { data: ticketResponse } = useQuery({
    queryKey: ["ticket", selectedId],
    queryFn: () => ticketsService.findOne(selectedId!),
    enabled: !!selectedId,
  });

  const form = useForm<FormSchema>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      category_id: "",
      title: "",
      description: "",
      file_url: "",
      status: "open" as TicketStatus,
    },
  });

  useEffect(() => {
    const ticket = ticketResponse?.data;
    if (!ticket) return;
    form.reset({
      category_id: ticket.category.id,
      title: ticket.title,
      description: ticket.description,
      file_url: ticket.file_url ?? "",
      status: ticket.status,
    });
  }, [ticketResponse, form]);

  const onSubmit = async (formData: FormSchema) => {
    const file_url = formData.file_url?.trim()
      ? formData.file_url.trim()
      : null;

    if (selectedId) {
      const update_data = formData as z.infer<typeof updateTicketSchema>;
      const response = await ticketsService.update(selectedId, {
        category_id: update_data.category_id,
        title: update_data.title,
        description: update_data.description,
        file_url,
        status: update_data.status,
      });
      if (response.ok) {
        toast.success("Ticket actualizado correctamente");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
      } else {
        toast.error(response.message || "Error al actualizar el ticket");
      }
      return;
    }

    if (!formData.category_id || !formData.title || !formData.description) {
      return;
    }

    const response = await ticketsService.create({
      category_id: formData.category_id,
      title: formData.title,
      description: formData.description,
      file_url,
    });

    if (response.ok) {
      toast.success("Ticket creado correctamente");
      setIsOpen(false);
      setSelectedId(null);
      onSuccess?.();
    } else {
      toast.error(response.message || "Error al crear el ticket");
    }
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Ticket de soporte</h2>
          <p className="text-muted-foreground text-sm">
            Los tickets listados corresponden al perfil autenticado.
          </p>
        </div>

        <Controller
          name="category_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="category_id">Categoría</FieldLabel>
              <TicketCategoriesSelector
                value={field.value}
                onValueChange={field.onChange}
                ariaInvalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="Título del ticket"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe el problema o solicitud"
                aria-invalid={fieldState.invalid}
                rows={5}
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="file_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FileInput
                label="Archivo adjunto (opcional)"
                description="Imágenes, PDF o documentos de soporte"
                bucketName="files"
                path="tickets"
                referenceId={selectedId ?? undefined}
                value={field.value?.trim() ? field.value : null}
                onChange={field.onChange}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {selectedId ? (
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="status">Estado</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) =>
                    field.onChange(value as TicketStatus)
                  }
                  items={TICKET_STATUS_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                >
                  <SelectTrigger
                    id="status"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ) : null}
      </section>

      <div className="flex justify-end">
        <Button type="submit">
          {selectedId ? "Actualizar ticket" : "Crear ticket"}
        </Button>
      </div>
    </form>
  );
};
