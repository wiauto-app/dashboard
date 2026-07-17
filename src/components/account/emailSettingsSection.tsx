import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { accountService } from "@/services/account/accountService";
import type {
  AccountSettings,
  AuthProvider,
} from "@/types/account.types";
import {
  updateEmailSchema,
  type UpdateEmailSchema,
} from "@/validations/account/updateEmail.schema";

interface EmailSettingsSectionProps {
  account: AccountSettings;
  onUpdated: () => Promise<void>;
}

const providerLabel: Record<AuthProvider, string> = {
  local: "Email y contraseña",
  google: "Google",
  apple: "Apple",
};

export const EmailSettingsSection = ({
  account,
  onUpdated,
}: EmailSettingsSectionProps) => {
  const hasPassword = account.has_password;
  const linkedProviders = account.providers.filter(
    (provider) => provider !== "local",
  );

  const form = useForm<UpdateEmailSchema>({
    resolver: standardSchemaResolver(updateEmailSchema),
    defaultValues: { email: account.email },
  });

  useEffect(() => {
    form.reset({ email: account.email });
  }, [account.email, form]);

  const handleSubmit = async (values: UpdateEmailSchema) => {
    const response = await accountService.updateMyEmail(values);

    if (response.ok) {
      toast.success(
        accountService.getResponseMessage(
          response,
          "Email actualizado correctamente",
        ),
      );
      await onUpdated();
      return;
    }

    toast.error(
      accountService.getResponseMessage(
        response,
        "No se pudo actualizar el correo",
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuenta</CardTitle>
        <CardDescription>
          {hasPassword
            ? "Correo de acceso y estado de verificación."
            : "Tu cuenta está vinculada a proveedores externos."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {account.providers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {account.providers.map((provider) => (
              <Badge key={provider} variant="secondary">
                {providerLabel[provider] ?? provider}
              </Badge>
            ))}
            {!hasPassword && (
              <span className="text-sm text-muted-foreground">
                {account.email}
              </span>
            )}
          </div>
        )}

        {linkedProviders.length > 0 && hasPassword && (
          <p className="text-muted-foreground text-xs">
            También puedes iniciar sesión con{" "}
            {linkedProviders
              .map((provider) => providerLabel[provider] ?? provider)
              .join(" o ")}
            .
          </p>
        )}

        {hasPassword && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {account.is_email_verified ? (
                <Badge variant="secondary">Correo verificado</Badge>
              ) : (
                <Badge variant="outline">Verificación pendiente</Badge>
              )}
            </div>

            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="account-email">
                      Correo electrónico
                    </FieldLabel>
                    <Input
                      id="account-email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="correo@ejemplo.com"
                      {...field}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <p className="text-muted-foreground text-xs">
                Al cambiar el correo deberás verificarlo de nuevo.
              </p>

              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Guardando…"
                    : "Actualizar correo"}
                </Button>
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
};
