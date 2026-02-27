import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const availability = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: Number(session.user.id),
            },
            orderBy: { dayOfWeek: "asc" },
        })

        return NextResponse.json(availability)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch availability" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { dayOfWeek, startTime, endTime } = body

        if (!dayOfWeek || !startTime || !endTime) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            )
        }

        // Prisma expects a full DateTime for @db.Time fields.
        // We use a fixed base date so only the time portion matters.
        const toDateTime = (timeStr: string): Date => {
            const date = new Date(`1970-01-01T${timeStr}:00.000Z`)
            if (isNaN(date.getTime())) throw new Error(`Invalid time value: ${timeStr}`)
            return date
        }

        const startDateTime = toDateTime(startTime)
        const endDateTime = toDateTime(endTime)

        const existing = await prisma.therapistAvailability.findFirst({
            where: {
                therapistId: Number(session.user.id),
                dayOfWeek,
            },
        })

        let result;
        if (existing) {
            result = await prisma.therapistAvailability.update({
                where: { id: existing.id },
                data: { startTime: startDateTime, endTime: endDateTime },
            })
        } else {
            result = await prisma.therapistAvailability.create({
                data: {
                    therapistId: Number(session.user.id),
                    dayOfWeek,
                    startTime: startDateTime,
                    endTime: endDateTime,
                },
            })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("[availability POST]", error)
        return NextResponse.json(
            { error: "Failed to save availability" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { id } = body

        if (!id) {
            return NextResponse.json(
                { error: "Missing availability id" },
                { status: 400 }
            )
        }

        // Verify ownership before deleting
        const existing = await prisma.therapistAvailability.findUnique({
            where: { id: Number(id) },
        })

        if (!existing || existing.therapistId !== Number(session.user.id)) {
            return NextResponse.json(
                { error: "Availability not found or unauthorized" },
                { status: 404 }
            )
        }

        // Check for active sessions on this day of the week
        const dayIndex: Record<string, number> = {
            Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
            Thursday: 4, Friday: 5, Saturday: 6,
        }

        const activeSessions = await prisma.session.findMany({
            where: {
                therapistId: Number(session.user.id),
                status: { in: ["pending", "accepted"] },
            },
            select: { scheduledDate: true },
        })

        // Filter sessions that fall on the same day of week
        const conflicting = activeSessions.filter(
            (s) => new Date(s.scheduledDate).getDay() === dayIndex[existing.dayOfWeek]
        )

        if (conflicting.length > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete: you have ${conflicting.length} active session(s) on ${existing.dayOfWeek}. Please cancel or complete them first.`,
                },
                { status: 409 }
            )
        }

        await prisma.therapistAvailability.delete({
            where: { id: Number(id) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[availability DELETE]", error)
        return NextResponse.json(
            { error: "Failed to delete availability" },
            { status: 500 }
        )
    }
}
