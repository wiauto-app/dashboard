import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AccountSettings, AuthProvider } from "@/types/account.types";

interface AccountInfoSectionProps {
  account: AccountSettings;
}

const providerLabel: Record<AuthProvider, string> = {
  local: "Email y contraseña",
  google: "Google",
  apple: "Apple",
};

export const AccountInfoSection = ({ account }: AccountInfoSectionProps) => {
  const memberSince = account.created_at
    ? format(new Date(account.created_at), "d 'de' MMMM 'de' yyyy", {
        locale: es,
      })
    : "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información</CardTitle>
        <CardDescription>
          Datos de tu cuenta que no se pueden editar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-1 text-sm">
          <dt className="text-muted-foreground">Miembro desde</dt>
          <dd className="font-medium">{memberSince}</dd>
        </dl>

        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Proveedores de acceso</p>
          <div className="flex flex-wrap items-center gap-2">
            {account.providers.length > 0 ? (
              account.providers.map((provider) => (
                <Badge key={provider} variant="secondary">
                  {providerLabel[provider] ?? provider}
                </Badge>
              ))
            ) : (
              <span className="text-sm">—</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
