import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  error?: string | null;
  className?: string;
}

export const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error,
  className,
}: DateRangeSelectorProps) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Rango de fechas"
      >
        <Input
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) => onStartDateChange(event.target.value)}
          aria-label="Fecha de inicio"
          aria-invalid={Boolean(error)}
          className="w-auto min-w-[150px] bg-white"
        />
        <span className="text-sm text-muted-foreground" aria-hidden>
          —
        </span>
        <Input
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => onEndDateChange(event.target.value)}
          aria-label="Fecha de fin"
          aria-invalid={Boolean(error)}
          className="w-auto min-w-[150px] bg-white"
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
