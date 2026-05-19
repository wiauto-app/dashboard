import { SuspensionDurationSelector } from "../dynamicSelectors/suspensionDurationSelector";
import { Textarea } from "../ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { SuspendUserSchema } from "@/types/user.types";
import { suspendUserSchema } from "@/validations/resources/suspend-user.schema";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { suspendUserService } from "@/services/users/suspendUserService";
import { toast } from "sonner";

export const SuspendUserForm = ({
  onSuccess,
  targetUserId,
}: {
  onSuccess?: () => void;
  targetUserId: string;
}) => {
  const form = useForm<SuspendUserSchema>({
    resolver: standardSchemaResolver(suspendUserSchema),
    defaultValues: {
      suspension_duration_type_id: "",
      suspension_reason: "",
    },
  });

  const onSubmit = async (data: SuspendUserSchema) => {
    const response = await suspendUserService.suspendUser(targetUserId, data);
    if (response.ok) {
      toast.success("Usuario suspendido correctamente");
      onSuccess?.();
    } else {
      console.log(response);
      toast.error("Error al suspender el usuario");
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Suspender usuario</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona la duración de la suspensión y el motivo
        </p>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="suspension_duration_type_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Duración de la suspensión
              </FieldLabel>
              <SuspensionDurationSelector
                onChange={field.onChange}
                value={field.value}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="suspension_reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Motivo de la suspensión
              </FieldLabel>
              <Textarea {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit">Suspender usuario</Button>
      </form>
    </div>
  );
};
