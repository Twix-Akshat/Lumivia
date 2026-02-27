import prisma from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

export async function createNotification({
    userId,
    type,
    message,
}: {
    userId: number
    type: NotificationType
    message: string
}) {
    return prisma.notification.create({
        data: {
            userId,
            notificationType: type,
            message
        },
    })
}