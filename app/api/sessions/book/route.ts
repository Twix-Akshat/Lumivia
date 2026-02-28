import prisma from "@/lib/prisma"
import { SessionStatus, SessionType } from "@prisma/client"
import { NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"
import { logActivity } from "@/lib/activity-logger"

/**
 * Convert "HH:mm" or "HH:mm:ss" into a Date object for @db.Time.
 * Uses UTC and zero ms so Prisma equality checks match.
 */
function timeToDate(timeStr: string): Date {
  const clean = timeStr.trim().length === 5
    ? `${timeStr.trim()}:00`
    : timeStr.trim()
  const d = new Date(`1970-01-01T${clean}Z`)
  d.setUTCMilliseconds(0)
  return d
}

/** Parse YYYY-MM-DD as calendar date, return Date at midnight UTC (no TZ flip). */
function parseDateOnly(selectedDate: string): Date {
  const parts = selectedDate.trim().split("-")
  if (parts.length !== 3) {
    return new Date(NaN)
  }
  const [y, m, d] = parts.map(Number)
  const dateObj = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
  return dateObj
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

    const dateObj = parseDateOnly(selectedDate)

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    const startTimeObj = timeToDate(startTime)
    const endTimeObj = timeToDate(endTime)
    startTimeObj.setUTCMilliseconds(0)
    endTimeObj.setUTCMilliseconds(0)

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

    // Create notification for therapist
    await createNotification({
      userId: tId,
      type: "booking_request",
      message: "You have a new booking request.",
    })

    // Log activity
    await logActivity(pId, "SESSION_BOOKED", req)

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
