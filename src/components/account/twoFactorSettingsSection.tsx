import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { BackupCodesDialog } from "@/components/account/backupCodesDialog";
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
import { twoFactorService } from "@/services/twoFactor/twoFactorService";
import type { AccountSettings } from "@/types/account.types";
import {
  twoFactorCodeSchema,
  type TwoFactorCodeSchema,
} from "@/validations/account/twoFactorCode.schema";

type TwoFactorSettingsSectionProps = {
  account: AccountSettings;
  onUpdated: () => Promise<void>;
};

export const TwoFactorSettingsSection = ({
  account,
  onUpdated,
}: TwoFactorSettingsSectionProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const activateForm = useForm<TwoFactorCodeSchema>({
    resolver: standardSchemaResolver(twoFactorCodeSchema),
    defaultValues: { code: "" },
  });

  const disableForm = useForm<TwoFactorCodeSchema>({
    resolver: standardSchemaResolver(twoFactorCodeSchema),
    defaultValues: { code: "" },
  });

  const setupMutation = useMutation({
    mutationFn: () => twoFactorService.setup(),
    onSuccess: (response) => {
      if (response.ok && response.data?.qr_code_data_url) {
        setQrCodeUrl(response.data.qr_code_data_url);
        setIsSettingUp(true);
        return;
      }
      toast.error("No se pudo generar el código QR");
    },
    onError: () => toast.error("No se pudo generar el código QR"),
  });

  const handleActivate = async (values: TwoFactorCodeSchema) => {
    const response = await twoFactorService.activate(values.code);
    if (!response.ok) {
      toast.error(response.message || "Código incorrecto");
      return;
    }

    toast.success(response.data?.message ?? "2FA activado correctamente");
    activateForm.reset();
    setQrCodeUrl(null);
    setIsSettingUp(false);

    if (response.data?.backup_codes?.length) {
      setBackupCodes(response.data.backup_codes);
      setShowBackupDialog(true);
    }

    await onUpdated();
  };

  const handleDisable = async (values: TwoFactorCodeSchema) => {
    const response = await twoFactorService.disable(values.code);
    if (!response.ok) {
      toast.error(response.message || "No se pudo desactivar 2FA");
      return;
    }

    toast.success(response.data?.message ?? "2FA desactivado");
    disableForm.reset();
    setQrCodeUrl(null);
    setIsSettingUp(false);
    await onUpdated();
  };

  const handleRegenerate = async () => {
    const response = await twoFactorService.regenerateBackupCodes();
    if (!response.ok || !response.data?.backup_codes?.length) {
      toast.error("No se pudieron regenerar los códigos");
      return;
    }

    setBackupCodes(response.data.backup_codes);
    setShowBackupDialog(true);
    toast.success(response.data.message);
    await onUpdated();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Autenticación en dos pasos (2FA)</CardTitle>
          <CardDescription>
            Protege tu cuenta con un código de verificación desde tu app de
            autenticación.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {account.two_factor_enabled ? (
              <Badge>2FA activado</Badge>
            ) : (
              <Badge variant="outline">2FA desactivado</Badge>
            )}
            {account.two_factor_enabled && (
              <span className="text-muted-foreground text-sm">
                Códigos de respaldo restantes: {account.backup_codes_remaining}
              </span>
            )}
          </div>

          {!account.two_factor_enabled && (
            <div className="flex flex-col gap-4">
              {!isSettingUp && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setupMutation.mutate()}
                  disabled={setupMutation.isPending}
                  aria-label="Configurar autenticación en dos pasos"
                >
                  {setupMutation.isPending
                    ? "Generando QR…"
                    : "Configurar 2FA"}
                </Button>
              )}

              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-4 rounded-lg border p-4">
                  <img
                    src={qrCodeUrl}
                    alt="Código QR para configurar 2FA"
                    className="h-48 w-48"
                  />
                  <p className="text-muted-foreground text-center text-sm">
                    Escanea el código con tu app de autenticación e introduce el
                    código de 6 dígitos.
                  </p>

                  <form
                    onSubmit={activateForm.handleSubmit(handleActivate)}
                    className="flex w-full max-w-xs flex-col gap-3"
                    noValidate
                  >
                    <Controller
                      name="code"
                      control={activateForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="activate-2fa-code">
                            Código de verificación
                          </FieldLabel>
                          <Input
                            id="activate-2fa-code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="000000"
                            aria-invalid={fieldState.invalid}
                            {...field}
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={activateForm.formState.isSubmitting}
                    >
                      Activar 2FA
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}

          {account.two_factor_enabled && (
            <div className="flex flex-col gap-4">
              <form
                onSubmit={disableForm.handleSubmit(handleDisable)}
                className="flex max-w-xs flex-col gap-3"
                noValidate
              >
                <Controller
                  name="code"
                  control={disableForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="disable-2fa-code">
                        Código para desactivar
                      </FieldLabel>
                      <Input
                        id="disable-2fa-code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="000000"
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={disableForm.formState.isSubmitting}
                >
                  Desactivar 2FA
                </Button>
              </form>

              <Button
                type="button"
                variant="outline"
                onClick={handleRegenerate}
                aria-label="Regenerar códigos de respaldo"
              >
                Regenerar códigos de respaldo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <BackupCodesDialog
        open={showBackupDialog}
        onOpenChange={setShowBackupDialog}
        backupCodes={backupCodes}
      />
    </>
  );
};
