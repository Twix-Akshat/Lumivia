import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const skip = (page - 1) * limit

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      skip,
      take: limit,
      orderBy: { loggedAt: "desc" },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    }),
    prisma.activityLog.count(),
  ])

  return NextResponse.json({
    activities: activities.map((a) => ({
      id: String(a.id),
      activityType: a.activityType,
      deviceInfo: a.deviceInfo,
      ipAddress: a.ipAddress,
      loggedAt: a.loggedAt.toISOString(),
      user: a.user
        ? { id: a.user.id, fullName: a.user.fullName, email: a.user.email, role: a.user.role }
        : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
