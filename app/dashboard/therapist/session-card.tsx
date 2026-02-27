"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Clock, Video, FileText, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export type SessionStatus = "pending" | "accepted" | "completed" | "cancelled" | "rejected"
export type SessionType = "video" | "audio" | "chat"

interface SessionCardProps {
    date: string
    startTime: string
    endTime: string
    status: string
    sessionType: string
    personName: string
    personRole: "patient" | "therapist"
    issueDescription: string | null
    meetingRoomId?: string | null
    onAccept?: () => void
    onDecline?: () => void
    onJoin?: () => void
    onMarkCompleted?: () => void
    className?: string
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

function formatTime(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
    } catch (e) {
        return dateStr
    }
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    } catch (e) {
        return dateStr
    }
}

const statusStyles: Record<string, string> = {
    pending: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,70%,35%)] border-[hsl(38,92%,50%)]/20",
    accepted: "bg-[hsl(200,90%,50%)]/10 text-[hsl(200,90%,40%)] border-[hsl(200,90%,50%)]/20",
    completed: "bg-[hsl(152,60%,40%)]/10 text-[hsl(152,60%,30%)] border-[hsl(152,60%,40%)]/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

export function SessionCard({
    date,
    startTime,
    endTime,
    status,
    sessionType,
    personName,
    personRole,
    issueDescription,
    meetingRoomId,
    onAccept,
    onDecline,
    onJoin,
    onMarkCompleted,
    className,
}: SessionCardProps) {
    const router = useRouter()
    const isVideo = sessionType === "video"

    return (
        <Card className={cn("border border-border shadow-sm hover:shadow-md transition-all", className)}>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">

                    {/* Time & Date Block */}
                    <div className="flex items-start gap-4 min-w-[140px]">
                        <div className="p-2.5 bg-muted rounded-lg flex flex-col items-center justify-center min-w-[60px] text-center border border-border">
                            <span className="text-xs font-bold uppercase text-muted-foreground">{new Date(date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-xl font-bold text-foreground font-heading">{new Date(date).getDate()}</span>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatTime(startTime)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 ml-5">
                                to {formatTime(endTime)}
                            </p>
                            <div className="mt-2.5">
                                <Badge variant="outline" className={cn("text-[10px] capitalize h-5 px-1.5", statusStyles[status] || "bg-muted text-muted-foreground")}>
                                    {status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="flex-1 border-l border-border/50 pl-0 md:pl-4 md:ml-0 mt-2 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {getInitials(personName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-foreground">{personName}</span>
                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">
                                        {personRole}
                                    </span>
                                </div>
                                {issueDescription && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                                        <span className="font-medium text-foreground/80 mr-1">Topic:</span>
                                        {issueDescription}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Session Type Badge */}
                        <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="h-5 text-[10px] gap-1 px-2 font-normal">
                                {isVideo ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                {sessionType === "video" ? "Video Call" : "Audio/Chat"}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col items-center justify-end gap-2 mt-2 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0">
                        {status === "pending" && (
                            <>
                                <Button size="sm" onClick={onAccept} className="w-full md:w-auto h-8 text-xs gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Accept
                                </Button>
                                <Button size="sm" variant="outline" onClick={onDecline} className="w-full md:w-auto h-8 text-xs gap-1.5 text-destructive hover:text-destructive">
                                    <XCircle className="h-3.5 w-3.5" />
                                    Decline
                                </Button>
                            </>
                        )}

                        {status === "accepted" && (
                            <>
                                <Button size="sm" onClick={onJoin} className="w-full md:w-auto h-8 text-xs gap-1.5 bg-[hsl(200,90%,40%)] hover:bg-[hsl(200,90%,35%)]">
                                    <Video className="h-3.5 w-3.5" />
                                    Join Call
                                </Button>
                                <Button size="sm" onClick={onMarkCompleted} className="w-full md:w-auto h-8 text-xs gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Mark Completed
                                </Button>
                            </>
                        )}

                        {/* {status === "completed" && (
                            <>
                                <Button size="sm" variant="outline" className="w-full md:w-auto h-8 text-xs">
                                    View
                                </Button>

                            </>

                        )} */}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
