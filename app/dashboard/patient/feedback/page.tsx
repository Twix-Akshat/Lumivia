"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, Star } from "lucide-react"

interface Session {
  id: number
  therapist: {
    fullName: string
  }
}

interface FeedbackState {
  rating: number
  feedbackText: string
}

export default function FeedbackPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [feedback, setFeedback] = useState<Record<number, FeedbackState>>({})
  const [submitted, setSubmitted] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/feedback/eligible")
      .then(res => res.json())
      .then(setSessions)
      .finally(() => setIsLoading(false))
  }, [])

  const handleRatingChange = (sessionId: number, rating: number) => {
    setFeedback(prev => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || { feedbackText: "" }),
        rating,
      },
    }))
  }

  const handleTextChange = (sessionId: number, text: string) => {
    setFeedback(prev => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || { rating: 0 }),
        feedbackText: text,
      },
    }))
  }

  const submit = async (sessionId: number) => {
    setLoading(prev => new Set([...prev, sessionId]))

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          rating: feedback[sessionId]?.rating || 0,
          feedbackText: feedback[sessionId]?.feedbackText || "",
        }),
      })

      setSubmitted(prev => new Set([...prev, sessionId]))
      setTimeout(() => {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
      }, 1500)
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(sessionId)
        return newSet
      })
    }
  }

  const isSessionSubmitted = (sessionId: number) => submitted.has(sessionId)
  const isSessionLoading = (sessionId: number) => loading.has(sessionId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8 py-12">
        {/* Header Section */}
        <div className="space-y-3 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Share Your Feedback
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Help us improve by sharing your thoughts about your recent sessions. Your feedback is valuable and helps us provide better care.
          </p>
        </div>

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">All caught up!</h2>
              <p className="text-muted-foreground">You've provided feedback for all available sessions.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`transition-all duration-300 ${
                  isSessionSubmitted(session.id)
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100"
                }`}
              >
                <Card className="h-full border-2 hover:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Card Header with Therapist Info */}
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b pb-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-2xl text-foreground">
                            Dr. {session.therapist.fullName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Session feedback
                          </p>
                        </div>
                        {isSessionSubmitted(session.id) && (
                          <Badge className="bg-primary text-primary-foreground">
                            Submitted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Card Content */}
                  <CardContent className="space-y-6 pt-6">
                    {/* Rating Section */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-foreground">
                        How would you rate this session?
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(session.id, star)}
                            disabled={isSessionSubmitted(session.id)}
                            className={`transition-all duration-200 transform hover:scale-110 ${
                              (feedback[session.id]?.rating || 0) >= star
                                ? "text-accent scale-110"
                                : "text-muted-foreground"
                            } ${isSessionSubmitted(session.id) ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <Star
                              className="w-8 h-8 fill-current"
                              strokeWidth={1.5}
                            />
                          </button>
                        ))}
                      </div>
                      {(feedback[session.id]?.rating || 0) > 0 && (
                        <p className="text-sm text-primary font-medium">
                          {feedback[session.id]!.rating} out of 5 stars
                        </p>
                      )}
                    </div>

                    {/* Feedback Text */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-foreground">
                        Your feedback
                      </label>
                      <Textarea
                        placeholder="Tell us what went well, what could be improved, or anything else you'd like to share..."
                        value={feedback[session.id]?.feedbackText || ""}
                        onChange={e => handleTextChange(session.id, e.target.value)}
                        disabled={isSessionSubmitted(session.id)}
                        className="min-h-24 resize-none border-2 focus:border-primary placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional: Share any comments you'd like
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={() => submit(session.id)}
                      disabled={
                        isSessionLoading(session.id) ||
                        isSessionSubmitted(session.id) ||
                        (feedback[session.id]?.rating || 0) === 0
                      }
                      className={`w-full h-11 text-base font-semibold transition-all duration-200 ${
                        isSessionSubmitted(session.id)
                          ? "bg-primary/20 text-primary hover:bg-primary/20"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }`}
                    >
                      {isSessionLoading(session.id) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isSessionSubmitted(session.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Thank you!
                        </>
                      ) : isSessionLoading(session.id) ? (
                        "Submitting..."
                      ) : (
                        "Submit Feedback"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
