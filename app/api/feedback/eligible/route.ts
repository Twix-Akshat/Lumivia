import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
    const sessionAuth = await getServerSession(authOptions)

    if (!sessionAuth)
        return NextResponse.json([], { status: 401 })

    const patientId = Number(sessionAuth.user.id)

    const sessions = await prisma.session.findMany({
        where: {
            patientId,
            status: "completed",
            feedback: null,
        },
        include: {
            therapist: true,
        },
        orderBy: {
            scheduledDate: "desc",
        },
    })

    return NextResponse.json(sessions)
}