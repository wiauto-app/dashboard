import type { DynamicTableColumn } from "./types";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { ImageInput } from "../ui/imageInput";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { apiResponse } from "@/services/api";
import { scheduleDefaultFormUndo } from "@/lib/defaultFormPendingUndo";
import { toast } from "sonner";

export type DefaultFormMutationMessages = {
  create_success?: string;
  update_success?: string;
  create_error?: string;
  update_error?: string;
  /** Toast antes de ejecutar el guardado (flujo Deshacer). */
  create_pending?: string;
  update_pending?: string;
  /** Etiqueta del botón en el toast (p. ej. "Deshacer"). */
  undo_label?: string;
};

const default_create_success = "Registro creado correctamente";
const default_update_success = "Registro actualizado correctamente";
const default_create_error = "No se pudo crear el registro";
const default_update_error = "No se pudo actualizar el registro";
const default_create_pending =
  "Se creará el registro en unos segundos. Pulsa Deshacer para cancelar.";
const default_update_pending =
  "Cambios guardados correctamente.";

export const DefaultForm = ({
  columns,
  createService,
  updateService,
  findOneService,
  isTest = false,
  onMutationSuccess,
  messages = {},
  use_undo_toast = true,
  undo_delay_ms = 5000,
}: {
  columns: DynamicTableColumn[];
  findOneService: (id: string) => Promise<any>;
  createService: (data: unknown) => Promise<apiResponse<unknown>>;
  updateService: (
    id: string,
    data: unknown,
  ) => Promise<apiResponse<unknown>>;
  isTest?: boolean;
  /** Invalidar loader de la ruta, refetch de lista, etc. */
  onMutationSuccess?: () => void;
  messages?: DefaultFormMutationMessages;
  /**
   * Si es true, el guardado se retrasa mostrando un toast con "Deshacer".
   * Si el usuario pulsa Deshacer, no se hace la petición.
   */
  use_undo_toast?: boolean;
  /** ms de espera antes de enviar si no hay Deshacer. */
  undo_delay_ms?: number;
}) => {
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [is_submitting, setIsSubmitting] = useState(false);
  const is_submit_locked_ref = useRef(false);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);

  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);

  const queryClient = useQueryClient();

  const filteredColumns = columns.filter(
    (column) => column.accessorKey !== "select" && column.modifiable !== false,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["selectedData", selectedId],
    queryFn: () => findOneService(selectedId!),
    enabled: !!selectedId,
  });

  const selectedData = data?.data;

  const release_submit_lock = () => {
    is_submit_locked_ref.current = false;
    setIsSubmitting(false);
  };

  const try_acquire_submit_lock = (): boolean => {
    if (is_submit_locked_ref.current) {
      return false;
    }
    is_submit_locked_ref.current = true;
    setIsSubmitting(true);
    return true;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!try_acquire_submit_lock()) {
      return;
    }

    try {
      const form = e.currentTarget;

      const formData = new FormData(form);

      const values: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        values[key] = value;
      });

      // Parse booleans y números (FormData entrega todo como string).
      filteredColumns.forEach((column) => {
        if (column.type === "boolean") {
          const checkbox = form.elements.namedItem(
            column.accessorKey,
          ) as HTMLInputElement | null;

          values[column.accessorKey] = checkbox?.checked ?? false;
        }
        if (column.type === "number") {
          const raw = values[column.accessorKey];
          const trimmed =
            typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
          if (trimmed === "") {
            delete values[column.accessorKey];
            return;
          }
          const parsed = Number(trimmed);
          if (!Number.isFinite(parsed)) {
            delete values[column.accessorKey];
            return;
          }
          values[column.accessorKey] = Math.trunc(parsed);
        }
      });

      const submittedData = { ...values, ...images };

      const row_id_at_submit = selectedId;

      const runMutate = async (skip_success_toast?: boolean) => {
        const response = row_id_at_submit
          ? await updateService(row_id_at_submit, submittedData)
          : await createService(submittedData);

        if (!response.ok) {
          toast.error(
            response.message ||
              (row_id_at_submit
                ? (messages.update_error ?? default_update_error)
                : (messages.create_error ?? default_create_error)),
          );
          return;
        }

        if (!skip_success_toast) {
          toast.success(
            row_id_at_submit
              ? (messages.update_success ?? default_update_success)
              : (messages.create_success ?? default_create_success),
          );
        }

        onMutationSuccess?.();

        if (!isTest) {
          setSelectedId(null);
          setIsOpen(false);
        }

        queryClient.invalidateQueries({
          queryKey: ["selectedData"],
        });
      };

      if (!use_undo_toast) {
        try {
          await runMutate();
        } finally {
          release_submit_lock();
        }
        return;
      }

      const pending_message = row_id_at_submit
        ? (messages.update_pending ?? default_update_pending)
        : (messages.create_pending ?? default_create_pending);

      scheduleDefaultFormUndo({
        message: pending_message,
        undo_label: messages.undo_label,
        delay_ms: undo_delay_ms,
        on_commit: () => runMutate(true),
      });

      if (!isTest) {
        setIsOpen(false);
        setSelectedId(null);
      }
      release_submit_lock();
    } catch {
      release_submit_lock();
    }
  };

  useEffect(() => {
    if (!selectedData) return;

    const initialImages = columns
      .filter((column) => column.type === "image")
      .reduce(
        (acc, column) => {
          acc[column.accessorKey] = selectedData[column.accessorKey] ?? null;
          return acc;
        },
        {} as Record<string, string | null>,
      );

    setTimeout(() => {
      setImages(initialImages);
    }, 100);
  }, [selectedData, columns]);

  if (isLoading) {
    return <Loader2 className="size-4 animate-spin" />;
  }
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {filteredColumns.map((column) => (
        <Field key={column.accessorKey}>
          <FieldLabel htmlFor={column.accessorKey}>{column.header}</FieldLabel>
          {column.type === "image" && (
            <ImageInput
              value={images[column.accessorKey]}
              onChange={(value) =>
                setImages({ ...images, [column.accessorKey]: value })
              }
              bucketName={column.bucketName!}
              path={column.accessorKey}
            />
          )}
          {column.type === "text" && (
            <Input
              id={column.accessorKey}
              name={column.accessorKey}
              type="text"
              defaultValue={selectedData?.[column.accessorKey] ?? ""}
            />
          )}
          {column.type === "textarea" && (
            <Textarea
              id={column.accessorKey}
              name={column.accessorKey}
              rows={4}
              defaultValue={selectedData?.[column.accessorKey] ?? ""}
            />
          )}
          {column.type === "number" && (
            <Input
              id={column.accessorKey}
              name={column.accessorKey}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={
                selectedData?.[column.accessorKey] !== undefined &&
                selectedData?.[column.accessorKey] !== null
                  ? String(selectedData[column.accessorKey])
                  : ""
              }
            />
          )}
          {column.type === "link" && (
            <Input
              id={column.accessorKey}
              name={column.accessorKey}
              type="text"
              defaultValue={selectedData?.[column.accessorKey] ?? ""}
            />
          )}

          {column.type === "boolean" && (
            <div className="flex items-center">
              <Checkbox
                id={column.accessorKey}
                name={column.accessorKey}
                defaultChecked={selectedData?.[column.accessorKey] ?? false}
              />
            </div>
          )}
        </Field>
      ))}

      <Button
        type="submit"
        disabled={is_submitting}
        aria-busy={is_submitting}
      >
        Guardar
      </Button>
    </form>
  );
};
