import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { rolesService } from "../roles/services/rolesService";
import type { PaginatedResult } from "@/types/general.types";
import type { Role } from "../roles/types/role.types";
export const RolesSelector = ({
  onValueChange,
  value,
  ariaInvalid,
}: {
  onValueChange: (value: string) => void;
  value?: string | null;
  ariaInvalid?: boolean;
}) => {
  const { data } = useQuery<PaginatedResult<Role>>({
    queryKey: ["roles"],
    queryFn: () => rolesService.findAll({ page: 1, limit: 100 }),
  });
  const roles = data?.data;
  const role_items =
    (roles &&
      roles?.map((role) => ({
        value: role.id,
        label: role.name,
      }))) ??
    [];

  return (
    <Select
      value={value ?? undefined}
      onValueChange={(next_value) => {
        if (next_value != null) {
          onValueChange(next_value);
        }
      }}
      items={role_items}
    >
      <SelectTrigger className="w-full" aria-invalid={ariaInvalid}>
        <SelectValue placeholder="Seleccionar rol" />
      </SelectTrigger>
      <SelectContent>
        {roles &&
          roles?.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};
