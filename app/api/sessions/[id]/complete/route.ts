import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { SessionStatus } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const sessionId = parseInt(id)

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.completed,
      completedAt: new Date().toISOString(),
    },
  })

  return NextResponse.json(updated)
}