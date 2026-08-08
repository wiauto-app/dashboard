import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  FeatureCatalogItem,
  PlanEntitlement,
  PlanEntitlementInput,
} from "../services/billingPlansService";

export interface EntitlementFormEntry {
  value_type: "boolean" | "limit" | "unlimited";
  limit: number;
  bool: boolean;
}

export type EntitlementsFormState = Record<string, EntitlementFormEntry>;

interface PlanEntitlementsFieldsProps {
  catalog: FeatureCatalogItem[];
  value: EntitlementsFormState;
  onChange: (next: EntitlementsFormState) => void;
}

export const buildDefaultEntitlementsState = (
  catalog: FeatureCatalogItem[],
  existing?: PlanEntitlement[] | PlanEntitlementInput[] | null,
): EntitlementsFormState => {
  const by_feature = new Map(
    (existing ?? []).map((item) => [item.feature, item]),
  );

  const state: EntitlementsFormState = {};

  for (const item of catalog) {
    const current = by_feature.get(item.feature);
    if (item.value_type === "boolean") {
      const bool_value =
        current?.value_type === "boolean" &&
        typeof (current.value as { bool?: unknown }).bool === "boolean"
          ? (current.value as { bool: boolean }).bool
          : false;
      state[item.feature] = {
        value_type: "boolean",
        limit: 0,
        bool: bool_value,
      };
      continue;
    }

    if (current?.value_type === "unlimited") {
      state[item.feature] = {
        value_type: "unlimited",
        limit: 0,
        bool: false,
      };
      continue;
    }

    const limit =
      current?.value_type === "limit" &&
      typeof (current.value as { limit?: unknown }).limit === "number"
        ? (current.value as { limit: number }).limit
        : 0;

    state[item.feature] = {
      value_type: "limit",
      limit,
      bool: false,
    };
  }

  return state;
};

export const entitlementsStateToPayload = (
  catalog: FeatureCatalogItem[],
  state: EntitlementsFormState,
): PlanEntitlementInput[] => {
  return catalog.map((item) => {
    const entry = state[item.feature];
    if (item.value_type === "boolean") {
      return {
        feature: item.feature,
        value_type: "boolean",
        value: { bool: entry?.bool ?? false },
      };
    }

    if (entry?.value_type === "unlimited") {
      return {
        feature: item.feature,
        value_type: "unlimited",
        value: { unlimited: true },
      };
    }

    return {
      feature: item.feature,
      value_type: "limit",
      value: { limit: Math.max(0, Number(entry?.limit) || 0) },
    };
  });
};

export const PlanEntitlementsFields = ({
  catalog,
  value,
  onChange,
}: PlanEntitlementsFieldsProps) => {
  if (catalog.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No se pudo cargar el catálogo de capacidades.
      </p>
    );
  }

  const handleLimitChange = (feature: string, limit: number) => {
    onChange({
      ...value,
      [feature]: {
        ...value[feature],
        value_type: "limit",
        limit,
        bool: false,
      },
    });
  };

  const handleUnlimitedChange = (feature: string, unlimited: boolean) => {
    onChange({
      ...value,
      [feature]: {
        ...value[feature],
        value_type: unlimited ? "unlimited" : "limit",
        limit: value[feature]?.limit ?? 0,
        bool: false,
      },
    });
  };

  const handleBoolChange = (feature: string, bool: boolean) => {
    onChange({
      ...value,
      [feature]: {
        value_type: "boolean",
        limit: 0,
        bool,
      },
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {catalog.map((item) => {
        const entry = value[item.feature];
        const is_boolean = item.value_type === "boolean";
        const is_unlimited = entry?.value_type === "unlimited";
        const is_enabled = is_boolean
          ? Boolean(entry?.bool)
          : is_unlimited || (entry?.limit ?? 0) > 0;

        return (
          <div
            key={item.feature}
            className={cn(
              "rounded-lg border bg-background p-4 transition-colors hover:border-primary/40",
              is_enabled && "border-primary/30 bg-primary/5",
            )}
          >
            <div className="mb-3 space-y-1">
              <p className="text-sm font-medium leading-none">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              {item.metered ? (
                <p className="text-xs text-muted-foreground">
                  Consumo medido por periodo
                </p>
              ) : null}
            </div>

            {is_boolean ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Incluido</span>
                <Switch
                  checked={entry?.bool ?? false}
                  onCheckedChange={(checked) =>
                    handleBoolChange(item.feature, !!checked)
                  }
                  aria-label={item.label}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <Field className="flex-1">
                    <FieldLabel className="text-xs text-muted-foreground">
                      Límite
                    </FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      disabled={is_unlimited}
                      className="h-11 text-2xl font-semibold tabular-nums"
                      value={is_unlimited ? "" : (entry?.limit ?? 0)}
                      onChange={(event) =>
                        handleLimitChange(
                          item.feature,
                          Number(event.target.value) || 0,
                        )
                      }
                      aria-label={`Límite de ${item.label}`}
                    />
                  </Field>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Ilimitado</span>
                  <Switch
                    checked={is_unlimited}
                    onCheckedChange={(checked) =>
                      handleUnlimitedChange(item.feature, !!checked)
                    }
                    aria-label={`${item.label} ilimitado`}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
