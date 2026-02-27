import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
    try {
        const sessionAuth = await getServerSession(authOptions)

        if (!sessionAuth)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const patientId = Number(sessionAuth.user.id)

        const body = await req.json()

        const { sessionId, rating, feedbackText } = body

        if (!sessionId || !rating)
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            )

        const therapySession = await prisma.session.findUnique({
            where: { id: sessionId },
        })

        if (!therapySession)
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            )

        if (therapySession.patientId !== patientId)
            return NextResponse.json(
                { error: "Not your session" },
                { status: 403 }
            )

        if (therapySession.status !== "completed")
            return NextResponse.json(
                { error: "Session not completed yet" },
                { status: 400 }
            )

        const existing = await prisma.feedback.findFirst({
            where: { sessionId },
        })

        if (existing)
            return NextResponse.json(
                { error: "Feedback already submitted" },
                { status: 400 }
            )

        const feedback = await prisma.feedback.create({
            data: {
                patientId,
                therapistId: therapySession.therapistId,
                sessionId,
                rating,
                feedbackText,
                submittedAt: new Date(),
            },
        })

        return NextResponse.json(feedback)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        )
    }
}