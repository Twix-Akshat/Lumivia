import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const sessionId = Number(id)

  if (isNaN(sessionId)) {
    return NextResponse.json(
      { error: "Invalid session ID" },
      { status: 400 }
    )
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      patient: true,
      therapist: true,
    },
  })

  if (!session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(session)
}
