import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import prisma from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { logActivity } from "@/lib/activity-logger"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await context.params
  const userId = parseInt(id, 10)
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  const body = await req.json()
  const updateData: { role?: "patient" | "therapist" | "admin"; verificationStatus?: "Pending" | "Verified" | "Rejected" } = {}

  if (["patient", "therapist", "admin"].includes(body.role)) {
    updateData.role = body.role
  }
  if (["Pending", "Verified", "Rejected"].includes(body.verificationStatus)) {
    updateData.verificationStatus = body.verificationStatus
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      verificationStatus: true,
    },
  })

  // Notify user about account changes
  let notificationMessage = "";
  if (updateData.verificationStatus === "Verified") {
    notificationMessage = "Your account has been verified by an administrator.";
  } else if (updateData.verificationStatus === "Rejected") {
    notificationMessage = "Your account verification has been rejected. Please contact support.";
  } else if (updateData.role) {
    notificationMessage = `Your account role has been updated to ${updateData.role}.`;
  }

  if (notificationMessage) {
    await createNotification({
      userId: updated.id,
      type: "general",
      message: notificationMessage,
    });
  }

  // Log admin activity
  const adminId = Number(session.user.id)
  if (updateData.verificationStatus) {
    await logActivity(adminId, "VERIFICATION_STATUS_CHANGED", req)
  }
  if (updateData.role) {
    await logActivity(adminId, "ROLE_CHANGED", req)
  }

  return NextResponse.json(updated)
}
