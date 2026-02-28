'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Heart, Sparkles, ArrowRight, Smile } from 'lucide-react'
import ConfettiExplosion from '@/components/confetti'
import { useSession } from 'next-auth/react'

type Assessment = {
  assessment_id: number
  name: string
  description: string
}

type QuestionOption = {
  text?: string
  label?: string
  value?: number
  score?: number
  points?: number
}

type Question = {
  question: string
  options: QuestionOption[]
}

/** Get display text from an option (supports text, label fields) */
function getOptionText(opt: QuestionOption): string {
  return opt.text || opt.label || ''
}

/** Get numeric value from an option (supports value, score, points fields) */
function getOptionValue(opt: QuestionOption): number {
  if (typeof opt.value === 'number') return opt.value
  if (typeof opt.score === 'number') return opt.score
  if (typeof opt.points === 'number') return opt.points
  return 0
}

const assessmentIcons: { [key: number]: React.ReactNode } = {
  1: <Heart className="w-8 h-8 text-pink-500" />,
  2: <Smile className="w-8 h-8 text-amber-500" />,
  3: <Sparkles className="w-8 h-8 text-purple-500" />,
}

export default function AssessmentPage() {
  const { data: session } = useSession()

  const patientId = session?.user?.id
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    fetch('/api/assessments')
      .then((res) => res.json())
      .then(setAssessments)
  }, [])

  const loadAssessment = async (id: number) => {
    setLoading(true)
    const res = await fetch(`/api/assessments/${id}`)
    const data = await res.json()
    setSelectedAssessment(data)
    setAnswers(new Array(data.questionsJson.length).fill(null))
    setResult(null)
    setLoading(false)
  }

  const setAnswer = (index: number, value: number) => {
    const updated = [...answers]
    updated[index] = value
    setAnswers(updated)
    console.log(`Answer ${index + 1} set to:`, value, 'Total answers:', updated.filter(a => a !== null).length)
  }

  const submitAssessment = async () => {
    // Validate patientId
    if (!patientId) {
      alert('Please sign in to submit the assessment.')
      return
    }

    // Calculate score - filter out null values and sum the rest
    const score = answers.reduce<number>((total, value) => {
      if (value !== null && typeof value === 'number') {
        return total + value
      }
      return total
    }, 0)

    console.log('Submitting assessment:', {
      patientId,
      assessmentId: selectedAssessment.assessment_id,
      score,
      answers,
      answersCount: answers.filter(a => a !== null).length,
      totalQuestions: selectedAssessment.questionsJson.length,
    })

    try {
      const res = await fetch('/api/assessment-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: Number(patientId),
          assessmentId: selectedAssessment.assessment_id,
          score,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Failed to submit assessment:', errorData)
        alert('Failed to submit assessment. Please try again.')
        return
      }

      const data = await res.json()
      console.log('Assessment result:', data)
      setResult(data)
      setShowConfetti(true)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('An error occurred. Please try again.')
    }
  }

  // SELECT SCREEN
  if (!selectedAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Check In With Yourself
            </h1>
            <p className="text-lg text-muted-foreground">
              Take a mindful moment to reflect on your wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {assessments.map((a, idx) => (
              <button
                key={a.assessment_id}
                onClick={() => loadAssessment(a.assessment_id)}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      {assessmentIcons[a.assessment_id] || (
                        <Sparkles className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-2 text-left">
                    {a.name}
                  </h2>

                  <p className="text-sm text-muted-foreground text-left leading-relaxed">
                    {a.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // RESULT SCREEN
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 px-4 py-12 flex items-center justify-center">
        {showConfetti && <ConfettiExplosion />}

        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 text-center border border-border">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-bounce">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-2">
              Great Work!
            </h2>

            <p className="text-muted-foreground mb-8">
              You've completed the assessment. Here's what we found:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                <p className="text-3xl font-bold text-primary">
                  {result.numericalScore}
                </p>
              </div>

              <div className="bg-accent/5 rounded-2xl p-4 border border-accent/10">
                <p className="text-sm text-muted-foreground mb-1">
                  Current Level
                </p>
                <p className="text-2xl font-bold text-accent">
                  {result.severityLevel}
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
              <p className="text-sm text-green-700">
                ✓ Your responses have been saved securely
              </p>
            </div>

            <Button
              onClick={() => setSelectedAssessment(null)}
              className="w-full h-12 text-base"
            >
              Take Another Assessment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // QUESTIONS SCREEN
  const questions: Question[] = selectedAssessment?.questionsJson ?? []
  const progress = (answers.filter((a) => a !== null).length / questions.length) * 100
  const allAnswered = !answers.includes(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedAssessment(null)}
            className="text-primary hover:text-primary/80 font-medium text-sm mb-4 inline-flex items-center gap-2"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {selectedAssessment.name}
            </h1>
            <p className="text-muted-foreground">
              Take your time. There are no right or wrong answers.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">
              Question {answers.filter((a) => a !== null).length} of{' '}
              {questions.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            questions.map((q, i) => (
              <div
                key={`${selectedAssessment.assessment_id}-${i}`}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <Label className="text-base md:text-lg font-semibold text-foreground block mb-4">
                      {q.question}
                    </Label>

                    <RadioGroup
                      onValueChange={(v) => setAnswer(i, Number(v))}
                      value={answers[i] !== null ? String(answers[i]) : undefined}
                    >
                      <div className="space-y-3">
                        {q.options.map((opt, j) => {
                          const optValue = getOptionValue(opt)
                          const optText = getOptionText(opt)
                          const radioId = `q${selectedAssessment.assessment_id}-${i}-opt${j}`
                          return (
                            <label
                              key={radioId}
                              htmlFor={radioId}
                              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors"
                            >
                              <RadioGroupItem
                                value={String(optValue)}
                                id={radioId}
                                className="mt-1"
                              />
                              <span className="flex-1 text-base text-foreground font-normal">
                                {optText}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-10 mb-8">
          <Button
            onClick={submitAssessment}
            disabled={!allAnswered}
            className="w-full h-12 text-base font-semibold"
          >
            {allAnswered ? 'Complete Assessment' : 'Answer All Questions First'}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Your responses are completely confidential
          </p>
        </div>
      </div>
    </div>
  )
}
