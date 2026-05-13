import { Card, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { PerPageDropdown } from "./perPageDropdown";
import { CustomPagination } from "./customPagination";
import { FilterPopover } from "./filterPopover";
import { FormDialog } from "./formDialog";
export const DynamicTableLayout = ({
  children,
  title,
  total,
  filters,
  form,
}: {
  children: React.ReactNode;
  title: string;
  total: number;
  filters: React.ReactNode;
  form: React.ReactNode;
}) => (
  <Card className="border-none shadow-none">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <div className="flex flex-row gap-2 items-center">
        <FilterPopover filters={filters} />
        <FormDialog form={form} />
      </div>
    </CardHeader>
    {children}
    <CardFooter className="flex items-center justify-end gap-5">
      <PerPageDropdown />
      <CustomPagination total={total} />
    </CardFooter>
  </Card>
);
