import { requireRole } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminDashboardClient from "./AdminDashboardClient"

export default async function AdminDashboardPage() {
  const session = await requireRole("admin")

  if (!session) {
    redirect("/auth/login")
  }

  return <AdminDashboardClient />
}
