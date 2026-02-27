import type { LucideIcon } from "lucide-react"

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: string; positive: boolean }
  icon: LucideIcon
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-1 text-xs ${trend.positive ? "text-green-600" : "text-red-600"}`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-2 ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
