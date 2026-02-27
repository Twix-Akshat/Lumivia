import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function getSeverity(score: number) {

  if (score <= 4) return "Minimal"
  if (score <= 9) return "Mild"
  if (score <= 14) return "Moderate"
  if (score <= 19) return "Moderately Severe"
  return "Severe"

}

export async function POST(req: NextRequest) {

  try {

    const body = await req.json()

    const {
      patientId,
      assessmentId,
      score
    } = body

    if (!patientId || !assessmentId || score === undefined) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    const severity = getSeverity(score)

    const result = await prisma.assessmentResult.create({
      data: {
        patientId: Number(patientId),
        assessmentId: Number(assessmentId),
        numericalScore: Number(score),
        severityLevel: severity,
        completedAt: new Date(),
      },
    })

    return NextResponse.json(result, { status: 201 })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    )

  }

}