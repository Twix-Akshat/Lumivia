import prisma from "@/lib/prisma"
import { SessionStatus, SessionType } from "@prisma/client"
import { NextResponse } from "next/server"

/**
 * Convert "HH:mm" or "HH:mm:ss" into a Date object
 * compatible with @db.Time column
 */
function timeToDate(timeStr: string): Date {
  const clean = timeStr.trim().length === 5
    ? `${timeStr.trim()}:00`
    : timeStr.trim()

  // For @db.Time Prisma expects a Date object
  // It ignores the date part and only stores time
  return new Date(`1970-01-01T${clean}Z`)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      therapistId,
      patientId,
      selectedDate,
      startTime,
      endTime,
      issueDescription,
    } = body

    // ================= VALIDATION =================

    if (
      !therapistId ||
      !patientId ||
      !selectedDate ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const tId = Number(therapistId)
    const pId = Number(patientId)

    if (!Number.isInteger(tId) || !Number.isInteger(pId)) {
      return NextResponse.json(
        { error: "Invalid therapist or patient ID" },
        { status: 400 }
      )
    }

    const dateObj = new Date(selectedDate)

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    const startTimeObj = timeToDate(startTime)
    const endTimeObj = timeToDate(endTime)

    if (startTimeObj >= endTimeObj) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      )
    }

    // ================= PREVENT DOUBLE BOOKING =================

    const existingSession = await prisma.session.findFirst({
      where: {
        therapistId: tId,
        scheduledDate: dateObj,
        startTime: startTimeObj,
        status: {
          in: [SessionStatus.pending, SessionStatus.accepted],
        },
      },
    })

    if (existingSession) {
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 409 }
      )
    }

    // ================= CREATE SESSION =================

    const newSession = await prisma.session.create({
      data: {
        therapistId: tId,
        patientId: pId,
        scheduledDate: dateObj,
        startTime: startTimeObj,
        endTime: endTimeObj,
        status: SessionStatus.pending,
        sessionType: SessionType.video_call,
        issueDescription: issueDescription ?? null,
      },
    })

    return NextResponse.json(newSession, { status: 201 })

  } catch (error: unknown) {
    console.error("BOOKING ERROR:", error)
    const message = error instanceof Error ? error.message : "Server error"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
