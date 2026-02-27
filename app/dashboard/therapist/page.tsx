"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CalendarDays,
  Users,
  Clock,
  IndianRupee,
  Video,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  Save,
  X,
} from "lucide-react"
import { StatCard } from "./stat-card"
import { SessionCard } from "./session-card"
import type { SessionStatus, SessionType } from "./session-card"
import TherapistSchedule from "@/components/TherapistSchedule"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAlert } from "@/components/ui/custom-alert"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

type SessionWithPatient = {
  id: number
  scheduledDate: string
  startTime: string
  endTime: string
  status: SessionStatus
  sessionType: SessionType
  issueDescription: string | null
  sessionSummary: string | null
  meetingRoomId?: string | null
  patient?: { fullName: string; profilePictureUrl?: string | null }
}

type Patient = {
  id: number
  fullName: string
  sessions: number
  lastSession: string
  status: "Active" | "New" | "Inactive"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function TherapistDashboard() {
  const { data: session } = useSession()
  const therapistId = session?.user?.id
  const router = useRouter()
  const { showAlert } = useAlert()

  const [sessions, setSessions] = useState<SessionWithPatient[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("sessions")

  // Therapist Notes
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [notesOpen, setNotesOpen] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [patientNotes, setPatientNotes] = useState<any[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<number | null>(null)

  const fetchPatientNotes = async (patientId: number) => {
    try {
      setLoadingNotes(true)
      const res = await fetch(`/api/therapist/notes/patient/${patientId}`)
      if (!res.ok) throw new Error("Failed to fetch notes")
      const data = await res.json()
      setPatientNotes(data || [])
    } catch (error) {
      console.error(error)
      setPatientNotes([])
    } finally {
      setLoadingNotes(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteContent.trim() || !selectedPatient) return
    setSavingNote(true)
    try {
      const res = await fetch("/api/therapist/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: therapistId,
          patientId: selectedPatient.id,
          noteContent: noteContent.trim(),
        }),
      })
      if (!res.ok) throw new Error("Failed to create note")
      setNoteContent("")
      setShowAddNote(false)
      fetchPatientNotes(selectedPatient.id)
    } catch (error) {
      console.error(error)
      showAlert("Failed to save note", "danger")
    } finally {
      setSavingNote(false)
    }
  }

  const handleUpdateNote = async (noteId: number) => {
    if (!editContent.trim()) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/therapist/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteContent: editContent.trim() }),
      })
      if (!res.ok) throw new Error("Failed to update note")
      setEditingNoteId(null)
      setEditContent("")
      fetchPatientNotes(selectedPatient.id)
    } catch (error) {
      console.error(error)
      showAlert("Failed to update note", "danger")
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    setPendingDeleteNoteId(noteId)
    setDeleteDialogOpen(true)
  }

  const doDeleteNote = async () => {
    if (!pendingDeleteNoteId) return
    setDeletingNoteId(pendingDeleteNoteId)
    try {
      const res = await fetch(`/api/therapist/notes/${pendingDeleteNoteId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete note")
      fetchPatientNotes(selectedPatient.id)
    } catch (error) {
      console.error(error)
      showAlert("Failed to delete note", "danger")
    } finally {
      setDeletingNoteId(null)
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!therapistId) return

      try {
        const res = await fetch(`/api/therapist/dashboard?therapistId=${therapistId}`)
        if (res.ok) {
          const data = await res.json()
          setSessions(data.sessions)

          // Process patients from sessions
          const patientMap = new Map<number, Patient>()
          data.sessions.forEach((s: any) => {
            if (s.patient) {
              const existing = patientMap.get(s.patientId) || {
                id: s.patientId,
                fullName: s.patient.fullName,
                sessions: 0,
                lastSession: s.scheduledDate,
                status: "New"
              }
              existing.sessions++
              // Simple logic for status/lastSession - could be refined
              if (new Date(s.scheduledDate) > new Date(existing.lastSession)) {
                existing.lastSession = s.scheduledDate
              }
              if (existing.sessions > 1) existing.status = "Active"
              patientMap.set(s.patientId, existing)
            }
          })
          setPatients(Array.from(patientMap.values()))
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session, therapistId])

  // Check profile completeness on login
  useEffect(() => {
    if (!session?.user) return
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return
        const requiredFields = ["fullName", "profilePictureUrl", "specialization", "licenseNumber"] as const
        const isIncomplete = requiredFields.some(
          (field) => !data[field] || (typeof data[field] === "string" && !data[field].trim())
        )
        if (isIncomplete) {
          setProfileIncomplete(true)
          showAlert("Your profile is incomplete. Please complete it to start accepting sessions.", "warning")
        }
      })
      .catch(() => { })
  }, [session?.user])

  // Auto-complete sessions whose end time has passed
  useEffect(() => {
    fetch("/api/sessions/auto-complete", { method: "POST" })
  }, [])

  const pendingSessions = sessions.filter((s) => s.status === "pending")
  const confirmedSessions = sessions.filter((s) => s.status === "accepted")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  async function handleAccept(sessionId: number) {
    try {
      const res = await fetch("/api/sessions/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (!res.ok) {
        throw new Error("Failed to accept session")
      }

      // Optimistic update
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, status: "accepted" as SessionStatus } : s
      ))
      showAlert("Session accepted", "success")
    } catch (error) {
      showAlert("Failed to accept session", "danger")
      console.error(error)
    }
  }

  async function handleMarkCompleted(sessionId: number) {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "PATCH",
      })

      if (!res.ok) {
        throw new Error("Failed to mark session as completed")
      }

      // Optimistic update
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, status: "completed" as SessionStatus } : s
      ))
      showAlert("Session marked as completed", "success")
    } catch (error) {
      showAlert("Failed to mark session as completed", "danger")
      console.error(error)
    }
  }

  async function handleDecline(sessionId: number) {
    try {
      const res = await fetch("/api/sessions/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (!res.ok) {
        throw new Error("Failed to decline session")
      }

      // Optimistic update
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, status: "declined" as SessionStatus } : s
      ))
      showAlert("Session declined", "info")
    } catch (error) {
      showAlert("Failed to decline session", "danger")
      console.error(error)
    }
  }

  if (loading) return <p className="p-8 text-center text-muted-foreground">Loading dashboard...</p>

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
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Complete your profile to start accepting sessions from patients.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="h-8 text-xs" onClick={() => router.push("/dashboard/therapist/profile")}>
              Complete Profile
            </Button>
            <button onClick={() => setProfileIncomplete(false)} className="text-amber-400 hover:text-amber-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Welcome Back, {session?.user?.name || "Therapist"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your sessions and patients
          </p>
        </div>
        <Badge variant="outline" className="bg-[hsl(152,60%,40%)]/10 text-[hsl(152,60%,30%)] border-[hsl(152,60%,40%)]/20 text-xs">
          Verified
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Pending Requests"
          value={pendingSessions.length}
          subtitle="Awaiting your response"
          icon={Clock}
          iconClassName="bg-[hsl(38,92%,50%)]/10 text-[hsl(38,70%,35%)]"
        />
        <StatCard
          title="Today's Sessions"
          value={confirmedSessions.filter(s => new Date(s.scheduledDate).toDateString() === new Date().toDateString()).length}
          subtitle="Scheduled for today"
          icon={CalendarDays}
        />
        <StatCard
          title="Active Patients"
          value={patients.filter((p) => p.status === "Active").length}
          trend={{ value: `${patients.filter(p => p.status === "New").length} new`, positive: true }}
          icon={Users}
          iconClassName="bg-[hsl(200,60%,50%)]/10 text-[hsl(200,60%,50%)]"
        />
        <StatCard
          title="Total Sessions"
          value={completedSessions.length}
          subtitle="Completed sessions"
          icon={CheckCircle2}
          iconClassName="bg-[hsl(152,60%,40%)]/10 text-[hsl(152,60%,40%)]"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="sessions" className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="patients" className="gap-1.5">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          {/* Pending Requests */}
          {pendingSessions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Pending Requests
                </h3>
                <Badge className="bg-[hsl(38,92%,50%)]/10 text-[hsl(38,70%,35%)] border-[hsl(38,92%,50%)]/20 text-[10px]" variant="outline">
                  {pendingSessions.length}
                </Badge>
              </div>
              <div className="grid gap-3">
                {pendingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    date={session.scheduledDate}
                    startTime={session.startTime}
                    endTime={session.endTime}
                    status={session.status}
                    sessionType={session.sessionType}
                    personName={session.patient?.fullName || "Patient"}
                    personRole="patient"
                    issueDescription={session.issueDescription}
                    meetingRoomId={session.meetingRoomId}
                    onAccept={() => handleAccept(session.id)}
                    onDecline={() => handleDecline(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Sessions */}
          {confirmedSessions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Upcoming Confirmed
              </h3>
              <div className="grid gap-3">
                {confirmedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    date={session.scheduledDate}
                    startTime={session.startTime}
                    endTime={session.endTime}
                    status={session.status}
                    sessionType={session.sessionType}
                    personName={session.patient?.fullName || "Patient"}
                    personRole="patient"
                    issueDescription={session.issueDescription}
                    meetingRoomId={session.meetingRoomId}
                    onJoin={() => session.meetingRoomId && router.push(`/session/${session.id}/video`)}
                    onMarkCompleted={() => handleMarkCompleted(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Recently Completed
              </h3>
              <div className="grid gap-3">
                {completedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    date={session.scheduledDate}
                    startTime={session.startTime}
                    endTime={session.endTime}
                    status={session.status}
                    sessionType={session.sessionType}
                    personName={session.patient?.fullName || "Patient"}
                    personRole="patient"
                    issueDescription={session.issueDescription}
                    onJoin={() => session.meetingRoomId && router.push(`/session/${session.id}/video`)}
                    onDecline={() => handleDecline(session.id)}
                    onAccept={() => handleAccept(session.id)}
                  />
                ))}
              </div>
            </div>
          )}
          {sessions.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No sessions found.
            </div>
          )}
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-heading">My Patients</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {patients.length} patients in total
                  </CardDescription>
                </div>
                {/* <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Export
                </Button> */}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Sessions</TableHead>
                    <TableHead className="text-xs">Last Session</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(patient.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">
                            {patient.fullName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {patient.sessions}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(patient.lastSession).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            patient.status === "Active"
                              ? "bg-[hsl(152,60%,40%)]/10 text-[hsl(152,60%,30%)] border-[hsl(152,60%,40%)]/20 text-[11px]"
                              : patient.status === "New"
                                ? "bg-primary/10 text-primary border-primary/20 text-[11px]"
                                : "bg-muted text-muted-foreground text-[11px]"
                          }
                        >
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowAddNote(false)
                            setEditingNoteId(null)
                            fetchPatientNotes(patient.id)
                            setNotesOpen(true)
                          }}
                        >
                          <FileText className="h-3 w-3" />
                          Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No patients found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <TherapistSchedule />
        </TabsContent>

      </Tabs>
      {/* Patient Notes Dialog */}
      <Dialog open={notesOpen} onOpenChange={(open) => {
        setNotesOpen(open)
        if (!open) {
          setShowAddNote(false)
          setEditingNoteId(null)
          setNoteContent("")
          setEditContent("")
        }
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Clinical Notes</DialogTitle>
                <DialogDescription>
                  {selectedPatient?.fullName ? `Notes for ${selectedPatient.fullName}` : "Patient notes"}
                </DialogDescription>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  setShowAddNote(!showAddNote)
                  setEditingNoteId(null)
                  setNoteContent("")
                }}
              >
                {showAddNote ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {showAddNote ? "Cancel" : "Add Note"}
              </Button>
            </div>
          </DialogHeader>

          {/* Add Note Section */}
          {showAddNote && (
            <div className="border rounded-lg p-3 bg-primary/5 border-primary/20 space-y-3">
              <Textarea
                placeholder="Write your clinical note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[100px] bg-background resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => { setShowAddNote(false); setNoteContent("") }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleAddNote}
                  disabled={savingNote || !noteContent.trim()}
                >
                  {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Note
                </Button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loadingNotes ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : patientNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Click "Add Note" to create the first note</p>
              </div>
            ) : (
              <div className="space-y-2">
                {patientNotes.map((note) => (
                  <div
                    key={note.id}
                    className="group border rounded-lg p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    {editingNoteId === note.id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px] bg-background resize-none text-sm"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { setEditingNoteId(null); setEditContent("") }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleUpdateNote(note.id)}
                            disabled={savingNote || !editContent.trim()}
                          >
                            {savingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {note.noteContent}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(note.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                              hour: "numeric", minute: "2-digit",
                            })}
                          </p>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => {
                                setEditingNoteId(note.id)
                                setEditContent(note.noteContent)
                                setShowAddNote(false)
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={deletingNoteId === note.id}
                            >
                              {deletingNoteId === note.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with note count */}
          {patientNotes.length > 0 && (
            <DialogFooter className="border-t pt-3">
              <p className="text-xs text-muted-foreground mr-auto">
                {patientNotes.length} {patientNotes.length === 1 ? "note" : "notes"}
              </p>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Note?"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={doDeleteNote}
        isDangerous={true}
        icon="trash"
      />
    </div>
  )
}
