import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const therapistId = parseInt(id)

        const feedback = await prisma.feedback.findMany({
            where: {
                therapistId,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true,
                    },
                },
            },
            orderBy: {
                submittedAt: "desc",
            },
        })

        return NextResponse.json(feedback)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to fetch feedback" },
            { status: 500 }
        )
    }
}