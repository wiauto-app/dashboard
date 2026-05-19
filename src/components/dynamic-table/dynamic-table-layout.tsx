import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { PerPageDropdown } from "./perPageDropdown";
import { CustomPagination } from "./customPagination";
import { FilterPopover } from "./filterPopover";
import { FormDialog } from "./formDialog";
import type { FormSize } from "@/types/form.types";
export const DynamicTableLayout = ({
  children,
  title,
  total,
  filters,
  form,
  table_toolbar,
  path,
  form_size = "md",
}: {
  children: React.ReactNode;
  title: string;
  total: number;
  filters?: React.ReactNode;
  form: React.ReactNode;
  table_toolbar?: React.ReactNode;
  path: string;
  form_size?: FormSize;
}) => (
  <Card className="border-none shadow-none">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <div className="flex flex-row flex-wrap items-center gap-2">
        {table_toolbar}
        {filters && <FilterPopover filters={filters} />}
        {form && <FormDialog size={form_size} form={form} />}
      </div>
    </CardHeader>
    {children}
    <CardFooter className="flex items-center justify-end gap-5">
      <PerPageDropdown path={path} />
      <CustomPagination total={total} path={path} />
    </CardFooter>
  </Card>
);
