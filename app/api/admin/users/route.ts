import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") as "patient" | "therapist" | "admin" | null
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const skip = (page - 1) * limit

  const where = role ? { role } : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        verificationStatus: true,
        specialization: true,
        consultationFee: true,
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      consultationFee: u.consultationFee != null ? Number(u.consultationFee) : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
