import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { countryCodes } from "@/lib/countryCodes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const MAX_SUBSCRIBER_DIGITS_E164 = 15;

/** Prefijo por defecto (España) cuando `phone_code` llega vacío al montar. */
export const DEFAULT_PHONE_CODE = "+34";

/** Fila estable en módulo: evita reordenar y re-mapear en cada render. */
const COUNTRY_ROWS = [...countryCodes]
  .map((entry) => ({
    iso: entry.code,
    dial_code: entry.dial_code,
    name: entry.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

export type PhoneFieldValue = {
  phone_code: string;
  phone: string;
};

export type PhoneInputProps = {
  value: PhoneFieldValue;
  onChange: (next: PhoneFieldValue) => void;
  disabled?: boolean;
  className?: string;
  ariaInvalid?: boolean;
  dialListLabel?: string;
  nationalNumberLabel?: string;
  nationalNumberPlaceholder?: string;
};

export const PhoneInput = ({
  value,
  onChange,
  disabled = false,
  className,
  ariaInvalid = false,
  dialListLabel = "Buscar país o prefijo",
  nationalNumberLabel = "Número de teléfono",
  nationalNumberPlaceholder = "Número",
}: PhoneInputProps) => {
  const baseId = useId();
  const dialTriggerId = `${baseId}-dial-trigger`;
  const nationalInputId = `${baseId}-national`;

  const [dialPopoverOpen, setDialPopoverOpen] = useState(false);
  /** Evita llamar repetidamente a `onChange` con `+34` si el padre no actualiza al instante. */
  const appliedDefaultDialRef = useRef(false);

  const dialTrimmed = value.phone_code?.trim() ?? "";
  /** Vista y hint: España (+34) si aún no hay prefijo persistido */
  const effectiveDialCode =
    dialTrimmed.length > 0 ? dialTrimmed : DEFAULT_PHONE_CODE;

  useEffect(() => {
    if (appliedDefaultDialRef.current) return;

    const hasExplicitCode = dialTrimmed.length > 0;
    if (hasExplicitCode) {
      appliedDefaultDialRef.current = true;
      return;
    }

    appliedDefaultDialRef.current = true;
    onChange({ ...value, phone_code: DEFAULT_PHONE_CODE });
  }, [dialTrimmed, onChange, value]);

  /** Texto corto para el disparador cuando el prefijo encaja un solo país conocido */
  const triggerHint = useMemo(() => {
    const match = COUNTRY_ROWS.find(
      (row) => row.dial_code === effectiveDialCode,
    );
    if (!match) return effectiveDialCode;
    return `${match.name} (${match.dial_code})`;
  }, [effectiveDialCode]);

  const handleDialCodeSelect = (dialCode: string) => {
    if (dialCode === dialTrimmed) {
      setDialPopoverOpen(false);
      return;
    }
    onChange({ ...value, phone_code: dialCode });
    setDialPopoverOpen(false);
  };

  const handleNationalPhoneChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(
      0,
      MAX_SUBSCRIBER_DIGITS_E164,
    );
    if (digitsOnly === value.phone) return;
    onChange({ ...value, phone: digitsOnly });
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2",
        className,
      )}
    >
      <Popover open={dialPopoverOpen} onOpenChange={setDialPopoverOpen}>
        <PopoverTrigger
          disabled={disabled}
          className="shrink-0 sm:w-[min(20%,11rem)]"
        >
          <Button
            id={dialTriggerId}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid || undefined}
            aria-haspopup="listbox"
            aria-expanded={dialPopoverOpen}
            aria-label="Prefijo internacional del teléfono"
            title={triggerHint}
            className="h-9 w-full justify-between gap-2 bg-transparent font-normal tabular-nums"
          >
            <span className="min-w-0 flex-1 truncate text-left">
              <span
                className={cn(
                  "font-medium tabular-nums text-foreground",
                  dialTrimmed.length === 0 && "text-muted-foreground",
                )}
              >
                {effectiveDialCode}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[min(100vw-1.5rem,20rem)] max-w-none p-0 shadow-md sm:min-w-[280px]"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput placeholder={dialListLabel} />
            <CommandList>
              <CommandEmpty>No se encontraron países.</CommandEmpty>
              <CommandGroup>
                {COUNTRY_ROWS.map((row) => {
                  const keywords = `${row.name} ${row.dial_code} ${row.iso}`;
                  const fuse = `${row.iso}|${row.dial_code}|${row.name}`;

                  return (
                    <CommandItem
                      key={fuse}
                      keywords={[keywords]}
                      value={fuse}
                      onSelect={() => handleDialCodeSelect(row.dial_code)}
                      className="gap-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-left">
                        {row.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {row.dial_code}
                      </span>
                      <span className="sr-only">{row.iso}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        id={nationalInputId}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        name="phone-national"
        disabled={disabled}
        aria-invalid={ariaInvalid || undefined}
        aria-label={nationalNumberLabel}
        placeholder={nationalNumberPlaceholder}
        value={value.phone ?? ""}
        onChange={handleNationalPhoneChange}
        className="min-w-0 flex-1"
      />
    </div>
  );
};
