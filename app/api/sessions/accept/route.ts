import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "../../../../lib/prisma";
import { SessionStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();
  const roomId = `therapy-${sessionId}-${crypto.randomUUID()}`;

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.accepted,
      meetingRoomId: roomId,
    },
  });

  // Notify patient that session was accepted
  await createNotification({
    userId: session.patientId,
    type: "session_accepted",
    message: "Your therapy session has been accepted.",
  });

  return NextResponse.json({ success: true, session });
}