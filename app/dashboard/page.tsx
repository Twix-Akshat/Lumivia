"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardRedirect() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return

        if (!session) {
            router.replace("/auth/login")
            return
        }

        const role = session.user.role

        if (role === "admin") {
            router.replace("/dashboard/admin")
        } else if (role === "therapist") {
            router.replace("/dashboard/therapist")
        } else {
            router.replace("/dashboard/patient")
        }
    }, [session, status, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground animate-pulse">Redirecting to your dashboard...</p>
            </div>
        </div>
    )
}
