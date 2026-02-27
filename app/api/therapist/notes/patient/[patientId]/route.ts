import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ patientId: string }> }
) {
    try {
        const { patientId: patientIdParam } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const patientId = Number(patientIdParam)

        if (isNaN(patientId)) {
            return NextResponse.json(
                { error: "Invalid patient ID" },
                { status: 400 }
            )
        }

        const notes = await prisma.therapistNote.findMany({
            where: {
                therapistId: Number(session.user.id),
                patientId: patientId,
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(notes)
    } catch (error) {
        console.error("Fetch patient notes error:", error)
        return NextResponse.json(
            { error: "Failed to fetch notes" },
            { status: 500 }
        )
    }
}
