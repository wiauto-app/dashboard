import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItem as BreadcrumbItemType } from "../breadcrumbs.constants";
import { Fragment } from "react";

export const RoutesBreadcrumbs = ({
  items,
}: {
  items: BreadcrumbItemType[];
}) => {
  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const is_last = index === items.length - 1;
          const key = `${item.href}-${index}`;

          return (
            <Fragment key={key}>
              <BreadcrumbItem>
                {is_last ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!is_last ? <BreadcrumbSeparator className="text-muted-foreground">/</BreadcrumbSeparator> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
