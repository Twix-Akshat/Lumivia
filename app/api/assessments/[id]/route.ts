import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const assessment = await prisma.assessment.findUnique({
            where: {
                assessment_id: Number(id),
            },
        })

        if (!assessment) {
            return NextResponse.json(
                { error: "Assessment not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(assessment)

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to fetch assessment" },
            { status: 500 }
        )
    }
}