import prisma from "@/lib/prisma"

/**
 * Log an activity to the activity_logs table.
 * Call this from API routes after a successful mutation.
 *
 * @param userId   - The user performing the action (null for anonymous)
 * @param type     - Activity type string (e.g. "REGISTER", "LOGIN", "SESSION_BOOKED")
 * @param req      - The incoming Request object (used to extract IP + user-agent)
 */
export async function logActivity(
    userId: number | null,
    type: string,
    req: Request
) {
    try {
        const forwarded = req.headers.get("x-forwarded-for")
        const ipAddress = forwarded?.split(",")[0]?.trim() || "127.0.0.1"
        const deviceInfo = req.headers.get("user-agent") || "Unknown"

        await prisma.activityLog.create({
            data: {
                userId,
                activityType: type,
                deviceInfo,
                ipAddress,
                loggedAt: new Date(),
            },
        })
    } catch (error) {
        // Never let logging failures break the main flow
        console.error("Activity log error:", error)
    }
}
