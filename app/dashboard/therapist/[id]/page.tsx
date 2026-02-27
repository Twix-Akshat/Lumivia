'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Heart,
  Clock,
  CheckCircle,
  Star,
  Shield,
  Users,
  Phone,
  Calendar,
  Award,
  ArrowLeft,
  MapPin,
} from "lucide-react"
import { useState, useEffect, use, useMemo } from "react"

interface AvailabilitySlot {
  id: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface Review {
  feedback_id: number
  rating: number
  feedbackText: string | null
  submittedAt: string
  patient: {
    fullName: string
    profilePictureUrl: string | null
  }
}

interface Therapist {
  id: number
  fullName: string
  specialization: string | null
  experienceYears: number | null
  consultationFee: number | string | null
  profilePictureUrl?: string | null
  verificationStatus: string | null
  aboutBio?: string | null
  gender?: string | null
  phoneNumber?: string | null
  licenseNumber?: string | null
  dateOfBirth?: string | null
  therapistAvailability: AvailabilitySlot[]
  feedbackReceived: Review[]
  averageRating: number
  totalReviews: number
  completedSessionCount: number
}

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const dayAbbrev: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
  Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
}

function getNextAvailableSlot(availability: AvailabilitySlot[]): string | null {
  if (!availability.length) return null

  const now = new Date()
  const currentDayIndex = (now.getDay() + 6) % 7 // Monday=0
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Check today and next 7 days
  for (let offset = 0; offset < 7; offset++) {
    const checkDayIndex = (currentDayIndex + offset) % 7
    const dayName = dayOrder[checkDayIndex]

    const slotsForDay = availability
      .filter(s => s.dayOfWeek === dayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    for (const slot of slotsForDay) {
      const timeStr = slot.startTime.slice(11, 16) // "HH:MM"
      const [h, m] = timeStr.split(":").map(Number)
      const slotMinutes = h * 60 + m

      if (offset === 0 && slotMinutes <= currentMinutes) continue // past today

      const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : dayName
      const hour = h % 12 || 12
      const ampm = h >= 12 ? "PM" : "AM"
      const minuteStr = m === 0 ? "" : `:${String(m).padStart(2, "0")}`
      return `${label} at ${hour}${minuteStr} ${ampm}`
    }
  }
  return null
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function TherapistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    fetch(`/api/therapist/${id}`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(data => setTherapist(data))
      .catch(() => setTherapist(null))
      .finally(() => setLoading(false))
  }, [id])

  const groupedAvailability = useMemo(() => {
    if (!therapist) return {}
    return therapist.therapistAvailability.reduce(
      (acc: Record<string, AvailabilitySlot[]>, item) => {
        if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = []
        acc[item.dayOfWeek].push(item)
        return acc
      },
      {}
    )
  }, [therapist])

  const sortedDays = useMemo(
    () => dayOrder.filter(day => day in groupedAvailability),
    [groupedAvailability]
  )

  const nextAvailable = useMemo(
    () => therapist ? getNextAvailableSlot(therapist.therapistAvailability) : null,
    [therapist]
  )

  // Rating distribution for the bar chart
  const ratingDistribution = useMemo(() => {
    if (!therapist) return [0, 0, 0, 0, 0]
    const dist = [0, 0, 0, 0, 0]
    therapist.feedbackReceived.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++
    })
    return dist
  }, [therapist])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Skeleton loader */}
          <div className="grid lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
                <div className="h-36 bg-muted"></div>
                <div className="p-8 space-y-4">
                  <div className="flex items-end gap-6 -mt-20">
                    <div className="w-32 h-32 rounded-xl bg-muted border-4 border-card"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-64"></div>
                  <div className="h-5 bg-muted rounded w-48"></div>
                  <div className="h-20 bg-muted rounded w-full"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-muted rounded-lg"></div>
                    <div className="h-20 bg-muted rounded-lg"></div>
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-14 bg-muted rounded-xl"></div>
              <div className="h-14 bg-muted rounded-xl"></div>
              <div className="h-28 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Therapist Not Found</h1>
          <p className="text-foreground/60">The therapist profile you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    )
  }

  const reviews = therapist.feedbackReceived || []
  const maxDist = Math.max(...ratingDistribution, 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-36 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/15 relative">
                {therapist.verificationStatus === "Verified" && (
                  <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Therapist
                  </div>
                )}
              </div>

              <div className="px-6 sm:px-8 pb-8">
                <div className="flex items-end gap-5 -mt-16 mb-6">
                  <div className="relative shrink-0">
                    {therapist.profilePictureUrl ? (
                      <Image
                        src={therapist.profilePictureUrl}
                        alt={therapist.fullName}
                        width={130}
                        height={130}
                        className="rounded-xl object-cover border-4 border-card shadow-lg w-28 h-28 sm:w-[130px] sm:h-[130px]"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-[130px] sm:h-[130px] rounded-xl border-4 border-card shadow-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">
                          {getInitials(therapist.fullName)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                      {therapist.fullName}
                    </h1>
                    {therapist.specialization && (
                      <p className="text-base font-medium text-primary mt-0.5 truncate">
                        {therapist.specialization}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setLiked(!liked)}
                    className="shrink-0 p-3 hover:bg-muted rounded-xl transition-all group"
                  >
                    <Heart
                      className={`w-6 h-6 transition-all group-hover:scale-110 ${liked ? "fill-red-500 text-red-500" : "text-foreground/40"}`}
                    />
                  </button>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
                  {therapist.experienceYears != null && (
                    <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                      <Award className="w-4 h-4 text-primary/70" />
                      {therapist.experienceYears}+ years experience
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {therapist.totalReviews > 0
                      ? `${therapist.averageRating} rating (${therapist.totalReviews} ${therapist.totalReviews === 1 ? "review" : "reviews"})`
                      : "No reviews yet"}
                  </div>
                  {therapist.completedSessionCount > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {therapist.completedSessionCount} sessions completed
                    </div>
                  )}
                </div>

                {/* Bio */}
                <p className="text-foreground/70 leading-relaxed text-pretty mb-6">
                  {therapist.aboutBio || "No bio provided yet."}
                </p>

                {/* Fee */}
                {therapist.consultationFee != null && (
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-primary">
                      ₹{therapist.consultationFee}
                    </span>
                    <span className="text-sm text-foreground/60">per session</span>
                  </div>
                )}

                {/* Dynamic info cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {therapist.licenseNumber && (
                    <div className="bg-muted/50 border border-border/40 rounded-lg p-3 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield className="w-3.5 h-3.5 text-primary/60" />
                        <p className="text-xs font-medium text-foreground/60">License</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{therapist.licenseNumber}</p>
                    </div>
                  )}
                  {therapist.gender && (
                    <div className="bg-muted/50 border border-border/40 rounded-lg p-3 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-primary/60" />
                        <p className="text-xs font-medium text-foreground/60">Gender</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{therapist.gender}</p>
                    </div>
                  )}
                  {therapist.phoneNumber && (
                    <div className="bg-muted/50 border border-border/40 rounded-lg p-3 hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-primary/60" />
                        <p className="text-xs font-medium text-foreground/60">Contact</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">{therapist.phoneNumber}</p>
                    </div>
                  )}
                  <div className="bg-muted/50 border border-border/40 rounded-lg p-3 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-primary/60" />
                      <p className="text-xs font-medium text-foreground/60">Available</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {sortedDays.length > 0
                        ? sortedDays.map(d => dayAbbrev[d] || d).join(", ")
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                Book a Session
              </button>

              <button className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-4 px-6 rounded-xl transition-all">
                Send Message
              </button>

              <div className="bg-card border border-border/40 rounded-xl p-5 space-y-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Next Available
                </p>
                <p className="text-lg font-bold text-primary">
                  {nextAvailable || "No slots available"}
                </p>
                <p className="text-xs text-foreground/50">Based on weekly schedule</p>
              </div>

              {/* Quick stats card */}
              <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
                <p className="text-sm font-medium text-foreground">At a Glance</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Avg. Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-semibold text-foreground">
                        {therapist.totalReviews > 0 ? therapist.averageRating : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Reviews</span>
                    <span className="text-sm font-semibold text-foreground">{therapist.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Sessions</span>
                    <span className="text-sm font-semibold text-foreground">{therapist.completedSessionCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Experience</span>
                    <span className="text-sm font-semibold text-foreground">
                      {therapist.experienceYears != null ? `${therapist.experienceYears} yrs` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Weekly Availability</h2>
          </div>
          <p className="text-foreground/60 text-sm mb-6 ml-7">All times shown in IST</p>

          {sortedDays.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-foreground/15 mx-auto mb-3" />
              <p className="text-foreground/50 font-medium">No availability set yet</p>
              <p className="text-xs text-foreground/40 mt-1">This therapist hasn&apos;t configured their schedule</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedDays.map((day) => (
                <div key={day} className="bg-muted/40 border border-border/40 rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    {day}
                  </h3>
                  <div className="space-y-1.5">
                    {(groupedAvailability[day] as AvailabilitySlot[])
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => {
                        const start = slot.startTime.slice(11, 16)
                        const end = slot.endTime.slice(11, 16)
                        return (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 text-sm text-foreground/70 bg-background/60 rounded px-3 py-2"
                          >
                            <Clock className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                            <span>{start} – {end}</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About + Reviews Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* About */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">About</h2>
            </div>

            <div className="space-y-4">
              <p className="text-foreground/70 leading-relaxed text-pretty">
                {therapist.aboutBio || "This therapist hasn't added a bio yet."}
              </p>

              {therapist.specialization && (
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-primary/80">Specialization</p>
                    <p className="text-sm font-semibold text-foreground">{therapist.specialization}</p>
                  </div>
                </div>
              )}

              {therapist.experienceYears != null && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border/40">
                  <Award className="w-4 h-4 text-foreground/60 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground/60">Clinical Experience</p>
                    <p className="text-sm font-semibold text-foreground">
                      {therapist.experienceYears}+ years of practice
                    </p>
                  </div>
                </div>
              )}

              {therapist.dateOfBirth && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border/40">
                  <Calendar className="w-4 h-4 text-foreground/60 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground/60">Date of Birth</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(therapist.dateOfBirth).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Reviews</h2>
              </div>
              {therapist.totalReviews > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {therapist.totalReviews} total
                </span>
              )}
            </div>

            {/* Rating distribution bar */}
            {therapist.totalReviews > 0 && (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl font-bold text-foreground">{therapist.averageRating}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= Math.round(therapist.averageRating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-border fill-border"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {therapist.totalReviews} {therapist.totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted-foreground text-right">{star}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${(ratingDistribution[star - 1] / maxDist) * 100}%` }}
                        />
                      </div>
                      <span className="w-4 text-right text-muted-foreground">{ratingDistribution[star - 1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review list */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-10 h-10 text-foreground/15 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">No reviews yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Be the first to leave a review</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.feedback_id}
                    className="border-b border-border/30 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {getInitials(review.patient?.fullName || "A")}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {review.patient?.fullName || "Anonymous"}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${j < review.rating
                              ? "fill-amber-500 text-amber-500"
                              : "text-border fill-border"
                              }`}
                          />
                        ))}
                      </div>
                    </div>

                    {review.feedbackText && (
                      <p className="text-sm text-foreground/70 leading-relaxed mb-1.5">
                        {review.feedbackText}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {new Date(review.submittedAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
