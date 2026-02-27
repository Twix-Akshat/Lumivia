import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

type Role = "admin" | "patient" | "therapist"

export async function requireRole(
  allowedRoles: Role | Role[]
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role) {
    return null
  }

  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles]

  const hasAccess = rolesArray.includes(
    session.user.role as Role
  )

  if (!hasAccess) {
    return null
  }

  return session
}