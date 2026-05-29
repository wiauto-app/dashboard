import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AccountSettings } from "@/types/account.types";

type AccountInfoSectionProps = {
  account: AccountSettings;
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
        <CardDescription>Datos de tu cuenta que no se pueden editar.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-1 text-sm">
          <dt className="text-muted-foreground">Miembro desde</dt>
          <dd className="font-medium">{memberSince}</dd>
        </dl>
      </CardContent>
    </Card>
  );
};
