import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-2">
      <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-ink">
        Bienvenido
      </h1>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        Estás en el panel principal. El contenido de cada ruta protegida se renderiza en esta
        zona, con la barra lateral y la cabecera compartidas.
      </p>
    </div>
  )
}
