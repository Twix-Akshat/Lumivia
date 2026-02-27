import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { therapistId, patientId, noteContent } =
            await req.json()

        if (!therapistId || !patientId || !noteContent) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Ensure the therapistId matches the logged-in user
        if (Number(therapistId) !== Number(session.user.id)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            )
        }

        const newNote = await prisma.therapistNote.create({
            data: {
                therapistId: Number(therapistId),
                patientId: Number(patientId),
                noteContent: noteContent,
                createdAt: new Date(),
            },
        })

        return NextResponse.json(newNote)
    } catch (error) {
        console.error("Create note error:", error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}