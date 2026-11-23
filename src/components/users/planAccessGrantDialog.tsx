import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import {
  CalendarClock,
  ExternalLink,
  ShieldCheck,
  Store,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import type {
  DealershipMemberRole,
  Profile,
} from "@/types/profiles.types";
import { billingPlansService } from "@/components/billing/services/billingPlansService";
import { planAccessGrantService } from "@/services/users/planAccessGrantService";
import {
  DealershipMinimalFields,
  type DealershipMinimalFieldsForm,
} from "@/components/dealerships/dealershipMinimalFields";
import { DEFAULT_PHONE_CODE } from "@/components/ui/phoneInput";
import {
  dealershipMinimalSchema,
  toDealershipMinimalPayload,
} from "@/validations/resources/dealership-minimal.schema";
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
import { IconButton } from "@/components/ui/iconButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DEALERSHIP_ROLE_LABEL: Record<DealershipMemberRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
};

const dealershipFormSchema = z.object({ dealership: dealershipMinimalSchema });

const toLocalDateTimeInput = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

/** Prellena el concesionario con lo que ya sabemos del perfil (todo editable). */
const dealershipDefaultsFromProfile = (
  profile: Profile,
): DealershipMinimalFieldsForm => ({
  dealership: {
    name:
      [profile.name, profile.last_name].filter(Boolean).join(" ").trim() ||
      profile.user.email,
    email: profile.user.email,
    phone: {
      phone_code: profile.phone_code ?? DEFAULT_PHONE_CODE,
      phone: profile.phone ?? "",
    },
    address: "",
  },
});

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

  const dealership_form = useForm<DealershipMinimalFieldsForm>({
    resolver: standardSchemaResolver(dealershipFormSchema),
    defaultValues: dealershipDefaultsFromProfile(profile),
  });

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

  const plans = (plans_query.data?.data ?? []).filter((plan) => plan.is_active);
  const current_grant = grant_query.data ?? null;
  const selected_plan_id = plan_id ?? current_grant?.plan_id ?? "";
  const selected_plan = plans.find((plan) => plan.id === selected_plan_id);
  const selected_expires_at =
    expires_at ?? toLocalDateTimeInput(current_grant?.expires_at ?? null);
  const selected_reason = reason ?? current_grant?.reason ?? "";

  const existing_dealership = profile.dealership ?? null;
  const is_dealership_plan = selected_plan?.audience === "dealership";
  const must_create_dealership = is_dealership_plan && !existing_dealership;
  const blocked_by_role =
    is_dealership_plan &&
    existing_dealership !== null &&
    existing_dealership.role !== "owner";

  const resetLocalState = () => {
    setPlanId(undefined);
    setExpiresAt(undefined);
    setReason(undefined);
    dealership_form.reset(dealershipDefaultsFromProfile(profile));
  };

  const handleAssign = async () => {
    if (!selected_plan_id) {
      toast.error("Selecciona un plan");
      return;
    }
    if (blocked_by_role) {
      return;
    }
    if (must_create_dealership) {
      const is_valid = await dealership_form.trigger();
      if (!is_valid) {
        toast.error("Revisa los datos del concesionario");
        return;
      }
    }
    setIsSaving(true);
    try {
      const response = await planAccessGrantService.assign(profile.id, {
        plan_id: selected_plan_id,
        expires_at: selected_expires_at
          ? new Date(selected_expires_at).toISOString()
          : null,
        reason: selected_reason.trim() || null,
        ...(must_create_dealership
          ? {
              dealership: toDealershipMinimalPayload(
                dealership_form.getValues("dealership"),
              ),
            }
          : {}),
      });
      if (!response.ok) {
        toast.error(response.message || "No se pudo asignar el plan");
        return;
      }
      toast.success(
        must_create_dealership
          ? "Concesionario creado y plan asignado sin cobro"
          : current_grant
            ? "Acceso al plan actualizado"
            : "Plan asignado sin cobro",
      );
      await grant_query.refetch();
      onSuccess?.();
      setOpen(false);
      resetLocalState();
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
      resetLocalState();
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
          resetLocalState();
        }
      }}
    >
      <DialogTrigger>
        <IconButton
          text="Asignar plan sin cobro"
          type="button"
          variant="outline"
          size="icon-sm"
          ariaLabel={`Asignar plan a ${display_name}`}
        >
          <ShieldCheck className="size-4 text-emerald-600" />
        </IconButton>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
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

          {is_dealership_plan && existing_dealership ? (
            <div
              className={
                blocked_by_role
                  ? "flex flex-col gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5"
                  : "flex flex-col gap-2 rounded-lg border bg-muted/30 px-3 py-2.5"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Store className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Concesionario vinculado
                    </p>
                    <p className="truncate font-medium">
                      {existing_dealership.name}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary">
                    {DEALERSHIP_ROLE_LABEL[existing_dealership.role]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={
                      <Link
                        to="/dealership"
                        search={{ id: existing_dealership.id }}
                        aria-label={`Ver concesionario ${existing_dealership.name}`}
                      />
                    }
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              </div>
              {blocked_by_role ? (
                <p className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                  Este usuario no es propietario del concesionario. Asigna el
                  plan al propietario para no cambiar el plan de todo el
                  concesionario.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  El plan se vinculará a este concesionario.
                </p>
              )}
            </div>
          ) : null}

          {must_create_dealership ? (
            <section className="flex flex-col gap-3 rounded-xl border p-3">
              <div className="flex flex-col gap-1">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Store className="size-4" />
                  Crear concesionario
                </h3>
                <p className="text-xs text-muted-foreground">
                  El usuario no tiene concesionario. Se creará con estos datos
                  y se le asignará el plan. Logo, portada y mapa se completan
                  después en Concesionarios.
                </p>
              </div>
              <DealershipMinimalFields
                control={dealership_form.control}
                idPrefix={`grant-dealership-${profile.id}`}
              />
            </section>
          ) : null}

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
              blocked_by_role ||
              grant_query.isLoading
            }
          >
            <ShieldCheck className="size-4" />
            {is_saving
              ? "Guardando…"
              : must_create_dealership
                ? "Crear concesionario y asignar"
                : current_grant
                  ? "Actualizar acceso"
                  : "Asignar sin cobro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
