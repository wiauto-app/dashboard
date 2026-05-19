import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useFiltersManager } from "@/hooks/useFiltersManager";

export const CustomPagination = ({
  total,
  path,
}: {
  total: number;
  path: string;
}) => {
  const { values, handleChange } = useFiltersManager({ path });
  const raw_page = Number(values.page ?? 1);
  const limit = Math.max(1, Number(values.limit ?? 10));
  const total_pages =
    total === 0 ? 1 : Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(1, raw_page), total_pages);

  const handle_prev = () => {
    handleChange("page", String(Math.max(1, page - 1)));
  };

  const handle_next = () => {
    if (total === 0) {
      return;
    }
    handleChange("page", String(Math.min(total_pages, page + 1)));
  };

  return (
    <div className="flex items-center gap-5">
      <span className="text-sm text-muted-foreground tabular-nums">
        Página {page} de {total_pages}
      </span>
      <div className="flex flex-row gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handle_prev}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="size-5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handle_next}
          disabled={total === 0 || page >= total_pages}
          aria-label="Página siguiente"
        >
          <ChevronRightIcon className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
};
