import { EllipsisVerticalIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import type { DynamicTableAction } from "./types"
import { IconButton } from "../ui/iconButton"

//TODO: add the rest of the logic of this component
export const ActionsDropdown = ({ actions }: { actions?: DynamicTableAction[]  }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton variant="ghost" size="icon" text="Acciones">
          <EllipsisVerticalIcon className="size-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {actions?.map((action) => (
          <DropdownMenuItem key={action.key}>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
      
  )
}
