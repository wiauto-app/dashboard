import { Controller, useForm } from "react-hook-form";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import {
  createRoleSchema,
  updateRoleSchema,
} from "../schemas/role-form.schema";

import type { CreateRole, UpdateRole } from "../types/role.types";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

import { useQuery } from "@tanstack/react-query";

import { permissionService } from "@/components/permissions/services/permissionService";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PaginationParams } from "@/types/general.types";
import { rolesService } from "../services/rolesService";
import { toast } from "sonner";
import { rolesPermissionsService } from "../services/roles-permissionsService";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type RoleFormProps = {
  onSuccess?: () => void;
};

export const RoleForm = ({ onSuccess }: RoleFormProps) => {
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitLockedRef = useRef(false);

  const [paginationParams] = useState<PaginationParams>({
    page: 1,
    limit: 100,
  });

  const formSchema = selectedId ? updateRoleSchema : createRoleSchema;

  /*
   |--------------------------------------------------------------------------
   | Permissions
   |--------------------------------------------------------------------------
   */

  const { data: permissionsResponse } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionService.findAll(paginationParams),
  });

  const { data: roleResponse } = useQuery({
    queryKey: ["role", selectedId],
    queryFn: () => rolesService.findOne(selectedId ?? ""),
    enabled: !!selectedId,
  });

  const permissions = permissionsResponse?.data ?? [];

  /*
   |--------------------------------------------------------------------------
   | Form
   |--------------------------------------------------------------------------
   */

  const form = useForm<CreateRole | UpdateRole>({
    resolver: standardSchemaResolver(formSchema),

    defaultValues: {
      name: "",
      is_admin: false,
      is_developer: false,
      permission_ids: [],
    },
  });


  useEffect(() => {
    if (!selectedId) {
      form.reset({
        name: "",
        is_admin: false,
        is_developer: false,
        permission_ids: [],
      });
      return;
    }

    if (roleResponse) {
      form.reset({
        name: roleResponse.data.name,
        is_admin: roleResponse.data.is_admin,
        is_developer: roleResponse.data.is_developer,
        permission_ids: roleResponse.data.roles_permissions.map(
          (rolePermission) => rolePermission.permission_id,
        ),
      });
    }
  }, [selectedId, roleResponse, form]);

  /*
   |--------------------------------------------------------------------------
   | Group Permissions
   |--------------------------------------------------------------------------
   */

  const groupedPermissions = useMemo(() => {
    return permissions.reduce(
      (acc: Record<string, typeof permissions>, permission) => {
        const [module] = permission.key.split(".");

        if (!acc[module]) {
          acc[module] = [];
        }

        acc[module].push(permission);

        return acc;
      },
      {},
    );
  }, [permissions]);

  /*
   |--------------------------------------------------------------------------
   | Toggle Permission
   |--------------------------------------------------------------------------
   */

  const togglePermission = (permissionId: string) => {
    const currentPermissionIds = form.getValues("permission_ids") ?? [];

    if (currentPermissionIds.includes(permissionId)) {
      form.setValue(
        "permission_ids",
        currentPermissionIds.filter((id) => id !== permissionId),
      );
      return;
    }

    form.setValue("permission_ids", [...currentPermissionIds, permissionId]);
  };

  /*
   |--------------------------------------------------------------------------
   | Submit
   |--------------------------------------------------------------------------
   */

  const releaseSubmitLock = () => {
    isSubmitLockedRef.current = false;
    setIsSubmitting(false);
  };

  const handleCloseForm = () => {
    setSelectedId(null);
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ["role"] });
    queryClient.invalidateQueries({ queryKey: ["selectedData"] });
  };

  const onSubmit = async (data: CreateRole | UpdateRole) => {
    if (isSubmitLockedRef.current) {
      return;
    }

    isSubmitLockedRef.current = true;
    setIsSubmitting(true);

    const permission_ids = data.permission_ids ?? [];
    const rolePayload = {
      name: data.name ?? "",
      is_admin: data.is_admin ?? false,
      is_developer: data.is_developer ?? false,
      is_default: false,
    };

    try {
      if (selectedId) {
        const response = await rolesService.update(selectedId, rolePayload);

        if (!response.ok) {
          toast.error(response.message || "No se pudo actualizar el rol");
          return;
        }

        const syncResponse = await rolesPermissionsService.syncPermissions({
          role_id: selectedId,
          permission_ids,
        });

        if (!syncResponse.ok) {
          toast.error(
            syncResponse.message ||
              "El rol se actualizó, pero no se pudieron asignar los permisos",
          );
          onSuccess?.();
          return;
        }

        toast.success("Rol actualizado correctamente");
        handleCloseForm();
        onSuccess?.();
        return;
      }

      const response = await rolesService.create(rolePayload);

      if (!response.ok) {
        toast.error(response.message || "No se pudo crear el rol");
        return;
      }

      const syncResponse = await rolesPermissionsService.syncPermissions({
        role_id: response.data.id,
        permission_ids,
      });

      if (!syncResponse.ok) {
        toast.error(
          syncResponse.message ||
            "El rol se creó, pero no se pudieron asignar los permisos",
        );
        onSuccess?.();
        return;
      }

      toast.success("Rol creado correctamente");
      form.reset({
        name: "",
        is_admin: false,
        is_developer: false,
        permission_ids: [],
      });
      handleCloseForm();
      onSuccess?.();
    } finally {
      releaseSubmitLock();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* ================================================================ */}
      {/* General */}
      {/* ================================================================ */}

      <div className="space-y-6 rounded-xl border p-6">
        <div>
          <h2 className="text-lg font-semibold">Información general</h2>

          <p className="text-sm text-muted-foreground">
            Configura la información básica del rol.
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Name */}
        {/* ------------------------------------------------------------ */}

        <Field>
          <FieldLabel>Nombre</FieldLabel>

          <Input {...form.register("name")} placeholder="Administrador" />

          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>

        {/* ------------------------------------------------------------ */}
        {/* Flags */}
        {/* ------------------------------------------------------------ */}

        <div className="grid gap-4 md:grid-cols-2">
          <Field className="rounded-lg border p-4">
            <Controller
              control={form.control}
              name="is_admin"
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />

                  <div>
                    <FieldLabel className="m-0">Administrador</FieldLabel>

                    <p className="text-sm text-muted-foreground">
                      Acceso completo al sistema.
                    </p>
                  </div>
                </div>
              )}
            />
          </Field>

          <Field className="rounded-lg border p-4">
            <Controller
              control={form.control}
              name="is_developer"
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />

                  <div>
                    <FieldLabel className="m-0">Desarrollador</FieldLabel>

                    <p className="text-sm text-muted-foreground">
                      Permisos técnicos y avanzados.
                    </p>
                  </div>
                </div>
              )}
            />
          </Field>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Permissions */}
      {/* ================================================================ */}

      <div className="space-y-6 rounded-xl border p-6">
        <div>
          <h2 className="text-lg font-semibold">Permisos</h2>

          <p className="text-sm text-muted-foreground">
            Selecciona las acciones que podrá realizar este rol.
          </p>
        </div>

        <div className="space-y-6 max-h-[300px] overflow-y-auto">
          {Object.entries(groupedPermissions).map(
            ([module, modulePermissions]) => (
              <div key={module} className="rounded-xl border">
                {/* ------------------------------------------------ */}
                {/* Module Header */}
                {/* ------------------------------------------------ */}

                <div className="border-b px-4 py-3">
                  <h3 className="font-medium capitalize">{module}</h3>
                </div>

                {/* ------------------------------------------------ */}
                {/* Permissions */}
                {/* ------------------------------------------------ */}

                <div className="grid gap-3 p-4 md:grid-cols-2">
                  {modulePermissions.map((permission) => {
                    const selectedPermissionIds = form.watch("permission_ids") ?? [];

                    const checked = selectedPermissionIds.includes(permission.id);

                    return (
                      <button
                        key={permission.id}
                        type="button"
                        onClick={() => togglePermission(permission.id)}
                        className={`flex items-start gap-3 rounded-lg border p-4 text-left transition hover:bg-muted/50 ${
                          checked ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <Checkbox checked={checked} />

                        <div className="min-w-0">
                          <p className="font-medium">{permission.name}</p>

                          <p className="truncate text-sm text-muted-foreground">
                            {permission.key}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* Submit */}
      {/* ================================================================ */}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleCloseForm}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando...
            </>
          ) : selectedId ? (
            "Actualizar rol"
          ) : (
            "Crear rol"
          )}
        </Button>
      </div>
    </form>
  );
};
