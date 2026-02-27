import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const therapistIdParam = searchParams.get("therapistId")

  if (!therapistIdParam) {
    return NextResponse.json({ error: "Therapist ID required" }, { status: 400 })
  }

  const therapistId = parseInt(therapistIdParam)

  if (isNaN(therapistId)) {
    return NextResponse.json({ error: "Invalid Therapist ID" }, { status: 400 })
  }

  try {
    const availability = await prisma.therapistAvailability.findMany({
      where: { therapistId },
      orderBy: { dayOfWeek: "asc" }
    })

    const sessions = await prisma.session.findMany({
      where: { therapistId },
      include: {
        patient: true
      },
      orderBy: { scheduledDate: "asc" }
    })

    return NextResponse.json({
      availability,
      sessions
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
