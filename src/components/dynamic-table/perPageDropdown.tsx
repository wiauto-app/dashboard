import { useFiltersManager } from "@/hooks/useFiltersManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const PER_PAGE_OPTIONS = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

export const PerPageDropdown = () => {
  const { values, handleChange } = useFiltersManager({ path: "/users" });
  return (
    <div className="flex flex-row items-center gap-2">
      <label htmlFor="per-page" className="text-sm text-muted-foreground">
        Filas por página:
      </label>

      <Select
        value={values.limit?.toString()}
        onValueChange={(value) => {
          console.log(value);
          handleChange("limit", value);
        }}
      >
        <SelectTrigger className="border-none shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PER_PAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
