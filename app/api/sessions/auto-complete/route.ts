import { NextResponse } from "next/server"
import { autoCompleteSessions } from "@/lib/autoCompleteSessions"

export async function POST() {
    await autoCompleteSessions()
    return NextResponse.json({ success: true })
}