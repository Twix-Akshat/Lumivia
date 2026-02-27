import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const patientIdParam = searchParams.get("patientId")

  if (!patientIdParam) {
    return NextResponse.json({ error: "Patient ID required" }, { status: 400 })
  }

  const patientId = parseInt(patientIdParam)

  if (isNaN(patientId)) {
    return NextResponse.json({ error: "Invalid Patient ID" }, { status: 400 })
  }

  try {
    // 1️⃣ Patient's booked sessions
    const sessions = await prisma.session.findMany({
      where: { patientId },
      include: {
        therapist: true
      },
      orderBy: { scheduledDate: "asc" }
    })

    // 2️⃣ All therapists with availability
    const therapists = await prisma.user.findMany({
      where: { role: "therapist" },
      include: {
        therapistAvailability: true
      }
    })

    return NextResponse.json({
      sessions,
      therapists
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
