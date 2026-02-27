import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET all assessments
export async function GET() {
    try {
        const assessments = await prisma.assessment.findMany({
            select: {
                assessment_id: true,
                name: true,
                description: true,
            },
            orderBy: {
                assessment_id: "asc",
            },
        })

        return NextResponse.json(assessments)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Failed to fetch assessments" },
            { status: 500 }
        )
    }
}