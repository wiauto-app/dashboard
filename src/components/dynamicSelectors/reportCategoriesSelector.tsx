import { reportCategoriesService } from "@/components/reports/services/reportCategoriesService";
import type { ReportCategoryItem } from "@/components/reports/types/report-category.types";
import type { ReportTargetType } from "@/components/reports/types/report.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const ReportCategoriesSelector = ({
  onValueChange,
  value,
  targetType,
  ariaInvalid,
  disabled,
}: {
  onValueChange: (value: string | undefined) => void;
  value?: string;
  targetType?: ReportTargetType;
  ariaInvalid?: boolean;
  disabled?: boolean;
}) => (
  <CatalogResourceSelector<ReportCategoryItem>
    queryKey={["report-categories", targetType ?? "all"]}
    fetchItems={() =>
      reportCategoriesService.findAll({
        page: 1,
        limit: 100,
        target_type: targetType,
      })
    }
    value={value}
    onValueChange={onValueChange}
    placeholder="Categoría"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => item.name}
  />
);
