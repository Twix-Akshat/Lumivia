import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// CREATE JOURNAL
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { title, entryText, moodValue, tags } = body

        if (!title || !entryText) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const journal = await prisma.journal.create({
            data: {
                patientId: Number(session.user.id), // 👈 comes from session
                title,
                entryText,
                moodValue: moodValue ? Number(moodValue) : null,
                tags,
                createdAt: new Date(),
            },
        })

        return NextResponse.json(journal, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to create journal" },
            { status: 500 }
        )
    }
}

// GET JOURNALS (ONLY FOR LOGGED IN PATIENT)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json([], { status: 200 }) // always array
        }

        const journals = await prisma.journal.findMany({
            where: {
                patientId: Number(session.user.id), // 👈 secure
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(journals)
    } catch (error) {
        console.error(error)
        return NextResponse.json([], { status: 200 }) // prevent crash
    }
}
