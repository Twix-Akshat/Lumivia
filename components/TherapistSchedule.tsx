"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Clock,
  CalendarDays,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react"
import { useAlert } from "@/components/ui/custom-alert"

const days = [
  { name: "Monday", short: "Mon" },
  { name: "Tuesday", short: "Tue" },
  { name: "Wednesday", short: "Wed" },
  { name: "Thursday", short: "Thu" },
  { name: "Friday", short: "Fri" },
  { name: "Saturday", short: "Sat" },
  { name: "Sunday", short: "Sun" },
]

interface Availability {
  id: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface DayState {
  enabled: boolean
  startTime: string
  endTime: string
  saved: boolean
  saving: boolean
  deleting: boolean
}

type DayStates = Record<string, DayState>

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return isoString
  }
}

function formatTimeDisplay(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return isoString
  }
}

export default function TherapistSchedule() {
  const { showAlert } = useAlert()
  const [availability, setAvailability] = useState<Availability[]>([])
  const [dayStates, setDayStates] = useState<DayStates>(() => {
    const initial: DayStates = {}
    days.forEach((d) => {
      initial[d.name] = {
        enabled: false,
        startTime: "09:00",
        endTime: "17:00",
        saved: false,
        saving: false,
        deleting: false,
      }
    })
    return initial
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/therapist/availability")
      .then((res) => res.json())
      .then((data: Availability[]) => {
        const items = data || []
        setAvailability(items)
        setDayStates((prev) => {
          const updated = { ...prev }
          items.forEach((a) => {
            if (updated[a.dayOfWeek]) {
              updated[a.dayOfWeek] = {
                enabled: true,
                startTime: formatTime(a.startTime),
                endTime: formatTime(a.endTime),
                saved: true,
                saving: false,
                deleting: false,
              }
            }
          })
          return updated
        })
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  const handleToggleDay = useCallback((day: string) => {
    setDayStates((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        saved: false,
      },
    }))
  }, [])

  const handleTimeChange = useCallback(
    (day: string, field: "startTime" | "endTime", value: string) => {
      setDayStates((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value,
          saved: false,
        },
      }))
    },
    []
  )

  const handleSave = useCallback(
    async (day: string) => {
      const state = dayStates[day]
      if (!state.enabled || !state.startTime || !state.endTime) return

      setDayStates((prev) => ({
        ...prev,
        [day]: { ...prev[day], saving: true },
      }))

      try {
        const response = await fetch("/api/therapist/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek: day,
            startTime: state.startTime,
            endTime: state.endTime,
          }),
        })

        if (response.ok) {
          const savedAvailability: Availability = await response.json()
          setAvailability((prev) => {
            const index = prev.findIndex((a) => a.dayOfWeek === day)
            if (index !== -1) {
              const newAvailability = [...prev]
              newAvailability[index] = savedAvailability
              return newAvailability
            }
            return [...prev, savedAvailability]
          })
          setDayStates((prev) => ({
            ...prev,
            [day]: { ...prev[day], saved: true, saving: false },
          }))
        } else {
          setDayStates((prev) => ({
            ...prev,
            [day]: { ...prev[day], saving: false },
          }))
        }
      } catch {
        setDayStates((prev) => ({
          ...prev,
          [day]: { ...prev[day], saving: false },
        }))
      }
    },
    [dayStates]
  )

  const handleDelete = useCallback(
    async (day: string) => {
      const avail = availability.find((a) => a.dayOfWeek === day)
      if (!avail) return

      setDayStates((prev) => ({
        ...prev,
        [day]: { ...prev[day], deleting: true },
      }))

      try {
        const response = await fetch("/api/therapist/availability", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: avail.id }),
        })

        if (response.ok) {
          setAvailability((prev) => prev.filter((a) => a.id !== avail.id))
          setDayStates((prev) => ({
            ...prev,
            [day]: {
              enabled: false,
              startTime: "09:00",
              endTime: "17:00",
              saved: false,
              saving: false,
              deleting: false,
            },
          }))
        } else {
          const data = await response.json()
          showAlert(data.error || "Failed to delete availability", "danger")
          setDayStates((prev) => ({
            ...prev,
            [day]: { ...prev[day], deleting: false },
          }))
        }
      } catch {
        setDayStates((prev) => ({
          ...prev,
          [day]: { ...prev[day], deleting: false },
        }))
      }
    },
    [availability]
  )

  const activeDays = availability.length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Weekly Schedule
              </h1>
              <p className="text-sm text-muted-foreground">
                Configure your availability for clients
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Availability Editor */}
          <div className="lg:col-span-3">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      Set Availability
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Toggle days on and set your working hours
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-normal">
                    {activeDays} {activeDays === 1 ? "day" : "days"} active
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {days.map((day, index) => {
                      const state = dayStates[day.name]
                      return (
                        <DayRow
                          key={day.name}
                          day={day}
                          state={state}
                          isLast={index === days.length - 1}
                          onToggle={handleToggleDay}
                          onTimeChange={handleTimeChange}
                          onSave={handleSave}
                          onDelete={handleDelete}
                        />
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Calendar Overview */}
          <div className="lg:col-span-2">
            <CalendarView availability={availability} loading={loading} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DayRow({
  day,
  state,
  isLast,
  onToggle,
  onTimeChange,
  onSave,
  onDelete,
}: {
  day: { name: string; short: string }
  state: DayState
  isLast: boolean
  onToggle: (day: string) => void
  onTimeChange: (day: string, field: "startTime" | "endTime", value: string) => void
  onSave: (day: string) => void
  onDelete: (day: string) => void
}) {
  return (
    <div
      className={`flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4 ${!isLast ? "border-b border-border/40" : ""
        }`}
    >
      {/* Day toggle */}
      <div className="flex items-center gap-3 sm:w-36">
        <Switch
          id={`toggle-${day.name}`}
          checked={state.enabled}
          onCheckedChange={() => onToggle(day.name)}
        />
        <Label
          htmlFor={`toggle-${day.name}`}
          className={`text-sm font-medium cursor-pointer select-none ${state.enabled ? "text-foreground" : "text-muted-foreground"
            }`}
        >
          <span className="hidden sm:inline">{day.name}</span>
          <span className="sm:hidden">{day.short}</span>
        </Label>
      </div>

      {/* Time inputs + actions */}
      <div
        className={`flex flex-wrap items-center gap-2 transition-opacity duration-200 ${state.enabled ? "opacity-100" : "opacity-30 pointer-events-none"
          }`}
      >
        <div className="relative min-w-[120px] flex-1">
          <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="time"
            value={state.startTime}
            onChange={(e) =>
              onTimeChange(day.name, "startTime", e.target.value)
            }
            className="h-9 pl-8 text-sm"
            aria-label={`Start time for ${day.name}`}
          />
        </div>

        <span className="text-xs text-muted-foreground font-medium px-1">to</span>

        <div className="relative min-w-[120px] flex-1">
          <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="time"
            value={state.endTime}
            onChange={(e) =>
              onTimeChange(day.name, "endTime", e.target.value)
            }
            className="h-9 pl-8 text-sm"
            aria-label={`End time for ${day.name}`}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant={state.saved ? "secondary" : "default"}
            className="h-9 w-9 shrink-0 p-0"
            onClick={() => onSave(day.name)}
            disabled={state.saving || state.saved}
            aria-label={`Save ${day.name}`}
          >
            {state.saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : state.saved ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* Delete button - only visible when day has saved availability */}
          {state.saved && (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 shrink-0 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(day.name)}
              disabled={state.deleting}
              aria-label={`Delete ${day.name} availability`}
            >
              {state.deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function CalendarView({
  availability,
  loading,
  onDelete,
}: {
  availability: Availability[]
  loading: boolean
  onDelete: (day: string) => void
}) {
  const dayOrder = days.map((d) => d.name)
  const sorted = [...availability].sort(
    (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
  )

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <CardTitle className="text-lg font-medium">
            Schedule Overview
          </CardTitle>
        </div>
        <CardDescription className="mt-1">
          Your confirmed weekly hours
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No hours set yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
              Toggle days on and save your working hours to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((a) => {
              const dayInfo = days.find((d) => d.name === a.dayOfWeek)
              return (
                <div
                  key={a.id}
                  className="group flex items-center justify-between rounded-lg border border-border/40 bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      {dayInfo?.short.slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {a.dayOfWeek}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatTimeDisplay(a.startTime)}
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      {"–"}
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatTimeDisplay(a.endTime)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 ml-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDelete(a.dayOfWeek)}
                      aria-label={`Delete ${a.dayOfWeek} availability`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Summary */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                Total active days
              </span>
              <Badge variant="default" className="text-xs">
                {sorted.length} / 7
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
