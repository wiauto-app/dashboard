import { FieldLabel } from "@/components/ui/field";
import { formatFieldLabel } from "../constants/vehicle-form-field-meta";

type OptionalFieldLabelProps = {
  htmlFor?: string;
  children: string;
  optional?: boolean;
};

/** Etiqueta de campo con sufijo «(opcional)» cuando corresponde al DTO. */
export const OptionalFieldLabel = ({
  htmlFor,
  children,
  optional = false,
}: OptionalFieldLabelProps) => (
  <FieldLabel htmlFor={htmlFor}>{formatFieldLabel(children, optional)}</FieldLabel>
);
