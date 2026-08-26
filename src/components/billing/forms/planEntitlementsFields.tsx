import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BrainCircuit, CarFront, Layers, Search, Users } from "lucide-react";
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
  variant?: "cards" | "builder";
}

const entitlement_groups = [
  {
    id: "catalog",
    label: "Catálogo y contenido",
    description: "Publicación, multimedia y visibilidad de los anuncios.",
    icon: CarFront,
    features: [
      "vehicles",
      "photos_per_vehicle",
      "videos_per_vehicle",
      "featured_listings",
      "video_upload",
    ],
  },
  {
    id: "team",
    label: "Equipo y gestión",
    description: "Usuarios y herramientas operativas del concesionario.",
    icon: Users,
    features: ["users", "dismissed_vehicles", "advanced_listing_editor"],
  },
  {
    id: "intelligence",
    label: "IA y analítica",
    description: "Consumo de IA, generación y estadísticas avanzadas.",
    icon: BrainCircuit,
    features: ["ai_requests", "ai_generation", "statistics"],
  },
] as const;

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
  variant = "cards",
}: PlanEntitlementsFieldsProps) => {
  const [search, set_search] = useState("");

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

  if (variant === "builder") {
    const normalized_search = search.trim().toLocaleLowerCase("es");
    const filtered_catalog = catalog.filter((item) =>
      `${item.label} ${item.description}`
        .toLocaleLowerCase("es")
        .includes(normalized_search),
    );
    const grouped_features = new Set<string>(
      entitlement_groups.flatMap((group) => [...group.features]),
    );
    const groups = [
      ...entitlement_groups.map((group) => ({
        ...group,
        items: filtered_catalog.filter((item) =>
          new Set<string>(group.features).has(item.feature),
        ),
      })),
      {
        id: "other",
        label: "Otras capacidades",
        description: "Capacidades adicionales configuradas en el catálogo.",
        icon: LayersIcon,
        features: [] as readonly string[],
        items: filtered_catalog.filter(
          (item) => !grouped_features.has(item.feature),
        ),
      },
    ].filter((group) => group.items.length > 0);

    return (
      <div className="flex flex-col gap-4">
        <InputGroup className="h-10 max-w-md bg-background">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => set_search(event.target.value)}
            placeholder="Buscar capacidad…"
            aria-label="Buscar capacidad"
          />
        </InputGroup>

        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No hay capacidades que coincidan con la búsqueda.
          </div>
        ) : (
          groups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section
                key={group.id}
                className="overflow-hidden rounded-xl border bg-background"
              >
                <header className="flex items-center gap-3 border-b bg-muted/20 px-4 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GroupIcon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium">{group.label}</h4>
                    <p className="text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {group.items.length} capacidades
                  </span>
                </header>

                <div className="divide-y">
                  {group.items.map((item) => {
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
                          "grid gap-4 px-4 py-3.5 transition-colors md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
                          is_enabled && "bg-primary/[0.025]",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.label}</p>
                            {item.metered ? (
                              <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
                                Medido
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        {is_boolean ? (
                          <label className="flex min-w-36 items-center justify-between gap-4 rounded-lg border bg-background px-3 py-2">
                            <span className="text-sm text-muted-foreground">
                              Incluido
                            </span>
                            <Switch
                              checked={entry?.bool ?? false}
                              onCheckedChange={(checked) =>
                                handleBoolChange(item.feature, !!checked)
                              }
                              aria-label={item.label}
                            />
                          </label>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-[9rem_7rem]">
                            <Select
                              value={is_unlimited ? "unlimited" : "limit"}
                              onValueChange={(next) =>
                                handleUnlimitedChange(
                                  item.feature,
                                  next === "unlimited",
                                )
                              }
                            >
                              <SelectTrigger className="w-full" aria-label={`Tipo de límite de ${item.label}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="limit">Con límite</SelectItem>
                                  <SelectItem value="unlimited">Ilimitado</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {is_unlimited ? (
                              <div className="flex h-9 items-center justify-center rounded-md border bg-muted/30 px-3 text-sm text-muted-foreground">
                                Sin límite
                              </div>
                            ) : (
                              <Input
                                type="number"
                                min={0}
                                value={entry?.limit ?? 0}
                                onChange={(event) =>
                                  handleLimitChange(
                                    item.feature,
                                    Number(event.target.value) || 0,
                                  )
                                }
                                aria-label={`Límite de ${item.label}`}
                                className="tabular-nums"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    );
  }

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

const LayersIcon = Layers;
