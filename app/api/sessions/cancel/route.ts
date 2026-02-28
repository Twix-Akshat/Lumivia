import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { SessionStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity-logger";

export async function PUT(req: NextRequest) {
    const { sessionId } = await req.json();

    const session = await prisma.session.update({
        where: { id: sessionId },
        data: {
            status: SessionStatus.cancelled,
        },
    });

    // Notify the other party about cancellation
    // If cancelled by patient, notify therapist; if by therapist, notify patient
    const currentUserId = session.patientId; // You may need to get this from session/auth
    const notifyUserId = currentUserId === session.patientId ? session.therapistId : session.patientId;

    await createNotification({
        userId: notifyUserId,
        type: "general",
        message: "A therapy session has been cancelled.",
    });

    await logActivity(session.patientId, "SESSION_CANCELLED", req);

    return NextResponse.json({ success: true, session });
}