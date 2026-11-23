import { useNavigate } from "@tanstack/react-router";
import { Store } from "lucide-react";

import { IconButton } from "@/components/ui/iconButton";
import type { ProfileDealership } from "@/types/profiles.types";

/** Abre el listado de concesionarios filtrado por el concesionario del usuario. */
export function ViewDealershipAction({
  dealership,
}: {
  dealership: ProfileDealership;
}) {
  const navigate = useNavigate();

  return (
    <IconButton
      text="Ver concesionario"
      ariaLabel={`Ver concesionario ${dealership.name}`}
      size="icon-sm"
      onClick={() => {
        void navigate({ to: "/dealership", search: { id: dealership.id } });
      }}
    >
      <Store className="size-4" />
    </IconButton>
  );
}
