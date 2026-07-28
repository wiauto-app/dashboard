import { createFileRoute } from "@tanstack/react-router"
import { AdminDashboardHome } from "@/components/dashboard/AdminDashboardHome"

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
})

function Index() {
  return <AdminDashboardHome />
}
