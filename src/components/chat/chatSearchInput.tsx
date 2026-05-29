import { SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useFiltersManager } from "@/hooks/useFiltersManager";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

export const ChatSearchInput = () => {
  const { handleChange, values } = useFiltersManager({ path: "/messages" });
  const [search_value, set_search_value] = useState(values.search ?? "");
  const debounced_search_value = useDebounce(search_value, 350);

  useEffect(() => {
    const normalized_value = debounced_search_value.trim();
    handleChange("search", normalized_value || undefined);
  }, [debounced_search_value, handleChange]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    set_search_value(event.target.value);
  };

  return (
    <div className="relative w-full">
      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-8"
        placeholder="Buscar..."
        value={search_value}
        onChange={handleSearchChange}
      />
    </div>
  );
};
