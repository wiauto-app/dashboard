import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { Button } from "../ui/button";
import { useFilterPopoverStore } from "@/stores/useFilterPopoverStore";
export const FilterPopover = ({ filters }: { filters: React.ReactNode }) => {
  const isOpen = useFilterPopoverStore(state => state.isOpen);
  const setIsOpen = useFilterPopoverStore(state => state.setIsOpen);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button variant="outline">
          <Filter /> Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Filtros</PopoverTitle>
        </PopoverHeader>
        {filters}
        
      </PopoverContent>
    </Popover>
  );
};
