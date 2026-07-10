import { makesService } from "@/components/vehicles/services/makesService";
import { SearchSelect } from "../ui/searchSelect";
import { Field, FieldLabel } from "../ui/field";

export const MakeSelector = ({
  value,
  onChange,
  ariaInvalid,
  disabled,
  placeholder = "Marca",
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const searchMakes = async (query: string) => {
    const response = await makesService.findAll({
      limit: 100,
      page: 1,
      search: query,
    });

    const makes = response.data ?? [];

    return makes.map((make) => ({
      label: make.name,
      value: String(make.id),
    }));
  };

  return (
    <Field data-invalid={ariaInvalid}>
      <FieldLabel htmlFor="make-selector">Marca</FieldLabel>
      <SearchSelect
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        searchPlaceholder="Buscar marca..."
        emptyText="No se encontraron marcas"
        searchFn={searchMakes}
        resolveOption={async (make_id) => {
          const response = await makesService.findOne(make_id);
          const make = response.data;
          return { label: make.name, value: String(make.id) };
        }}
        onChange={(next_value) => onChange?.(next_value)}
      />
    </Field>
  );
};
