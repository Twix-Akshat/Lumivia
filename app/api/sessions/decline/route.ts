import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { SessionStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
    const { sessionId } = await req.json();

    const session = await prisma.session.update({
        where: { id: sessionId },
        data: {
            status: SessionStatus.declined,
        },
    });

    // Notify patient that session was declined
    await createNotification({
        userId: session.patientId,
        type: "general",
        message: "Your therapy session request has been declined.",
    });

    return NextResponse.json({ success: true, session });
}