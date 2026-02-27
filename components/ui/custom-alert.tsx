"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertColor = "success" | "danger" | "warning" | "info"

type AlertItem = {
    id: number
    message: string
    color: AlertColor
}

type AlertContextType = {
    showAlert: (message: string, color?: AlertColor) => void
}

const AlertContext = createContext<AlertContextType | null>(null)

export function useAlert() {
    const ctx = useContext(AlertContext)
    if (!ctx) throw new Error("useAlert must be used within AlertProvider")
    return ctx
}

const colorConfig: Record<AlertColor, { border: string; icon: string; bg: string }> = {
    success: {
        border: "before:bg-emerald-500",
        icon: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    danger: {
        border: "before:bg-red-500",
        icon: "text-red-500",
        bg: "bg-red-50 dark:bg-red-950/30",
    },
    warning: {
        border: "before:bg-amber-500",
        icon: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    info: {
        border: "before:bg-blue-500",
        icon: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/30",
    },
}

const icons: Record<AlertColor, React.ElementType> = {
    success: CheckCircle2,
    danger: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

function AlertToast({ item, onDismiss }: { item: AlertItem; onDismiss: (id: number) => void }) {
    const config = colorConfig[item.color]
    const Icon = icons[item.color]

    React.useEffect(() => {
        const timer = setTimeout(() => onDismiss(item.id), 4000)
        return () => clearTimeout(timer)
    }, [item.id, onDismiss])

    return (
        <div
            className={cn(
                "relative flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg",
                "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-lg",
                "animate-in slide-in-from-top-2 fade-in duration-300",
                config.bg,
                config.border
            )}
        >
            <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.icon)} />
            <p className="text-sm text-gray-800 dark:text-gray-200 flex-1 leading-relaxed">
                {item.message}
            </p>
            <button
                onClick={() => onDismiss(item.id)}
                className="shrink-0 rounded-md p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

let nextId = 0

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<AlertItem[]>([])

    const showAlert = useCallback((message: string, color: AlertColor = "info") => {
        const id = ++nextId
        setAlerts((prev) => [...prev, { id, message, color }])
    }, [])

    const dismiss = useCallback((id: number) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
    }, [])

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {/* Alert container - fixed top-right */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {alerts.map((item) => (
                    <div key={item.id} className="pointer-events-auto">
                        <AlertToast item={item} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    )
}
