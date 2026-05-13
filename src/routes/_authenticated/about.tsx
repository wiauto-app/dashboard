import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/about")({
  component: About,
})

function About() {
  return (
    <div className="space-y-2">
      <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-ink">
        Acerca
      </h1>
      <p className="text-sm text-muted-foreground">
        Vista de ejemplo dentro del layout autenticado.
      </p>
    </div>
  )
}
