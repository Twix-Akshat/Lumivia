import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// GET SINGLE JOURNAL
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const journal = await prisma.journal.findFirst({
            where: {
                id: Number(id),
                patientId: Number(session.user.id), // 👈 ownership check
            },
        })

        if (!journal) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        return NextResponse.json(journal)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to fetch journal" },
            { status: 500 }
        )
    }
}

// UPDATE JOURNAL
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()

        // Ensure journal belongs to logged-in patient
        const existing = await prisma.journal.findFirst({
            where: {
                id: Number(id),
                patientId: Number(session.user.id),
            },
        })

        if (!existing) {
            return NextResponse.json({ error: "Not allowed" }, { status: 403 })
        }

        const updated = await prisma.journal.update({
            where: { id: Number(id) },
            data: {
                title: body.title,
                entryText: body.entryText,
                moodValue: body.moodValue ? Number(body.moodValue) : null,
                tags: body.tags,
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to update journal" },
            { status: 500 }
        )
    }
}

// DELETE JOURNAL

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // 🔥 MUST AWAIT params in Next 15
        const { id } = await params

        const journalId = Number(id)

        if (isNaN(journalId)) {
            return NextResponse.json(
                { error: "Invalid journal id" },
                { status: 400 }
            )
        }

        const existing = await prisma.journal.findFirst({
            where: {
                id: journalId,
                patientId: Number(session.user.id),
            },
        })

        if (!existing) {
            return NextResponse.json(
                { error: "Journal not found or not allowed" },
                { status: 404 }
            )
        }

        await prisma.journal.delete({
            where: { id: journalId },
        })

        return NextResponse.json({ message: "Deleted successfully" })
    } catch (error) {
        console.error("DELETE ERROR:", error)
        return NextResponse.json(
            { error: "Failed to delete journal" },
            { status: 500 }
        )
    }
}

