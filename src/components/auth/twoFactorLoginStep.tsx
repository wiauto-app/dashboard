import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authServices/AuthService";
import {
  backupCodeSchema,
  formatBackupCode,
} from "@/validations/auth/backupCode.schema";

type TwoFactorLoginStepProps = {
  email: string;
  onSuccess: () => Promise<void>;
  onBack: () => Promise<void>;
};

export const TwoFactorLoginStep = ({
  email,
  onSuccess,
  onBack,
}: TwoFactorLoginStepProps) => {
  const [totp_code, set_totp_code] = useState("");
  const [backup_code, set_backup_code] = useState("");
  const [use_backup_code, set_use_backup_code] = useState(false);
  const [is_submitting, set_is_submitting] = useState(false);

  const handleVerifyTotp = async (code: string) => {
    if (code.length !== 6 || is_submitting) {
      return;
    }

    set_is_submitting(true);
    const response = await authService.verifyTwoFactor(code);
    set_is_submitting(false);

    if (response.ok && response.data?.data?.type === "session") {
      toast.success("Verificación completada");
      await onSuccess();
      return;
    }

    toast.error(response.message || "Código incorrecto");
    set_totp_code("");
  };

  const handleVerifyBackup = async () => {
    const formatted_code = formatBackupCode(backup_code);
    const parsed = backupCodeSchema.safeParse({ code: formatted_code });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Código inválido");
      return;
    }

    set_is_submitting(true);
    const response = await authService.verifyBackupCode(parsed.data.code);
    set_is_submitting(false);

    if (response.ok && response.data?.data?.type === "session") {
      toast.success("Código de respaldo validado");
      await onSuccess();
      return;
    }

    toast.error(response.message || "Código de respaldo incorrecto");
    set_backup_code("");
  };

  const handleBack = async () => {
    await authService.logout();
    set_totp_code("");
    set_backup_code("");
    set_use_backup_code(false);
    await onBack();
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">
        Verificación en dos pasos
      </h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Ingresá el código de tu autenticador para{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      {!use_backup_code ? (
        <div className="flex flex-col items-center gap-6">
          <InputOTP
            maxLength={6}
            value={totp_code}
            onChange={(value) => {
              set_totp_code(value);
              if (value.length === 6) {
                void handleVerifyTotp(value);
              }
            }}
            disabled={is_submitting}
            aria-label="Código de verificación de 6 dígitos"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            type="button"
            className="h-11 w-full text-base"
            disabled={is_submitting || totp_code.length !== 6}
            onClick={() => void handleVerifyTotp(totp_code)}
          >
            Verificar
          </Button>

          <button
            type="button"
            className="text-sm text-primary underline-offset-4 hover:underline"
            onClick={() => set_use_backup_code(true)}
          >
            Usar código de respaldo
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Input
            value={backup_code}
            onChange={(event) =>
              set_backup_code(formatBackupCode(event.target.value))
            }
            placeholder="XXXX-XXXX"
            autoComplete="one-time-code"
            aria-label="Código de respaldo"
            className="h-11 text-center font-mono uppercase tracking-widest"
            maxLength={9}
          />

          <Button
            type="button"
            className="h-11 w-full text-base"
            disabled={is_submitting}
            onClick={() => void handleVerifyBackup()}
          >
            Verificar código de respaldo
          </Button>

          <button
            type="button"
            className="text-sm text-primary underline-offset-4 hover:underline"
            onClick={() => set_use_backup_code(false)}
          >
            Usar código del autenticador
          </button>
        </div>
      )}

      <button
        type="button"
        className="mt-8 flex w-full items-center justify-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => void handleBack()}
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
};
