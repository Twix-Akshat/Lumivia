import prisma from "@/lib/prisma"

export async function autoCompleteSessions() {
    const now = new Date()

    const sessions = await prisma.session.findMany({
        where: {
            status: "accepted",
        },
    })

    for (const session of sessions) {
        const endDateTime = new Date(session.scheduledDate)

        const end = new Date(session.endTime)

        endDateTime.setHours(end.getHours())
        endDateTime.setMinutes(end.getMinutes())
        endDateTime.setSeconds(0)

        if (now > endDateTime) {
            await prisma.session.update({
                where: { id: session.id },
                data: {
                    status: "completed",
                    completedAt: now,
                },
            })
        }
    }
}