import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Profile } from "@/types/profiles.types";
import { billingPlansService } from "@/components/billing/services/billingPlansService";
import { planAccessGrantService } from "@/services/users/planAccessGrantService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const toLocalDateTimeInput = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export function PlanAccessGrantDialog({
  profile,
  onSuccess,
}: {
  profile: Profile;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [plan_id, setPlanId] = useState<string>();
  const [expires_at, setExpiresAt] = useState<string>();
  const [reason, setReason] = useState<string>();
  const [is_saving, setIsSaving] = useState(false);
  const [is_revoking, setIsRevoking] = useState(false);

  const plans_query = useQuery({
    queryKey: ["subscription-plans", "access-grant-selector"],
    queryFn: () => billingPlansService.findAll({ page: 1, limit: 100 }),
    enabled: open,
  });
  const grant_query = useQuery({
    queryKey: ["plan-access-grant", profile.id],
    queryFn: () => planAccessGrantService.getActive(profile.id),
    enabled: open,
  });

  const plans = useMemo(
    () => (plans_query.data?.data ?? []).filter((plan) => plan.is_active),
    [plans_query.data],
  );
  const current_grant = grant_query.data ?? null;
  const selected_plan_id = plan_id ?? current_grant?.plan_id ?? "";
  const selected_expires_at =
    expires_at ?? toLocalDateTimeInput(current_grant?.expires_at ?? null);
  const selected_reason = reason ?? current_grant?.reason ?? "";

  const handleAssign = async () => {
    if (!selected_plan_id) {
      toast.error("Selecciona un plan");
      return;
    }
    setIsSaving(true);
    try {
      const response = await planAccessGrantService.assign(profile.id, {
        plan_id: selected_plan_id,
        expires_at: selected_expires_at
          ? new Date(selected_expires_at).toISOString()
          : null,
        reason: selected_reason.trim() || null,
      });
      if (!response.ok) {
        toast.error(response.message || "No se pudo asignar el plan");
        return;
      }
      toast.success(
        current_grant
          ? "Acceso al plan actualizado"
          : "Plan asignado sin cobro",
      );
      await grant_query.refetch();
      onSuccess?.();
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      const response = await planAccessGrantService.revoke(profile.id);
      if (!response.ok) {
        toast.error(response.message || "No se pudo revocar el acceso");
        return;
      }
      toast.success("Acceso gratuito revocado");
      await grant_query.refetch();
      onSuccess?.();
      setOpen(false);
    } finally {
      setIsRevoking(false);
    }
  };

  const display_name =
    [profile.name, profile.last_name].filter(Boolean).join(" ") ||
    profile.user.email;

  return (
    <Dialog
      open={open}
      onOpenChange={(next_open) => {
        setOpen(next_open);
        if (!next_open) {
          setPlanId(undefined);
          setExpiresAt(undefined);
          setReason(undefined);
        }
      }}
    >
      <DialogTrigger>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Asignar plan a ${display_name}`}
          title="Asignar plan sin cobro"
        >
          <ShieldCheck className="size-4 text-emerald-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle>Acceso gratuito a un plan</DialogTitle>
              <DialogDescription className="mt-1 truncate">
                {display_name} · {profile.user.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {current_grant ? (
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5">
            <div>
              <p className="text-xs text-muted-foreground">Acceso vigente</p>
              <p className="font-medium">{current_grant.plan_name}</p>
            </div>
            <Badge variant="secondary">
              Versión {current_grant.plan_version}
            </Badge>
          </div>
        ) : null}

        <div className="grid gap-4">
          <Field>
            <FieldLabel htmlFor={`grant-plan-${profile.id}`}>Plan</FieldLabel>
            <Select
              items={plans.map((i) => ({
                label: i.name,
                value: i.id,
              }))}
              value={selected_plan_id}
              onValueChange={(value) => setPlanId(value ?? "")}
            >
              <SelectTrigger id={`grant-plan-${profile.id}`} className="w-full">
                <SelectValue
                  placeholder={
                    plans_query.isLoading
                      ? "Cargando planes…"
                      : "Selecciona un plan"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={`grant-expiry-${profile.id}`}>
              Vencimiento opcional
            </FieldLabel>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={`grant-expiry-${profile.id}`}
                type="datetime-local"
                min={toLocalDateTimeInput(new Date().toISOString())}
                value={selected_expires_at}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Sin fecha, el acceso permanece hasta que un administrador lo
              revoque.
            </p>
          </Field>

          <Field>
            <FieldLabel htmlFor={`grant-reason-${profile.id}`}>
              Motivo
            </FieldLabel>
            <Textarea
              id={`grant-reason-${profile.id}`}
              value={selected_reason}
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ej. cortesía comercial, cuenta demo o convenio"
            />
          </Field>
        </div>

        <DialogFooter className="border-t pt-4 sm:justify-between">
          <div>
            {current_grant ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRevoke}
                disabled={is_saving || is_revoking}
              >
                <Trash2 className="size-4" />
                {is_revoking ? "Revocando…" : "Revocar acceso"}
              </Button>
            ) : null}
          </div>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={
              !selected_plan_id ||
              is_saving ||
              is_revoking ||
              grant_query.isLoading
            }
          >
            <ShieldCheck className="size-4" />
            {is_saving
              ? "Guardando…"
              : current_grant
                ? "Actualizar acceso"
                : "Asignar sin cobro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
