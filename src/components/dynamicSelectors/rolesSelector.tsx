import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { rolesService } from "@/services/profiles/rolesService";
export const RolesSelector = ({
  onValueChange,
  value,
  ariaInvalid,
}: {
  onValueChange: (value: string) => void;
  value: string;  
  ariaInvalid?: boolean;
}) => {
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.getRoles(),
  });
  const role_items =
    roles?.map((role) => ({
      value: role.id,
      label: role.name,
    })) ?? [];

  return (
    <Select value={value} onValueChange={onValueChange} items={role_items}>
      <SelectTrigger className="w-full" aria-invalid={ariaInvalid}>
        <SelectValue placeholder="Seleccionar rol" />
      </SelectTrigger>
      <SelectContent>
        {roles?.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
