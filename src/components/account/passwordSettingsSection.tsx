import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/passwordInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { accountService } from "@/services/account/accountService";
import {
  updatePasswordSchema,
  type UpdatePasswordSchema,
} from "@/validations/account/updatePassword.schema";

export const PasswordSettingsSection = () => {
  const form = useForm<UpdatePasswordSchema>({
    resolver: standardSchemaResolver(updatePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
    },
  });

  const handleSubmit = async (values: UpdatePasswordSchema) => {
    const response = await accountService.updateMyPassword(values);

    if (response.ok) {
      toast.success(
        accountService.getResponseMessage(
          response,
          "Contraseña actualizada correctamente",
        ),
      );
      form.reset({ current_password: "", password: "" });
      return;
    }

    toast.error(
      accountService.getResponseMessage(
        response,
        "No se pudo actualizar la contraseña",
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contraseña</CardTitle>
        <CardDescription>
          Actualiza tu contraseña de acceso. Necesitas la contraseña actual.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col gap-4">
        <CardContent className="flex flex-col gap-4">
          <Controller
            name="current_password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="current-password">
                  Contraseña actual
                </FieldLabel>
                <PasswordInput
                  id="current-password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Contraseña actual"
                  {...field}
                />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Nueva contraseña"
                  {...field}
                />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardContent>

        <CardFooter className="justify-end ">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Guardando…"
              : "Cambiar contraseña"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
