import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { ImageInput } from "@/components/ui/imageInput";
import { Input } from "@/components/ui/input";
import { MapInput } from "@/components/ui/mapInput";
import { PhoneInput } from "@/components/ui/phoneInput";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { asFormResolver } from "@/lib/asFormResolver";
import { getImageUrl } from "@/lib/utils";
import { normalizeWebsiteUrlForStorage } from "@/lib/validations/websiteUrl";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

import {
  EMPTY_DEALERSHIP_LOCATION,
  createDealershipSchema,
  updateDealershipSchema,
} from "../schemas/dealership.schema";
import { dealershipService } from "../services/dealershipService";
import type { DealershipMemberProfile } from "../types/members.types";
import { DealershipMembersEditor } from "./dealershipMembersEditor";

interface DealershipFormProps {
  onSuccess?: () => void;
}

export const DealershipForm = ({ onSuccess }: DealershipFormProps) => {
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
    resolver: asFormResolver<FormSchema>(formSchema),
    defaultValues: {
      name: "",
      avatar_url: "",
      banner_url: "",
      description: "",
      website_url: "",
      email: "",
      phone: { phone_code: "+34", phone: "" },
      show_phone: true,
      address: "",
      lat: EMPTY_DEALERSHIP_LOCATION.lat,
      lng: EMPTY_DEALERSHIP_LOCATION.lng,
      is_featured: false,
      max_listings: 3,
      max_photos: 6,
      allow_videos: false,
      members: [],
    },
  });

  const dealership = dealershipResponse?.data;
  const avatarUrl = useWatch({ control: form.control, name: "avatar_url" });
  const bannerUrl = useWatch({ control: form.control, name: "banner_url" });
  const dealershipName = useWatch({ control: form.control, name: "name" });
  const lng = useWatch({ control: form.control, name: "lng" });
  const displayName = dealershipName?.trim() || "Concesionario";

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
      avatar_url: dealership.avatar_url ?? "",
      banner_url: dealership.banner_url ?? "",
      description: dealership.description ?? "",
      website_url: dealership.website_url ?? "",
      email: dealership.email,
      phone: {
        phone_code: dealership.phone_code?.trim() || "+34",
        phone: dealership.phone ?? "",
      },
      show_phone: dealership.show_phone ?? true,
      address: dealership.address ?? "",
      lat: dealership.lat ?? EMPTY_DEALERSHIP_LOCATION.lat,
      lng: dealership.lng ?? EMPTY_DEALERSHIP_LOCATION.lng,
      is_featured: dealership.is_featured,
      max_listings: dealership.max_listings ?? 3,
      max_photos: dealership.max_photos ?? 6,
      allow_videos: dealership.allow_videos ?? false,
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
    name: formData.name.trim(),
    avatar_url: formData.avatar_url.trim(),
    banner_url: formData.banner_url.trim(),
    description: formData.description.trim(),
    website_url: normalizeWebsiteUrlForStorage(formData.website_url) || null,
    email: formData.email.trim(),
    phone_code: formData.phone.phone_code,
    phone: formData.phone.phone,
    show_phone: formData.show_phone,
    address: formData.address.trim(),
    lat: formData.lat,
    lng: formData.lng,
    is_featured: formData.is_featured ?? false,
    max_listings: formData.max_listings ?? 3,
    max_photos: formData.max_photos ?? 6,
    allow_videos: formData.allow_videos ?? false,
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
      <Tabs defaultValue="profile" className="gap-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-100/50">
            {bannerUrl ? (
              <div className="relative h-32 w-full bg-blue-200">
                <img
                  src={getImageUrl(bannerUrl)}
                  alt={`Portada de ${displayName}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 w-full bg-blue-200" />
            )}

            <div className="flex flex-col items-center gap-4 p-6 md:flex-row md:items-end">
              <div className="relative -mt-12 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-blue-100 bg-blue-200 text-2xl font-bold text-blue-700 md:-mt-16">
                {avatarUrl ? (
                  <img
                    src={getImageUrl(avatarUrl)}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 className="size-8" aria-hidden />
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedId
                    ? "Actualiza la información pública del concesionario"
                    : "Completa los datos para registrar el concesionario"}
                </p>
              </div>
            </div>
          </div>

          <section className="flex flex-col gap-6 rounded-xl border p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">Perfil público</h2>
              <p className="text-sm text-muted-foreground">
                Datos visibles en el perfil del concesionario.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="avatar_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <ImageInput
                      label="Logo de tu concesionario"
                      description="PNG, JPG o WEBP. Se mostrará como avatar."
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
                      label="Foto de portada"
                      description="PNG, JPG o WEBP. Se mostrará en la cabecera."
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

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="md:col-span-2"
                  >
                    <FieldLabel htmlFor="dealership-name">Nombre</FieldLabel>
                    <Input
                      id="dealership-name"
                      type="text"
                      placeholder="Auto Norte Madrid"
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
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="md:col-span-2"
                  >
                    <FieldLabel htmlFor="dealership-description">
                      Descripción{" "}
                      <span className="font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </FieldLabel>
                    <Textarea
                      id="dealership-description"
                      rows={4}
                      placeholder="Cuéntanos qué hace especial a tu concesionario"
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
                    <FieldLabel htmlFor="dealership-website">
                      Sitio web{" "}
                      <span className="font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </FieldLabel>
                    <Input
                      id="dealership-website"
                      type="text"
                      inputMode="url"
                      placeholder="tuconcesionario.com o https://www.tuconcesionario.com"
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
                    <FieldLabel htmlFor="dealership-email">
                      Correo de contacto
                    </FieldLabel>
                    <Input
                      id="dealership-email"
                      type="email"
                      placeholder="contacto@tuconcesionario.com"
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
                    <FieldLabel htmlFor="dealership-phone">Teléfono</FieldLabel>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      ariaInvalid={fieldState.invalid}
                    />
                    {form.formState.errors.phone?.phone_code ? (
                      <FieldError
                        errors={[form.formState.errors.phone.phone_code]}
                      />
                    ) : null}
                    {form.formState.errors.phone?.phone ? (
                      <FieldError errors={[form.formState.errors.phone.phone]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="show_phone"
                control={form.control}
                render={({ field }) => (
                  <Field className="md:col-span-2">
                    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                      <div className="space-y-1">
                        <FieldLabel htmlFor="dealership-show-phone">
                          Mostrar teléfono en perfil público
                        </FieldLabel>
                        <FieldDescription>
                          Si lo desactivas, se ocultará el botón de llamar y el
                          contacto telefónico en el perfil público.
                        </FieldDescription>
                      </div>
                      <Switch
                        id="dealership-show-phone"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Mostrar teléfono en perfil público"
                      />
                    </div>
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="md:col-span-2"
                  >
                    <FieldLabel htmlFor="dealership-address">
                      Dirección
                    </FieldLabel>
                    <Input
                      id="dealership-address"
                      type="text"
                      placeholder="Calle Mayor 123, Madrid"
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

            <Field
              data-invalid={
                Boolean(form.formState.errors.lat) ||
                Boolean(form.formState.errors.lng)
              }
            >
              <FieldLabel>Ubicación en el mapa</FieldLabel>
              <Controller
                name="lat"
                control={form.control}
                render={({ field: latField, fieldState }) => (
                  <MapInput
                    value={{ lat: latField.value, lng }}
                    onChange={({ lat, lng: nextLng }) => {
                      latField.onChange(lat);
                      form.setValue("lng", nextLng, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    ariaInvalid={
                      fieldState.invalid || Boolean(form.formState.errors.lng)
                    }
                  />
                )}
              />
              {form.formState.errors.lat ? (
                <FieldError errors={[form.formState.errors.lat]} />
              ) : null}
              {form.formState.errors.lng ? (
                <FieldError errors={[form.formState.errors.lng]} />
              ) : null}
            </Field>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">Destacado y límites</h2>
              <p className="text-sm text-muted-foreground">
                Ajustes internos del dashboard. No forman parte del perfil
                público.
              </p>
            </div>

            <Controller
              name="is_featured"
              control={form.control}
              render={({ field }) => (
                <Field className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="is_featured"
                      checked={field.value ?? false}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      aria-label="Marcar concesionario como destacado"
                    />
                    <div>
                      <FieldLabel htmlFor="is_featured" className="m-0">
                        Destacado
                      </FieldLabel>
                      <p className="text-sm text-muted-foreground">
                        Aparece primero en listados y en la sección de
                        concesionarios destacados del inicio.
                      </p>
                    </div>
                  </div>
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                name="max_listings"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="max_listings">
                      Anuncios activos (máx.)
                    </FieldLabel>
                    <Input
                      id="max_listings"
                      type="number"
                      min={0}
                      aria-invalid={fieldState.invalid}
                      value={field.value ?? 3}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
              <Controller
                name="max_photos"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="max_photos">
                      Fotos por anuncio (máx.)
                    </FieldLabel>
                    <Input
                      id="max_photos"
                      type="number"
                      min={0}
                      aria-invalid={fieldState.invalid}
                      value={field.value ?? 6}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
              <Controller
                name="allow_videos"
                control={form.control}
                render={({ field }) => (
                  <Field className="flex items-center gap-3 pt-6">
                    <Checkbox
                      id="allow_videos"
                      checked={field.value ?? false}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      aria-label="Permitir vídeos en anuncios"
                    />
                    <FieldLabel htmlFor="allow_videos" className="m-0">
                      Permitir vídeos
                    </FieldLabel>
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
