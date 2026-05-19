import { EllipsisVerticalIcon } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import type { DynamicTableAction } from "./types"

//TODO: add the rest of the logic of this component
export const ActionsDropdown = ({ actions }: { actions?: DynamicTableAction[]  }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <EllipsisVerticalIcon className="size-4" />
        </Button>
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
