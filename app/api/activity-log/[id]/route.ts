import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// DELETE ACTIVITY LOG

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // 🔥 MUST AWAIT params in Next 15
        const { id } = await params

        const activityLogId = Number(id)

        if (isNaN(activityLogId)) {
            return NextResponse.json(
                { error: "Invalid activity log id" },
                { status: 400 }
            )
        }

        const existing = await prisma.activityLog.findFirst({
            where: {
                id: activityLogId,
            },
        })

        if (!existing) {
            return NextResponse.json(
                { error: "Activity log not found or not allowed" },
                { status: 404 }
            )
        }

        await prisma.activityLog.delete({
            where: { id: activityLogId },
        })

        return NextResponse.json({ message: "Deleted successfully" })
    } catch (error) {
        console.error("DELETE ERROR:", error)
        return NextResponse.json(
            { error: "Failed to delete activity log" },
            { status: 500 }
        )
    }
}

