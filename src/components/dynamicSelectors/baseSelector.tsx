import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

export interface BaseSelectProps<T> {
  items: T[];
  value?: string;
  onChange: (value: string | undefined) => void;
  labelKey: keyof T;
  valueKey: keyof T;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  /** Texto del ítem deshabilitado cuando `items` está vacío */
  emptyLabel?: string;
  /**
   * Acciones a la derecha de cada opción (editar, eliminar, menú, etc.).
   * Usa `type="button"` y, si hace falta, `onPointerDown={(e) => e.stopPropagation()}` en controles interactivos.
   */
  renderItemTrailing?: (item: T) => ReactNode;
  /** Contenido bajo la lista (por ejemplo botón “Nuevo”) */
  renderFooter?: () => ReactNode;
  /**
   * Atajo: si `create` es true y existe `onCreate`, se muestra un botón estándar al pie.
   * Preferible usar `renderFooter` para composición completa.
   */
  showExtraActions?: {
    create?: boolean;
    delete?: boolean;
    update?: boolean;
    read?: boolean;
  };
  onCreate?: () => void;
  disabled?: boolean;
}

export function BaseSelector<T>({
  items,
  value,
  onChange,
  labelKey,
  valueKey,
  placeholder,
  triggerClassName,
  contentClassName,
  emptyLabel,
  renderItemTrailing,
  renderFooter,
  showExtraActions,
  onCreate,
  disabled = false,
}: BaseSelectProps<T>) {
  const resolvedPlaceholder = placeholder ?? "Seleccionar";
  const resolvedEmptyLabel = emptyLabel ?? "No hay datos";

  const showLegacyCreate =
    Boolean(showExtraActions?.create && onCreate && !renderFooter);

  /** Radix Select en modo controlado falla si `value` es "" o no existe en `items`. */
  const resolvedSelectValue = useMemo(() => {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) return undefined;
    if (items.length === 0) return undefined;
    const exists = items.some((item) => String(item[valueKey]) === raw);
    return exists ? raw : undefined;
  }, [value, items, valueKey]);

  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onCreate?.();
  };

  return (
    <Select
      value={resolvedSelectValue}
      onValueChange={(next_value) => {
        onChange(next_value ?? undefined);
      }}
      disabled={disabled}
      items={items.map((item) => ({
        label: String(item[labelKey]),
        value: String(item[valueKey]),
      }))}
    >
      <SelectTrigger className={cn("min-w-0 w-full", triggerClassName)}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>

      <SelectContent className={cn("max-h-[240px] overflow-y-auto", contentClassName)}>
        
        {items.length === 0 ? (
          <SelectItem value="__empty__" disabled className="opacity-70">
            {resolvedEmptyLabel}
          </SelectItem>
        ) : (
          items.map((item) => {
            const itemValue = String(item[valueKey]);
            const trailing = renderItemTrailing?.(item);

            if (trailing) {
              return (
                <div
                  key={itemValue}
                  className="flex min-w-0 w-full items-center gap-1 pr-1"
                >
                  <SelectItem value={itemValue} className="min-w-0 flex-1">
                    <span className="truncate">{String(item[labelKey])}</span>
                  </SelectItem>
                  <div className="flex shrink-0 items-center gap-0.5">{trailing}</div>
                </div>
              );
            }

            return (
              <SelectItem key={itemValue} value={itemValue}>
                {String(item[labelKey])}
              </SelectItem>
            );
          })
        )}

        {renderFooter?.()}

        {showLegacyCreate ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-8 w-full"
            onClick={handleCreateClick}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden />
            Crear
          </Button>
        ) : null}
      </SelectContent>
    </Select>
  );
}
