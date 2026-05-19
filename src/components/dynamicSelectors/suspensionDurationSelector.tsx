import { useQuery } from "@tanstack/react-query";
import { suspensionDurationService } from "@/services/users/suspensionDurationService";
import { BaseSelector } from "./baseSelector";

export const SuspensionDurationSelector = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const { data: suspensionDurationTypes, isLoading } = useQuery({
    queryKey: ["suspensionDurationTypes"],
    queryFn: () => suspensionDurationService.findAll(),
  });

  
  if (isLoading) return <div>Cargando...</div>;
  return (
    <BaseSelector
      items={suspensionDurationTypes?.data.data ?? []}
      onChange={(next_value) => onChange(next_value ?? "")}
      value={value}
      labelKey="label"
      valueKey="id"
      placeholder="Seleccionar duración de la suspensión"
      
    />
  );
};
