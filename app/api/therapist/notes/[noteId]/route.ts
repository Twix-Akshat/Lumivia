import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        const { noteId: noteIdParam } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const noteId = Number(noteIdParam)
        const { noteContent } = await req.json()

        if (!noteContent) {
            return NextResponse.json(
                { error: "Note content required" },
                { status: 400 }
            )
        }

        // Verify ownership
        const existing = await prisma.therapistNote.findUnique({
            where: { id: noteId },
        })

        if (!existing || existing.therapistId !== Number(session.user.id)) {
            return NextResponse.json(
                { error: "Note not found or unauthorized" },
                { status: 404 }
            )
        }

        const updatedNote = await prisma.therapistNote.update({
            where: { id: noteId },
            data: {
                noteContent: noteContent,
            },
        })

        return NextResponse.json(updatedNote)
    } catch (error) {
        console.error("Update note error:", error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
        
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        const { noteId: noteIdParam } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const noteId = Number(noteIdParam)

        // Verify ownership
        const existing = await prisma.therapistNote.findUnique({
            where: { id: noteId },
        })

        if (!existing || existing.therapistId !== Number(session.user.id)) {
            return NextResponse.json(
                { error: "Note not found or unauthorized" },
                { status: 404 }
            )
        }

        await prisma.therapistNote.delete({
            where: { id: noteId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete note error:", error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}