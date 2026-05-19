import { Euro } from "lucide-react";

export const PricingSuggestion = () => {
  return (
    <div className="border border-primary bg-primary/5 p-4 rounded-md flex items-center gap-4">
      <div className="min-w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
        <Euro className="size-8 text-primary" />
      </div>
      <div>
        <p className="text-primary">Precio sugerido por Wiauto</p>
        <div className="text-4xl font-bold flex items-center gap-2">
          <p>€24,800</p>
          <span>-</span>
          <p>€28,000</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Basado en 47 vehículos similares vendidos en los últimos 90 días..
        </p>
      </div>
    </div>
  );
};
