import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: {
      userId: Number(session.user.id),
      readStatus: false,
    },
    data: {
      readStatus: true,
    },
  })

  return NextResponse.json({ success: true })
}