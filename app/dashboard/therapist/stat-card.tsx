import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    trend?: { value: string; positive: boolean }
    className?: string
    iconClassName?: string
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
    iconClassName,
}: StatCardProps) {
    return (
        <Card className={cn("border border-border shadow-sm", className)}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground font-heading">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                        )}
                        {trend && (
                            <p
                                className={cn(
                                    "mt-1 text-xs font-medium",
                                    trend.positive ? "text-[hsl(152,60%,40%)]" : "text-destructive"
                                )}
                            >
                                {trend.positive ? "+" : ""}
                                {trend.value}
                            </p>
                        )}
                    </div>
                    <div
                        className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            iconClassName || "bg-primary/10 text-primary"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
