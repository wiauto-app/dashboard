import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { useFiltersManager } from "@/hooks/useFiltersManager";
import { profileService } from "@/services/profiles/profileService";
import type { Profile } from "@/types/profiles.types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { chatService } from "./services/chatService";

export const CreateChatDialog = () => {
  const query_client = useQueryClient();
  const { user } = useAuth();
  const { handleChange } = useFiltersManager({ path: "/messages" });

  const [is_open, set_is_open] = useState(false);
  const [search_value, set_search_value] = useState("");
  const [selected_profile_id, set_selected_profile_id] = useState<
    string | null
  >(null);
  const [vehicle_id, set_vehicle_id] = useState<string | null>(null);

  const debounced_search = useDebounce(search_value.trim(), 300);

  const profiles_query = useQuery({
    queryKey: ["chat-create-profiles", debounced_search],
    enabled: is_open,
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
      (profiles_query.data ?? []).filter((profile) => profile.id !== user?.id),
    [profiles_query.data, user?.id],
  );

  const selected_profile = useMemo(
    () =>
      profiles.find((profile) => profile.id === selected_profile_id) ?? null,
    [profiles, selected_profile_id],
  );

  const create_chat_mutation = useMutation({
    mutationFn: async () => {
      if (!selected_profile_id) {
        throw new Error("Debes seleccionar un usuario.");
      }

      return chatService.create({
        participants: [selected_profile_id],
        vehicle_id: vehicle_id,
      });
    },
    onSuccess: async (chat) => {
      toast.success("Chat creado correctamente.");
      handleChange("chat_id", chat.id);
      await query_client.invalidateQueries({ queryKey: ["chat-list"] });
      set_is_open(false);
      set_search_value("");
      set_selected_profile_id(null);
      set_vehicle_id("");
    },
    onError: (e) => {
      console.log(e);
      toast.error("No se pudo crear el chat.");
    },
  });

  return (
    <Dialog open={is_open} onOpenChange={set_is_open}>
      <DialogTrigger
        render={
          <Button aria-label="Crear chat">
            <PlusIcon className="size-4" />
          </Button>
        }
      ></DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear chat</DialogTitle>
          <DialogDescription>
            Busca un usuario por nombre o email, selecciónalo y crea el chat.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search_value}
            onChange={(event) => set_search_value(event.target.value)}
          />

          <Input
            placeholder="ID del vehículo (UUID)"
            value={vehicle_id ?? ""}
            onChange={(event) => set_vehicle_id(event.target.value)}
          />

          <div className="max-h-72 overflow-y-auto rounded-md border">
            {profiles_query.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={`profile-skeleton-${index}`}
                    className="h-12 w-full"
                  />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No hay perfiles para mostrar.
              </p>
            ) : (
              <div className="flex flex-col">
                {profiles.map((profile: Profile) => {
                  const is_selected = selected_profile_id === profile.id;
                  const full_name =
                    `${profile.name ?? ""} ${profile.last_name ?? ""}`.trim();
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      className={`border-b p-3 text-left last:border-b-0 ${
                        is_selected ? "bg-primary/10" : "hover:bg-muted/50"
                      }`}
                      onClick={() => set_selected_profile_id(profile.id)}
                    >
                      <p className="text-sm font-medium">
                        {full_name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.user.email}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selected_profile && (
            <p className="text-xs text-muted-foreground">
              Seleccionado:{" "}
              <span className="font-medium text-foreground">
                {`${selected_profile.name ?? ""} ${selected_profile.last_name ?? ""}`.trim() ||
                  selected_profile.user.email}
              </span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => create_chat_mutation.mutate()}
            disabled={create_chat_mutation.isPending || !selected_profile_id}
          >
            Crear chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
