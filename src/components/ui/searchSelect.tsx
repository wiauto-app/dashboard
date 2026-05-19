import { useEffect, useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type SelectOption = {
  label: string;
  value: string;
};

type SearchSelectProps = {
  value?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  debounceMs?: number;
  onChange?: (value: string, option: SelectOption) => void;
  searchFn: (query: string) => Promise<SelectOption[]>;
  /** Resuelve label cuando `value` viene del exterior (edición, defaultValues). */
  resolveOption?: (value: string) => Promise<SelectOption | undefined>;
};

export const SearchSelect = ({
  value,
  placeholder = "Seleccionar opción",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  disabled,
  debounceMs = 500,
  onChange,
  searchFn,
  resolveOption,
}: SearchSelectProps) => {
  const instance_id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [query, debounceMs]);

  const needs_resolve =
    Boolean(value) &&
    Boolean(resolveOption) &&
    selectedOption?.value !== value;

  const { data: resolvedOption, isLoading: isResolvingLabel } = useQuery({
    queryKey: ["search-select-resolve", instance_id, value],
    queryFn: () => resolveOption!(value!),
    enabled: needs_resolve,
  });

  const {
    data: options = [],
    isLoading,
  } = useQuery({
    queryKey: ["async-search-select", instance_id, debouncedQuery],
    queryFn: () => searchFn(debouncedQuery),
    enabled: open,
  });

  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option);
    onChange?.(option.value, option);
    setOpen(false);
    setQuery("");
  };

  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    if (selectedOption?.value === value) return selectedOption.label;
    if (resolvedOption?.value === value) return resolvedOption.label;
    if (isResolvingLabel) return "Cargando...";
    return placeholder;
  }, [value, selectedOption, resolvedOption, isResolvingLabel, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full" disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-transparent font-normal"
        >
          <span
            className={
              value &&
              (selectedOption?.value === value ||
                resolvedOption?.value === value)
                ? "truncate"
                : "truncate text-muted-foreground"
            }
          >
            {displayLabel}
          </span>

          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0">
        <Command shouldFilter={false}>
          <div className="border-b p-2">
            <Input
              value={query}
              placeholder={searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Buscando...
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>

                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = option.value === value;

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option)}
                        className="flex items-center justify-between"
                      >
                        <span>{option.label}</span>

                        {isSelected ? (
                          <Check className="size-4" aria-hidden />
                        ) : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
