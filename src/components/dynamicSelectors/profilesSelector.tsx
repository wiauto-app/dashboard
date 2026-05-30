import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/useDebounce";
import { profileService } from "@/services/profiles/profileService";
import type { Profile } from "@/types/profiles.types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DealershipMemberProfile } from "@/components/dealerships/types/members.types";

const profile_to_member_profile = (
  profile: Profile,
): DealershipMemberProfile => ({
  id: profile.id,
  name: profile.name,
  last_name: profile.last_name,
  avatar_url: profile.avatar_url,
  user: { email: profile.user.email },
});

const get_profile_label = (profile?: DealershipMemberProfile | null) => {
  if (!profile) return "";
  const full_name =
    `${profile.name ?? ""} ${profile.last_name ?? ""}`.trim();
  return full_name || profile.user?.email || profile.id;
};

export const ProfilesSelector = ({
  value,
  onValueChange,
  onProfileSelect,
  excludeProfileIds = [],
  ariaInvalid,
  disabled = false,
  placeholder = "Buscar por nombre o email...",
}: {
  value?: string;
  onValueChange: (profile_id: string | undefined) => void;
  onProfileSelect?: (profile: DealershipMemberProfile) => void;
  excludeProfileIds?: string[];
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [search_value, set_search_value] = useState("");

  const debounced_search = useDebounce(search_value.trim(), 300);

  const profiles_query = useQuery({
    queryKey: ["profiles-selector", debounced_search],
    queryFn: async () => {
      const filter = debounced_search.includes("@")
        ? {
            page: 1,
            limit: 20,
            email: debounced_search || undefined,
          }
        : {
            page: 1,
            limit: 20,
            name: debounced_search || undefined,
          };

      const response = await profileService.getProfiles(filter);
      return response?.data ?? [];
    },
  });

  const profiles = useMemo(
    () =>
      (profiles_query.data ?? []).filter(
        (profile) => !excludeProfileIds.includes(profile.id),
      ),
    [profiles_query.data, excludeProfileIds],
  );

  const selected_profile_query = useQuery({
    queryKey: ["profiles-selector-selected", value],
    queryFn: async () => {
      if (!value) return null;
      return profileService.getProfile(value);
    },
    enabled: !!value,
  });

  const selected_profile = selected_profile_query.data
    ? profile_to_member_profile(selected_profile_query.data)
    : null;

  const handleSelectProfile = (profile: Profile) => {
    const member_profile = profile_to_member_profile(profile);
    onValueChange(profile.id);
    onProfileSelect?.(member_profile);
    set_search_value("");
  };

  return (
    <div className="flex flex-col gap-2">
      {value && selected_profile ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {get_profile_label(selected_profile)}
            </p>
            {selected_profile.user?.email ? (
              <p className="truncate text-xs text-muted-foreground">
                {selected_profile.user.email}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground shrink-0 text-xs transition"
            onClick={() => onValueChange(undefined)}
            disabled={disabled}
            aria-label="Quitar perfil seleccionado"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <Input
            value={search_value}
            onChange={(event) => set_search_value(event.target.value)}
            placeholder={placeholder}
            aria-invalid={ariaInvalid}
            disabled={disabled}
          />

          <div
            className={cn(
              "max-h-48 overflow-y-auto rounded-md border",
              ariaInvalid && "border-destructive",
            )}
          >
            {profiles_query.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`profile-selector-skeleton-${index}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-muted-foreground p-3 text-sm">
                No hay perfiles para mostrar.
              </p>
            ) : (
              <div className="flex flex-col">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    className="hover:bg-muted/50 border-b p-3 text-left last:border-b-0"
                    onClick={() => handleSelectProfile(profile)}
                    disabled={disabled}
                  >
                    <p className="text-sm font-medium">
                      {get_profile_label(profile_to_member_profile(profile))}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {profile.user.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
