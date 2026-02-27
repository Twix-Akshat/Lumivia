import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { therapistId, selectedDate } = await req.json()

        if (!therapistId || !selectedDate) {
            return NextResponse.json(
                { error: "Missing therapistId or selectedDate" },
                { status: 400 }
            )
        }

        // Parse date parts manually to get the LOCAL weekday
        // (new Date("YYYY-MM-DD") parses as UTC midnight, giving wrong getDay() in UTC+ timezones)
        const [year, month, day] = selectedDate.split("-").map(Number)
        const localDate = new Date(year, month - 1, day)

        if (isNaN(localDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            )
        }

        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]

        const dayOfWeek = days[localDate.getDay()]

        // 1️⃣ Get ALL availability blocks for that day
        const availabilityBlocks = await prisma.therapistAvailability.findMany({
            where: {
                therapistId: therapistId,
                dayOfWeek: {
                    equals: dayOfWeek,
                    mode: "insensitive",
                },
            },
        })

        if (!availabilityBlocks.length) {
            return NextResponse.json([])
        }

        const duration = 45 // minutes
        const breakTime = 15 // minutes

        let generatedSlots: { start: string; end: string }[] = []

        /** Format a Date as "HH:mm" using UTC time components */
        const toHHMM = (d: Date) =>
            `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`

        // 2️⃣ Generate slots from ALL availability blocks
        // Prisma returns @db.Time fields as Date objects: 1970-01-01T{time}Z
        // Work entirely in UTC milliseconds to stay consistent
        for (const block of availabilityBlocks) {
            let currentMs = block.startTime.getTime()
            const endMs = block.endTime.getTime()

            while (currentMs + duration * 60000 <= endMs) {
                const slotEndMs = currentMs + duration * 60000

                generatedSlots.push({
                    start: toHHMM(new Date(currentMs)),
                    end: toHHMM(new Date(slotEndMs)),
                })

                currentMs = slotEndMs + breakTime * 60000
            }
        }

        // 3️⃣ Fetch booked sessions for THAT DATE
        // Use localDate (correctly built from the string parts above)
        const startOfDay = new Date(localDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(localDate)
        endOfDay.setHours(23, 59, 59, 999)

        const bookedSessions = await prisma.session.findMany({
            where: {
                therapistId: therapistId,
                scheduledDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: {
                startTime: true,
            },
        })

        // Extract "HH:mm" in UTC to match how generatedSlots are formatted
        const bookedTimes = bookedSessions.map((s) =>
            `${String(s.startTime.getUTCHours()).padStart(2, "0")}:${String(s.startTime.getUTCMinutes()).padStart(2, "0")}`
        )

        // 4️⃣ Remove booked slots
        const availableSlots = generatedSlots.filter(
            (slot) => !bookedTimes.includes(slot.start)
        )

        return NextResponse.json(availableSlots)
    } catch (error) {
        console.error("Available slots error:", error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}