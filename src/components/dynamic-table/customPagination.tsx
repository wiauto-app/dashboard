import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useFiltersManager } from "@/hooks/useFiltersManager";

export const CustomPagination = ({ total }: { total: number }) => {
  const { values, handleChange } = useFiltersManager({ path: "/users" });
  const page = Number(values.page);
  const limit = Number(values.limit);
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="flex items-center gap-5">
      {page} de {totalPages}
      <div className="flex flex-row gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleChange("page", (page - 1).toString())}
          disabled={page === 1}
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleChange("page", (page + 1).toString())}
          disabled={page === totalPages}
        >
          <ChevronRightIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
};
