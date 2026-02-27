import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Video } from "lucide-react"
import { firstLetterCapitalize } from "@/lib/utils"

export type SessionStatus = string
export type SessionType = string

type SessionCardProps = {
  date: string
  startTime: string
  endTime: string
  status: string
  sessionType?: string
  personName: string
  personRole: string
  meetingRoomId?: string | null
  sessionId?: number
  onJoin?: () => void
  onCancel?: () => void
}

/** Format ISO date to readable (e.g. "Feb 18, 2025"). */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return iso
  }
}

/** Extract time from ISO string (e.g. "10:00 AM"). */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  } catch {
    return iso
  }
}

export function SessionCard({
  date,
  startTime,
  endTime,
  status,
  sessionType,
  personName,
  personRole,
  meetingRoomId,
  sessionId,
  onJoin,
  onCancel,
}: SessionCardProps) {
  const canJoin = status === "accepted" && meetingRoomId
  const statusColor =
    status === "accepted"
      ? "bg-green-100 text-green-800"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : status === "completed"
          ? "bg-gray-100 text-gray-700"
          : status === "cancelled"
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-600"

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-800">{formatDate(date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {formatTime(startTime)} – {formatTime(endTime)}
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {firstLetterCapitalize(personRole)}: {personName}
            </p>
            {sessionType && (
              <p className="text-xs text-gray-500 capitalize">
                {String(sessionType).replace("_", " ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
            {firstLetterCapitalize(status)}
          </span>
          {canJoin && sessionId && (
            <Link href={`/session/${sessionId}/video`}>
              <Button size="sm" variant="default" className="gap-1">
                <Video className="h-3.5 w-3.5" />
                Join
              </Button>
            </Link>
          )}
          {onCancel && status !== "completed" && status !== "cancelled" && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
