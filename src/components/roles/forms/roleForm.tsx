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

import { useEffect, useMemo, useState } from "react";

import type { PaginationParams } from "@/types/general.types";
import { rolesService } from "../services/rolesService";
import { toast } from "sonner";
import { rolesPermissionsService } from "../services/roles-permissionsService";

export const RoleForm = () => {
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);

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
      permissions: [],
    },
  });

  useEffect(() => {
    if (roleResponse) {
      form.reset({
        name: roleResponse.data.name,
        is_admin: roleResponse.data.is_admin,
        is_developer: roleResponse.data.is_developer,
        permissions: roleResponse.data.roles_permissions.map((rolePermission) => ({
          role_id: rolePermission.role_id,
          permission_id: rolePermission.permission_id,
        })),
      });
    }
  }, [roleResponse]);

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
    const currentPermissions = form.getValues("permissions") ?? [];

    const exists = currentPermissions.some(
      (permission) => permission.permission_id === permissionId,
    );

    if (exists) {
      form.setValue(
        "permissions",
        currentPermissions.filter(
          (permission) => permission.permission_id !== permissionId,
        ),
      );

      return;
    }

    form.setValue("permissions", [
      ...currentPermissions,
      {
        role_id: selectedId ?? "",
        permission_id: permissionId,
      },
    ]);
  };

  /*
   |--------------------------------------------------------------------------
   | Submit
   |--------------------------------------------------------------------------
   */

  const onSubmit = async (data: CreateRole | UpdateRole) => {
    if (selectedId) {
      const response = await rolesService.update(selectedId, {
        name: data.name,
        is_admin: data.is_admin ?? false,
        is_developer: data.is_developer ?? false,
        is_default: false,
      });
      if (response.ok) {
        const permissionsResponse =
          await rolesPermissionsService.syncPermissions({
            role_id: selectedId,
            permission_ids:
              data.permissions?.map((permission) => permission.permission_id) ??
              [],
          });
        if (permissionsResponse.ok) {
          toast.success("Permisos actualizados correctamente");
        } else {
          toast.error("Error al actualizar los permisos");
        }
      } else {
        toast.error("Error al actualizar el rol");
      }
    } else {
      const response = await rolesService.create({
        name: data.name ?? "",
        is_admin: data.is_admin ?? false,
        is_developer: data.is_developer ?? false,
        is_default: false,
      });
      if (response.ok) {
        const permissionsResponse =
          await rolesPermissionsService.syncPermissions({
            role_id: response.data.id,
            permission_ids:
              data.permissions?.map((permission) => permission.permission_id) ??
              [],
          });
        if (permissionsResponse.ok) {
          toast.success("Permisos creados correctamente");
        } else {
          toast.error("Error al crear los permisos");
        }
      } else {
        toast.error("Error al crear el rol");
      }
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
                    const selectedPermissions = form.watch("permissions") ?? [];

                    const checked = selectedPermissions.some(
                      (current) => current.permission_id === permission.id,
                    );

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
          onClick={() => setSelectedId(null)}
        >
          Cancelar
        </Button>

        <Button type="submit">
          {selectedId ? "Actualizar rol" : "Crear rol"}
        </Button>
      </div>
    </form>
  );
};
