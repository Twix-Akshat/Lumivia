import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const therapistId = Number(id)

  if (isNaN(therapistId)) {
    return NextResponse.json(
      { error: "Invalid therapist ID" },
      { status: 400 }
    )
  }

  const therapist = await prisma.user.findUnique({
    where: { id: therapistId },
    include: {
      therapistAvailability: true,
      feedbackReceived: {
        include: {
          patient: {
            select: {
              fullName: true,
              profilePictureUrl: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
      _count: {
        select: {
          therapistSessions: {
            where: { status: "completed" },
          },
        },
      },
    },
  })

  if (!therapist || therapist.role !== "therapist") {
    return NextResponse.json(
      { error: "Therapist not found" },
      { status: 404 }
    )
  }

  // Compute aggregated feedback stats
  const feedbackList = therapist.feedbackReceived || []
  const totalReviews = feedbackList.length
  const averageRating =
    totalReviews > 0
      ? Math.round(
        (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalReviews) *
        10
      ) / 10
      : 0

  return NextResponse.json({
    ...therapist,
    averageRating,
    totalReviews,
    completedSessionCount: therapist._count.therapistSessions,
  })
}
