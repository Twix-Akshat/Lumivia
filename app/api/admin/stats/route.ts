import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [totalUsers, patientCount, therapistCount, adminCount, sessionCount, activityCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "patient" } }),
      prisma.user.count({ where: { role: "therapist" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.session.count(),
      prisma.activityLog.count(),
    ])

  return NextResponse.json({
    totalUsers,
    byRole: { patient: patientCount, therapist: therapistCount, admin: adminCount },
    totalSessions: sessionCount,
    totalActivities: activityCount,
  })
}
