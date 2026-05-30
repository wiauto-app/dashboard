import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";

import { ProfilesSelector } from "@/components/dynamicSelectors/profilesSelector";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type z from "zod";

import { DEALERSHIP_MEMBER_ROLE_OPTIONS } from "../constants/dealership-member-role.constants";
import type { createDealershipSchema } from "../schemas/dealership.schema";
import type {
  DealershipMemberProfile,
  DealershipMemberRole,
} from "../types/members.types";

type DealershipFormValues = z.infer<typeof createDealershipSchema>;

const get_profile_label = (profile?: DealershipMemberProfile) => {
  if (!profile) return "Perfil";
  const full_name =
    `${profile.name ?? ""} ${profile.last_name ?? ""}`.trim();
  return full_name || profile.user?.email || profile.id;
};

export const DealershipMembersEditor = ({
  control,
  setValue,
  member_profiles,
  onProfileCached,
  errors,
}: {
  control: Control<DealershipFormValues>;
  setValue: UseFormSetValue<DealershipFormValues>;
  member_profiles: Record<string, DealershipMemberProfile>;
  onProfileCached?: (profile: DealershipMemberProfile) => void;
  errors?: FieldErrors<DealershipFormValues>;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  const watched_members = useWatch({
    control,
    name: "members",
  });

  const [pending_profile_id, set_pending_profile_id] = useState<
    string | undefined
  >(undefined);
  const [pending_role, set_pending_role] =
    useState<DealershipMemberRole>("member");

  const used_profile_ids = (watched_members ?? fields).map(
    (member) => member.profile_id,
  );

  const handleAddMember = () => {
    if (!pending_profile_id) return;
    if (used_profile_ids.includes(pending_profile_id)) return;

    append({
      profile_id: pending_profile_id,
      role: pending_role,
    });

    if (pending_role === "owner") {
      fields.forEach((_field, index) => {
        if (watched_members?.[index]?.role === "owner") {
          setValue(`members.${index}.role`, "admin", { shouldDirty: true });
        }
      });
    }

    set_pending_profile_id(undefined);
    set_pending_role("member");
  };

  const handleRoleChange = (index: number, role: DealershipMemberRole) => {
    if (role === "owner") {
      (watched_members ?? fields).forEach((member, field_index) => {
        if (field_index !== index && member.role === "owner") {
          setValue(`members.${field_index}.role`, "admin", {
            shouldDirty: true,
          });
        }
      });
    }

    setValue(`members.${index}.role`, role, { shouldDirty: true });
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">Miembros</h2>
        <p className="text-muted-foreground text-sm">
          Asigna perfiles al concesionario. Debe haber exactamente un
          propietario.
        </p>
      </div>

      {fields.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const profile = member_profiles[field.profile_id];
            const role_error = errors?.members?.[index]?.role;
            const member_role =
              watched_members?.[index]?.role ?? field.role;

            return (
              <li
                key={field.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-end"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {get_profile_label(profile)}
                  </p>
                  {profile?.user?.email ? (
                    <p className="text-muted-foreground truncate text-xs">
                      {profile.user.email}
                    </p>
                  ) : null}
                </div>

                <Field data-invalid={!!role_error} className="sm:w-48">
                  <FieldLabel htmlFor={`member-role-${field.id}`}>
                    Rol
                  </FieldLabel>
                  <Select
                    value={member_role}
                    onValueChange={(value) =>
                      handleRoleChange(index, value as DealershipMemberRole)
                    }
                    items={DEALERSHIP_MEMBER_ROLE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  >
                    <SelectTrigger
                      id={`member-role-${field.id}`}
                      className="w-full"
                      aria-invalid={!!role_error}
                    >
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEALERSHIP_MEMBER_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {role_error ? (
                    <FieldError errors={[role_error]} />
                  ) : null}
                </Field>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Eliminar miembro"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Aún no hay miembros agregados.
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
        <p className="text-sm font-medium">Agregar miembro</p>

        <Field>
          <FieldLabel>Perfil</FieldLabel>
          <ProfilesSelector
            value={pending_profile_id}
            onValueChange={set_pending_profile_id}
            excludeProfileIds={used_profile_ids}
            onProfileSelect={onProfileCached}
          />
        </Field>

        <Field className="sm:max-w-xs">
          <FieldLabel htmlFor="pending-member-role">Rol inicial</FieldLabel>
          <Select
            value={pending_role}
            onValueChange={(value) =>
              set_pending_role(value as DealershipMemberRole)
            }
            items={DEALERSHIP_MEMBER_ROLE_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          >
            <SelectTrigger id="pending-member-role" className="w-full">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              {DEALERSHIP_MEMBER_ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Button
          type="button"
          variant="secondary"
          className="self-start"
          onClick={handleAddMember}
          disabled={!pending_profile_id}
        >
          <PlusIcon className="size-4" />
          Agregar miembro
        </Button>
      </div>

      {errors?.members?.message || errors?.members?.root?.message ? (
        <FieldError
          errors={[
            {
              message:
                errors.members.message ?? errors.members.root?.message ?? "",
            },
          ]}
        />
      ) : null}
    </section>
  );
};
