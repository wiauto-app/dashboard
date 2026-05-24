import { SearchSelect } from "../ui/searchSelect";
import { modelService } from "../vehicles/services/modelService";
import { Field, FieldLabel } from "../ui/field";

export const ModelSelector = ({
  value,
  onChange,
  ariaInvalid,
  disabled,
  placeholder = "Modelo",
  makeId,
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  makeId?: number;
}) => {
  const searchModels = async (query: string) => {
    if (!makeId) return [];
    const response = await modelService.findAll({
      limit: 100,
      page: 1,
      search: query,
      make_id: makeId,
    });
    const models = response.data ?? [];
    return models.map((model) => ({
      label: model.name,
      value: String(model.id),
    }));
  };
  return (
    <Field
      data-invalid={ariaInvalid}
    >
      <FieldLabel htmlFor="model-selector">Modelo</FieldLabel>
      <SearchSelect
        
        value={value}
        disabled={disabled || !makeId}
        onChange={(next_value) => onChange?.(next_value)}
        placeholder={placeholder ?? "Seleccionar modelo"}
        searchPlaceholder="Buscar modelo"
        searchFn={searchModels}
        resolveOption={async (model_id) => {
          const model = await modelService.findOne(Number(model_id));
          return { label: model.name, value: String(model.id) };
        }}
      />
    </Field>
  );
};
