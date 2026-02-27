"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, Clock, IndianRupee } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAlert } from "@/components/ui/custom-alert"

interface TherapistCardProps {
  id: number
  fullName: string
  profilePictureUrl?: string | null
  specialization: string | null
  consultationFee: number | string
  experienceYears?: number | null
  rating?: number
  patientId?: number
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, "0")} ${period}`
}

export function TherapistCard({
  id,
  fullName,
  profilePictureUrl,
  specialization,
  consultationFee,
  experienceYears,
  rating = 4.8,
  patientId,
}: TherapistCardProps) {
  const router = useRouter()
  const { showAlert } = useAlert()

  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  // Fetch available slots
  const fetchSlots = async (date: string) => {
    try {
      setLoading(true)
      setSlots([])

      const res = await fetch("/api/therapist/available-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          therapistId: id,
          selectedDate: date,
        }),
      })
      console.log("responese here");
      console.log(res)
      if (!res.ok) throw new Error("Failed to fetch slots")

      const data = await res.json()
      setSlots(data || [])
    } catch (error) {
      console.error("Error fetching slots:", error)
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    if (date) {
      fetchSlots(date)
    }
  }

  // Handle booking


  // Handle booking - Direct booking without confirmation
  const handleBook = async (slot: { start: string; end: string }) => {
    if (!patientId) {
      showAlert("Please sign in to book a session.", "warning")
      return
    }

    try {
      setBookingLoading(true)

      const res = await fetch("/api/sessions/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          therapistId: id,
          patientId,
          selectedDate,
          startTime: slot.start,
          endTime: slot.end,
          issueDescription: "General consultation",
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        showAlert(data?.error || "Booking failed", "danger")
        return
      }

      showAlert("Session booked successfully!", "success")
      setOpen(false)
      
      // Refresh slots to show updated availability
      if (selectedDate) {
        fetchSlots(selectedDate)
      }
    } catch (error) {
      console.error("Booking error:", error)
      showAlert("Cannot reach the server. Please try again.", "danger")
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <>
      <Card className="border border-border shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar
              className="h-14 w-14 shrink-0 cursor-pointer"
              onClick={() =>
                router.push(`/dashboard/therapist/${id}`)
              }
            >
              <AvatarImage
                src={profilePictureUrl || undefined}
                alt={fullName}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p
                className="text-base font-semibold cursor-pointer hover:text-primary transition-colors truncate"
                onClick={() =>
                  router.push(`/dashboard/therapist/${id}`)
                }
              >
                {fullName}
              </p>

              {specialization && (
                <p className="text-sm text-muted-foreground truncate">
                  {specialization}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  {rating}
                </span>

                {experienceYears && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {experienceYears}y exp
                  </span>
                )}

                <span className="flex items-center gap-1 font-medium text-foreground">
                  <IndianRupee className="h-3 w-3" />
                  {consultationFee}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/therapist/${id}`)
              }
              className="flex-1 h-9 text-xs"
            >
              View Profile
            </Button>

            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="flex-1 h-9 text-xs"
            >
              Book Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Book Session with {fullName}
            </DialogTitle>
          </DialogHeader>

          {/* Date Picker */}
          <div className="mt-3">
            <label className="text-sm font-medium">
              Select Date
            </label>
            <input
              type="date"
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                handleDateChange(e.target.value)
              }
            />
          </div>

          {/* Slots Section */}
          <div className="mt-4 max-h-72 overflow-y-auto space-y-4">
            {loading && (
              <p className="text-sm text-muted-foreground">
                Loading available slots...
              </p>
            )}

            {!loading && selectedDate && slots.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No available slots for this date.
              </p>
            )}

            {!loading && slots.length > 0 && (() => {
              const groups = [
                { label: "🌅 Morning", emoji: "", slots: slots.filter(s => parseInt(s.start) < 12) },
                { label: "☀️ Afternoon", emoji: "", slots: slots.filter(s => { const h = parseInt(s.start); return h >= 12 && h < 17 }) },
                { label: "🌆 Evening", emoji: "", slots: slots.filter(s => parseInt(s.start) >= 17) },
              ]
              return groups
                .filter(g => g.slots.length > 0)
                .map(group => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.slots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border rounded-lg px-3 py-2"
                        >
                          <div className="text-sm font-medium">
                            {formatTime(slot.start)} – {formatTime(slot.end)}
                          </div>
                          <Button
                            size="sm"
                            disabled={bookingLoading}
                            onClick={() => handleBook(slot)}
                          >
                            {bookingLoading ? "Booking..." : "Book"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            })()}
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}