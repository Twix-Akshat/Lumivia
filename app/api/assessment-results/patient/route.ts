import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

    try {

        const { searchParams } = new URL(req.url)

        const patientId = searchParams.get("patientId")

        if (!patientId) {
            return NextResponse.json(
                { error: "patientId required" },
                { status: 400 }
            )
        }

        const results = await prisma.assessmentResult.findMany({

            where: {
                patientId: Number(patientId)
            },

            include: {
                assessment: true
            },

            orderBy: {
                completedAt: "desc"
            }

        })

        return NextResponse.json(results)

    }
    catch (error) {

        console.error(error)

        return NextResponse.json(
            { error: "Failed to fetch results" },
            { status: 500 }
        )

    }

}