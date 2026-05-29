import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { AccountInfoSection } from "@/components/account/accountInfoSection";
import { EmailSettingsSection } from "@/components/account/emailSettingsSection";
import { PasswordSettingsSection } from "@/components/account/passwordSettingsSection";
import { ProfileSettingsSection } from "@/components/account/profileSettingsSection";
import { TwoFactorSettingsSection } from "@/components/account/twoFactorSettingsSection";
import { useAuth } from "@/hooks/useAuth";
import { accountService } from "@/services/account/accountService";

export const Route = createFileRoute("/_authenticated/profile/config")({
  component: ProfileConfigPage,
});

function ProfileConfigPage() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const {
    data: account,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["account-settings"],
    queryFn: async () => {
      const response = await accountService.getAccountSettings();
      if (!response.ok || !response.data) {
        throw new Error("No se pudieron cargar los datos de la cuenta");
      }
      return response.data;
    },
  });

  const handleUpdated = async () => {
    await queryClient.invalidateQueries({ queryKey: ["account-settings"] });
    await refreshUser();
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-48 items-center justify-center"
        role="status"
        aria-label="Cargando configuración"
      >
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="space-y-2">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-ink">
          Configuración
        </h1>
        <p className="text-sm text-destructive">
          No se pudieron cargar los datos de tu cuenta. Intenta recargar la
          página.
        </p>
      </div>
    );
  }

  const isLocal = account.provider === "local";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-8">
      <div className="space-y-1">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-ink">
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra tu perfil, cuenta y seguridad.
        </p>
      </div>

      <ProfileSettingsSection account={account} onUpdated={handleUpdated} />
      <EmailSettingsSection account={account} onUpdated={handleUpdated} />
      {isLocal && <PasswordSettingsSection />}
      <TwoFactorSettingsSection account={account} onUpdated={handleUpdated} />
      <AccountInfoSection account={account} />
    </div>
  );
}

/*
U788-HTWZ
T8H4-J4N6
CPSQ-NWRF
3E2Y-22N7
VFLD-UXSM
MWQV-ZQVX
PA25-QFQJ
A5FQ-VUHC
*/
