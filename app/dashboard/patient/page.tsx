"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  CalendarDays,
  Heart,
  BookOpen,
  Search,
  Video,
  Filter,
  X,
  MessageSquare,
} from "lucide-react"
import { StatCard } from "./stat-card"
import { SessionCard } from "./session-card"
import { TherapistCard } from "./therapist-card"
import { useAlert } from "@/components/ui/custom-alert"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Noto_Sans_New_Tai_Lue } from "next/font/google"

type SessionWithTherapist = {
  id: number
  scheduledDate: string
  startTime: string
  endTime: string
  status: string
  sessionType?: string
  issueDescription?: string | null
  meetingRoomId?: string | null
  therapist?: { fullName: string }
}

type AvailabilitySlot = {
  id: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

type TherapistWithAvailability = {
  id: number
  fullName: string
  profilePictureUrl?: string | null
  specialization: string | null
  consultationFee: number | string
  experienceYears?: number | null
  therapistAvailability: AvailabilitySlot[]
}

export default function PatientDashboard() {
  const { data: session } = useSession()
  const patientId = session?.user?.id
  const router = useRouter()
  const { showAlert } = useAlert()

  const [sessions, setSessions] = useState<SessionWithTherapist[]>([])
  const [therapists, setTherapists] = useState<TherapistWithAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sessionFilter, setSessionFilter] = useState<"all" | "upcoming" | "past">("all")
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [wellnessScore, setWellnessScore] = useState<number | null>(null)
  const [wellnessTrend, setWellnessTrend] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null)

  const upcomingSessions = sessions.filter(
    (s) => s.status === "accepted" || s.status === "pending"
  )
  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  )

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const filteredSessions = (() => {
    let result =
      sessionFilter === "upcoming"
        ? upcomingSessions
        : sessionFilter === "past"
          ? pastSessions
          : sessions
    if (statusFilter.size > 0) {
      result = result.filter((s) => statusFilter.has(s.status))
    }
    return result
  })()

  const filteredTherapists = therapists.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  useEffect(() => {
    if (!patientId) return
    fetch(`/api/patient/dashboard?patientId=${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setSessions(data.sessions || [])
        setTherapists(data.therapists || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [patientId])

  // Check profile completeness on login
  useEffect(() => {
    if (!session?.user) return
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return
        const requiredFields = ["fullName", "profilePictureUrl"] as const
        const isIncomplete = requiredFields.some(
          (field) => !data[field] || (typeof data[field] === "string" && !data[field].trim())
        )
        if (isIncomplete) {
          setProfileIncomplete(true)
        }
      })
      .catch(() => { })
  }, [session?.user])

  // Fetch latest wellness score
  useEffect(() => {
    if (!patientId) return
    fetch(`/api/assessment-results/patient?patientId=${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWellnessScore(data[0].numericalScore)
          setWellnessTrend(data[0].severityLevel ?? null)
        }
      })
      .catch(() => { })
  }, [patientId])

  // Auto-complete sessions whose end time has passed
  useEffect(() => {
    fetch("/api/sessions/auto-complete", { method: "POST" })
  }, [])

  async function handleCancel(sessionId: number) {
    setPendingCancelId(sessionId)
    setCancelDialogOpen(true)
  }

  async function doCancelSession() {
    if (!pendingCancelId) return
    try {
      const res = await fetch("/api/sessions/cancel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: pendingCancelId }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        showAlert(data?.error || "Cancellation failed", "danger")
        return
      }
      setSessions((prev) =>
        prev.map((s) => (s.id === pendingCancelId ? { ...s, status: "cancelled" } : s))
      )
    } catch {
      showAlert("Cannot reach the server. Please try again.", "danger")
    }
  }


  if (loading) return <p className="p-6">Loading...</p>

  const firstName = session?.user?.name?.split(" ")[0] ?? "there"
  const nextSession = upcomingSessions[0]
  const nextSessionDate = nextSession
    ? new Date(nextSession.scheduledDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    : null
  const nextSessionTime = nextSession
    ? new Date(nextSession.startTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    : null
  const nextTherapistName = nextSession?.therapist?.fullName ?? null

  return (
    <div className="flex-1 p-4">
      {/* Profile Incomplete Banner */}
      {profileIncomplete && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
              <span className="text-amber-600 text-lg">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Your profile is incomplete</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Complete your profile before booking sessions with therapists.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-8 text-xs" onClick={() => router.push("/dashboard/patient/profile")}>
              Complete Profile
            </Button>
            <button onClick={() => setProfileIncomplete(false)} className="text-amber-400 hover:text-amber-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your sessions and explore available therapists.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Upcoming Sessions"
          value={upcomingSessions.length}
          subtitle={
            nextSessionDate && nextSessionTime
              ? `Next: ${nextSessionDate}, ${nextSessionTime}`
              : undefined
          }
          icon={CalendarDays}
        />
        <StatCard
          title="Completed Sessions"
          value={pastSessions.length}
          subtitle="All time"
          icon={BookOpen}
          iconClassName="bg-[hsl(200,60%,50%)]/10 text-[hsl(200,60%,50%)]"
        />
        <StatCard
          title="Wellness Score"
          value={wellnessScore !== null ? wellnessScore : "—"}
          trend={{
            value: wellnessTrend ?? "Complete an assessment",
            positive: true,
          }}
          icon={Heart}
          iconClassName="bg-[hsl(340,65%,55%)]/10 text-[hsl(340,65%,55%)]"
        />
        <StatCard
          title="Next Video Call"
          value={nextSessionDate ?? "—"}
          subtitle={nextTherapistName ?? undefined}
          icon={Video}
          iconClassName="bg-[hsl(152,60%,40%)]/10 text-[hsl(152,60%,40%)]"
        />
      </div>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="sessions" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            My Sessions
          </TabsTrigger>
          <TabsTrigger value="therapists" className="gap-1.5">
            <Heart className="h-4 w-4" />
            Find Therapists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          {/* Top Controls */}
          <div className="flex items-center justify-between mb-5">
            {/* Session Type Filter */}
            <div className="flex gap-1">
              {(["all", "upcoming", "past"] as const).map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={sessionFilter === filter ? "default" : "outline"}
                  onClick={() => setSessionFilter(filter)}
                  className="h-8 text-xs capitalize"
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                  {statusFilter.size > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
                    >
                      {statusFilter.size}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {(["pending", "accepted", "completed", "cancelled"] as const).map(
                  (status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.has(status)}
                      onCheckedChange={(checked) =>
                        toggleStatusFilter(status)
                      }
                      className="capitalize pl-8"
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                {statusFilter.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setStatusFilter(new Set())}
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      <X className="h-3 w-3 mr-2" />
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sessions Content */}
          {filteredSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No {sessionFilter !== "all" ? sessionFilter : ""} sessions found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your filters or book a new session.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  sessionId={s.id}
                  date={s.scheduledDate}
                  startTime={s.startTime}
                  endTime={s.endTime}
                  status={s.status}
                  sessionType={s.sessionType}
                  personName={s.therapist?.fullName ?? "Unknown"}
                  personRole="therapist"
                  meetingRoomId={s.meetingRoomId}
                  onCancel={() => handleCancel(s.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="therapists">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialization..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredTherapists.length} therapists
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTherapists.map((therapist) => (
              <TherapistCard
                key={therapist.id}
                id={therapist.id}
                fullName={therapist.fullName}
                profilePictureUrl={therapist.profilePictureUrl}
                specialization={therapist.specialization}
                consultationFee={therapist.consultationFee}
                experienceYears={therapist.experienceYears}
                patientId={patientId ? Number(patientId) : undefined}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8 border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => router.push(`/dashboard/journal`)}>
              <BookOpen className="h-3.5 w-3.5" />
              My Journal
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => router.push(`/dashboard/patient/assessments`)}>
              <Heart className="h-3.5 w-3.5" />
              Self Assessment
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => router.push(`/dashboard/patient/feedback`)}>
              <MessageSquare className="h-3.5 w-3.5" />
              Give Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Session Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel Session?"
        description="Are you sure you want to cancel this session? This action cannot be undone."
        confirmLabel="Cancel Session"
        cancelLabel="Keep Session"
        onConfirm={doCancelSession}
        isDangerous={true}
        icon="warning"
      />
    </div>
  )
}
