import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  billingPlansService,
  type SubscriptionPlan,
} from "@/components/billing/services/billingPlansService";
import {
  PlanEntitlementsFields,
  buildDefaultEntitlementsState,
  entitlementsStateToPayload,
  type EntitlementsFormState,
} from "@/components/billing/forms/planEntitlementsFields";
import {
  PLAN_LEAD_STATUS_LABELS,
  planLeadRequestsService,
  type PlanLeadInterval,
  type PlanLeadRequest,
  type PlanLeadStatus,
} from "../services/planLeadRequestsService";

interface PlanLeadProposalFormProps {
  lead: PlanLeadRequest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const centsToEuros = (amount_cents: number) => amount_cents / 100;
const eurosToCents = (amount_euros: number) => Math.round(amount_euros * 100);

export const PlanLeadProposalForm = ({
  lead,
  onSuccess,
  onCancel,
}: PlanLeadProposalFormProps) => {
  const { data: plans_page } = useQuery({
    queryKey: ["subscription-plans", "proposal-select"],
    queryFn: () => billingPlansService.findAll({ page: 1, limit: 100 }),
  });

  const { data: feature_catalog = [] } = useQuery({
    queryKey: ["billing-feature-catalog"],
    queryFn: () => billingPlansService.getFeatureCatalog(),
  });

  const { data: lead_response } = useQuery({
    queryKey: ["plan-lead-request", lead.id],
    queryFn: () => planLeadRequestsService.findOne(lead.id),
  });

  const detail = lead_response?.data ?? lead;
  const plans = (plans_page?.data ?? []) as SubscriptionPlan[];

  const [status, set_status] = useState<PlanLeadStatus>(detail.status);
  const [base_plan_id, set_base_plan_id] = useState(detail.base_plan_id ?? "");
  const [price_euros, set_price_euros] = useState(
    detail.proposed_price_cents
      ? centsToEuros(detail.proposed_price_cents)
      : 0,
  );
  const [interval, set_interval] = useState<PlanLeadInterval>(
    detail.proposed_interval ?? "month",
  );
  const [notes, set_notes] = useState(detail.proposal_notes ?? "");
  const [entitlements_state, set_entitlements_state] =
    useState<EntitlementsFormState>({});
  const [is_submitting, set_is_submitting] = useState(false);

  useEffect(() => {
    set_status(detail.status);
    set_base_plan_id(detail.base_plan_id ?? "");
    set_price_euros(
      detail.proposed_price_cents
        ? centsToEuros(detail.proposed_price_cents)
        : 0,
    );
    set_interval(detail.proposed_interval ?? "month");
    set_notes(detail.proposal_notes ?? "");
  }, [detail]);

  useEffect(() => {
    if (feature_catalog.length === 0) {
      return;
    }
    set_entitlements_state(
      buildDefaultEntitlementsState(
        feature_catalog,
        detail.proposed_overrides,
      ),
    );
  }, [feature_catalog, detail.proposed_overrides]);

  const handleUpdateStatus = async () => {
    const response = await planLeadRequestsService.update(lead.id, { status });
    if (!response.ok) {
      toast.error(response.message || "No se pudo actualizar el estado");
      return;
    }
    toast.success("Estado actualizado");
    onSuccess?.();
  };

  const handleSubmitProposal = async () => {
    if (!base_plan_id) {
      toast.error("Selecciona un plan base");
      return;
    }
    if (price_euros < 1) {
      toast.error("El precio propuesto debe ser al menos 1 €");
      return;
    }

    set_is_submitting(true);
    const response = await planLeadRequestsService.createProposal(lead.id, {
      base_plan_id,
      proposed_price_cents: eurosToCents(price_euros),
      proposed_interval: interval,
      proposal_notes: notes.trim() || null,
      proposed_overrides: entitlementsStateToPayload(
        feature_catalog,
        entitlements_state,
      ),
    });
    set_is_submitting(false);

    if (!response.ok) {
      toast.error(response.message || "No se pudo enviar la propuesta");
      return;
    }

    toast.success("Propuesta enviada");
    onSuccess?.();
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
      <div>
        <h3 className="text-lg font-semibold">Solicitud de {detail.name}</h3>
        <p className="text-sm text-muted-foreground">
          {detail.email} · {detail.phone} · Flota: {detail.cars_quantity}
        </p>
        {detail.message ? (
          <p className="mt-2 text-sm rounded-md border bg-muted/40 p-3">
            {detail.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Estado</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) => set_status(value as PlanLeadStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PLAN_LEAD_STATUS_LABELS) as PlanLeadStatus[]).map(
                (key) => (
                  <SelectItem key={key} value={key}>
                    {PLAN_LEAD_STATUS_LABELS[key]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={handleUpdateStatus}>
            Guardar estado
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <h4 className="font-semibold">Propuesta comercial</h4>
          <p className="text-sm text-muted-foreground">
            Define el plan base, el precio y las capacidades personalizadas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field className="md:col-span-2">
            <FieldLabel>Plan base</FieldLabel>
            <Select
              value={base_plan_id || undefined}
              onValueChange={set_base_plan_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un plan" />
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
            <FieldLabel>Precio (€)</FieldLabel>
            <Input
              type="number"
              min={1}
              step={0.01}
              value={price_euros}
              onChange={(event) =>
                set_price_euros(Number(event.target.value) || 0)
              }
              aria-label="Precio propuesto en euros"
            />
          </Field>

          <Field>
            <FieldLabel>Intervalo</FieldLabel>
            <Select
              value={interval}
              onValueChange={(value) =>
                set_interval(value as PlanLeadInterval)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Intervalo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensual</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
                <SelectItem value="one_time">Pago único</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Notas de la propuesta</FieldLabel>
            <Textarea
              value={notes}
              onChange={(event) => set_notes(event.target.value)}
              placeholder="Condiciones, alcance o comentarios para el cliente"
              aria-label="Notas de la propuesta"
            />
          </Field>
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium">Capacidades (overrides)</h5>
          <PlanEntitlementsFields
            catalog={feature_catalog}
            value={entitlements_state}
            onChange={set_entitlements_state}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleSubmitProposal}
          disabled={is_submitting}
        >
          {is_submitting ? "Enviando…" : "Enviar propuesta"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cerrar
          </Button>
        ) : null}
      </div>
    </div>
  );
};
