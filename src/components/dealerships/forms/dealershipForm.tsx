import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ImageInput } from "@/components/ui/imageInput";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

import {
  createDealershipSchema,
  updateDealershipSchema,
} from "../schemas/dealership.schema";
import { dealershipService } from "../services/dealershipService";
import type { DealershipMemberProfile } from "../types/members.types";
import { DealershipMembersEditor } from "./dealershipMembersEditor";

export const DealershipForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const formSchema = selectedId ? updateDealershipSchema : createDealershipSchema;
  type FormSchema = z.infer<typeof formSchema>;

  const [member_profiles, set_member_profiles] = useState<
    Record<string, DealershipMemberProfile>
  >({});

  const { data: dealershipResponse } = useQuery({
    queryKey: ["dealership", selectedId],
    queryFn: () => dealershipService.findOne(selectedId!),
    enabled: !!selectedId,
  });

  const form = useForm<FormSchema>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      avatar_url: "",
      banner_url: "",
      description: "",
      website_url: "",
      email: "",
      phone_code: "",
      phone: "",
      address: "",
      lat: undefined,
      lng: undefined,
      members: [],
    },
  });

  const dealership = dealershipResponse?.data;

  useEffect(() => {
    if (!dealership) return;

    const profiles_cache: Record<string, DealershipMemberProfile> = {};
    for (const member of dealership.members ?? []) {
      if (member.profile) {
        profiles_cache[member.profile_id] = member.profile;
      }
    }
    set_member_profiles(profiles_cache);

    form.reset({
      name: dealership.name,
      slug: dealership.slug,
      avatar_url: dealership.avatar_url ?? "",
      banner_url: dealership.banner_url ?? "",
      description: dealership.description,
      website_url: dealership.website_url ?? "",
      email: dealership.email,
      phone_code: dealership.phone_code,
      phone: dealership.phone,
      address: dealership.address,
      lat: dealership.lat,
      lng: dealership.lng,
      members: (dealership.members ?? []).map((member) => ({
        profile_id: member.profile_id,
        role: member.role,
      })),
    });
  }, [dealership, form]);

  const handleCacheProfile = (profile: DealershipMemberProfile) => {
    set_member_profiles((current) => ({
      ...current,
      [profile.id]: profile,
    }));
  };

  const buildPayload = (formData: FormSchema) => ({
    name: formData.name,
    slug: formData.slug,
    avatar_url: formData.avatar_url?.trim() ? formData.avatar_url.trim() : null,
    banner_url: formData.banner_url?.trim() ? formData.banner_url.trim() : null,
    description: formData.description,
    website_url: formData.website_url?.trim()
      ? formData.website_url.trim()
      : null,
    email: formData.email,
    phone_code: formData.phone_code,
    phone: formData.phone,
    address: formData.address,
    lat: formData.lat ?? null,
    lng: formData.lng ?? null,
    members: formData.members,
  });

  const onSubmit = async (formData: FormSchema) => {
    const payload = buildPayload(formData);

    if (selectedId) {
      const response = await dealershipService.update(selectedId, payload);
      if (response.ok) {
        toast.success("Concesionario actualizado correctamente");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
      } else {
        toast.error(
          response.message || "Error al actualizar el concesionario",
        );
      }
      return;
    }

    const response = await dealershipService.create(payload);
    if (response.ok) {
      toast.success("Concesionario creado correctamente");
      setIsOpen(false);
      setSelectedId(null);
      onSuccess?.();
    } else {
      toast.error(response.message || "Error al crear el concesionario");
    }
  };

  const member_profiles_map = useMemo(
    () => member_profiles,
    [member_profiles],
  );

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Tabs defaultValue="general" className="gap-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Datos generales</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <section className="flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">Datos del concesionario</h2>
              <p className="text-muted-foreground text-sm">
                Información general visible en el perfil del concesionario.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nombre</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nombre del concesionario"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                    <Input
                      id="slug"
                      type="text"
                      placeholder="slug-del-concesionario"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@concesionario.com"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="website_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="website_url">Sitio web</FieldLabel>
                    <Input
                      id="website_url"
                      type="url"
                      placeholder="https://www.ejemplo.com"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="phone_code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone_code">Código de país</FieldLabel>
                    <Input
                      id="phone_code"
                      type="text"
                      placeholder="+34"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                    <Input
                      id="phone"
                      type="text"
                      placeholder="600000000"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="address">Dirección</FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Calle, número, ciudad"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="lat"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lat">Latitud</FieldLabel>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      placeholder="40.416775"
                      aria-invalid={fieldState.invalid}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="lng"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lng">Longitud</FieldLabel>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      placeholder="-3.703790"
                      aria-invalid={fieldState.invalid}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Descripción</FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Describe el concesionario"
                    aria-invalid={fieldState.invalid}
                    rows={4}
                    {...field}
                  />
                  {fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </section>
        </TabsContent>

        <TabsContent value="images">
          <section className="flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">Imágenes</h2>
              <p className="text-muted-foreground text-sm">
                Avatar y banner del concesionario.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="avatar_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <ImageInput
                      label="Avatar"
                      description="Imagen cuadrada del concesionario"
                      bucketName="dealership-images"
                      path="avatars"
                      referenceId={selectedId ?? undefined}
                      value={field.value?.trim() ? field.value : null}
                      onChange={(value) => field.onChange(value ?? "")}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="banner_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <ImageInput
                      label="Banner"
                      description="Imagen de portada del concesionario"
                      bucketName="dealership-images"
                      path="banners"
                      referenceId={selectedId ?? undefined}
                      value={field.value?.trim() ? field.value : null}
                      onChange={(value) => field.onChange(value ?? "")}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="members">
          <DealershipMembersEditor
            control={form.control}
            setValue={form.setValue}
            member_profiles={member_profiles_map}
            onProfileCached={handleCacheProfile}
            errors={form.formState.errors}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit">
          {selectedId ? "Actualizar concesionario" : "Crear concesionario"}
        </Button>
      </div>
    </form>
  );
};
