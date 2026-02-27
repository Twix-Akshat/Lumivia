"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"

type Profile = {
  fullName: string
  email: string
  profilePictureUrl: string | null
  phoneNumber: string | null
  dateOfBirth: string | null
  gender: string | null
  aboutBio: string | null
  specialization: string | null
  consultationFee: number | null
  experienceYears: number | null
  licenseNumber: string | null
}

export default function TherapistProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)

  const requiredFields = ["fullName", "profilePictureUrl", "specialization", "licenseNumber"] as const
  const optionalFields = ["phoneNumber", "dateOfBirth", "gender", "aboutBio", "consultationFee", "experienceYears"] as const

  const getCompletionPercentage = () => {
    if (!profile) return 0
    const completedRequired = requiredFields.filter(
      (field) => profile[field] && (typeof profile[field] === "string" ? profile[field]!.trim() : profile[field])
    ).length
    return Math.round((completedRequired / requiredFields.length) * 100)
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()

      setProfile((prev) =>
        prev ? { ...prev, profilePictureUrl: data.url } : prev
      )
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }


  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login")
      return
    }
    if (status === "authenticated" && session?.user?.role !== "therapist") {
      router.replace("/dashboard/therapist")
      return
    }
    if (status !== "authenticated") return

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setProfile(null)
          return
        }
        setProfile({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          profilePictureUrl: data.profilePictureUrl ?? null,
          phoneNumber: data.phoneNumber ?? null,
          dateOfBirth: data.dateOfBirth ?? null,
          gender: data.gender ?? null,
          aboutBio: data.aboutBio ?? null,
          specialization: data.specialization ?? null,
          consultationFee: data.consultationFee ?? null,
          experienceYears: data.experienceYears ?? null,
          licenseNumber: data.licenseNumber ?? null,
        })
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [status, session?.user?.role, router])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage(null)
    fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: profile.fullName,
        profilePictureUrl: profile.profilePictureUrl || null,
        phoneNumber: profile.phoneNumber || null,
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender || null,
        aboutBio: profile.aboutBio || null,
        specialization: profile.specialization || null,
        consultationFee: profile.consultationFee,
        experienceYears: profile.experienceYears,
        licenseNumber: profile.licenseNumber || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: "err", text: data.error })
        } else {
          setMessage({ type: "ok", text: "Profile updated." })
        }
      })
      .catch(() => setMessage({ type: "err", text: "Failed to update." }))
      .finally(() => setSaving(false))
  }

  if (status === "loading" || loading) {
    return (
      <div className="p-6">
        <p>Loading profile…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p>Could not load profile.</p>
        <Link href="/dashboard/therapist" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/therapist" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
          <p className="text-slate-600">Build your professional profile to get started</p>
        </div>

        {/* Profile Completion Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Profile Completion</h3>
              <p className="text-sm text-slate-600 mt-1">{completionPercentage}% complete</p>
            </div>
            <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700"><span className="font-medium">Required fields:</span> Full name, Profile picture, Specialization, License number</span>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700"><span className="font-medium">Optional fields:</span> Phone, Date of birth, Gender, About bio, Consultation fee, Experience years</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </h2>

            <div className="space-y-5">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">Profile Picture <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile?.profilePictureUrl ? (
                      <img
                        src={profile.profilePictureUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm text-slate-500 font-medium">
                        No Photo
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => (p ? { ...p, fullName: e.target.value } : p))}
                  placeholder="Dr. John Doe"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-600 bg-slate-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Gender</label>
                <select
                  value={profile.gender ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, gender: e.target.value || null } : p))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phoneNumber ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, phoneNumber: e.target.value || null } : p))
                  }
                  placeholder="+91 9876543210"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, dateOfBirth: e.target.value || null } : p))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* About Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">About You</label>
                <textarea
                  value={profile.aboutBio ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, aboutBio: e.target.value || null } : p))
                  }
                  placeholder="Tell clients about yourself, your approach, and what you specialize in..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
              Professional Information
            </h2>

            <div className="space-y-5">
              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Specialization <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.specialization ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, specialization: e.target.value || null } : p))
                  }
                  placeholder="e.g. Anxiety, Depression, ADHD"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">License Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.licenseNumber ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, licenseNumber: e.target.value || null } : p))
                  }
                  placeholder="LIC-2024-XXXXX"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  value={profile.experienceYears ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, experienceYears: e.target.value === "" ? null : Number(e.target.value) } : p))
                  }
                  placeholder="10"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Consultation Fee <span className="text-slate-500 font-normal">(₹)</span></label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={profile.consultationFee ?? ""}
                  onChange={(e) =>
                    setProfile((p) => (p ? { ...p, consultationFee: e.target.value === "" ? null : Number(e.target.value) } : p))
                  }
                  placeholder="1000"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`rounded-lg p-4 flex items-start gap-3 ${message.type === "ok"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
                }`}
            >
              {message.type === "ok" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm font-medium ${message.type === "ok" ? "text-green-800" : "text-red-800"
                  }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-6 py-3 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
            <Link
              href="/dashboard/therapist"
              className="rounded-lg border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-medium px-6 py-3 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
