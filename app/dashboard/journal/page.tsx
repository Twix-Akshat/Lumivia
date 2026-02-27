"use client"

import { SetStateAction, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Smile, Frown, Meh, Laugh, Angry, Trash2 } from "lucide-react"

interface Journal {
    id: number
    title: string
    entryText: string
    moodValue: number | null
    tags: string | null
    createdAt: string
}

const moodIcons = [
    { value: 1, icon: Angry },
    { value: 2, icon: Frown },
    { value: 3, icon: Meh },
    { value: 4, icon: Smile },
    { value: 5, icon: Laugh },
]

export default function JournalPage() {
    const [journals, setJournals] = useState<Journal[]>([])
    const [title, setTitle] = useState("")
    const [entry, setEntry] = useState("")
    const [mood, setMood] = useState<number | null>(null)
    const [tags, setTags] = useState("")
    const [loading, setLoading] = useState(true)

    // ✅ Fetch journals (session-based)
    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const res = await fetch("/api/journals")
                const data = await res.json()

                if (Array.isArray(data)) {
                    setJournals(data)
                } else {
                    setJournals([])
                }
            } catch (error) {
                console.error("Failed to fetch journals:", error)
                setJournals([])
            } finally {
                setLoading(false)
            }
        }

        fetchJournals()
    }, [])

    // ✅ Create journal
    const handleSubmit = async () => {
        if (!title || !entry || !mood) return

        try {
            const res = await fetch("/api/journals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    entryText: entry,
                    moodValue: mood,
                    tags,
                }),
            })

            if (!res.ok) return

            const newJournal = await res.json()

            setJournals(prev => [newJournal, ...prev])

            setTitle("")
            setEntry("")
            setMood(null)
            setTags("")
        } catch (error) {
            console.error("Failed to create journal:", error)
        }
    }

    // ✅ Delete journal
    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/journals/${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setJournals(prev => prev.filter(j => j.id !== id))
            }
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">

            {/* CREATE JOURNAL */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">New Journal Entry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    <Input
                        placeholder="Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <Textarea
                        placeholder="Write your thoughts..."
                        className="min-h-[120px]"
                        value={entry}
                        onChange={(e: { target: { value: SetStateAction<string> } }) => setEntry(e.target.value)}
                    />

                    {/* Mood Selector */}
                    <div>
                        <p className="text-sm font-medium mb-2">How are you feeling?</p>
                        <div className="flex gap-3">
                            {moodIcons.map(({ value, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setMood(value)}
                                    className={`p-2 rounded-full border transition-all ${mood === value
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input
                        placeholder="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />

                    <Button onClick={handleSubmit} className="w-full">
                        Save Entry
                    </Button>
                </CardContent>
            </Card>

            <Separator />

            {/* JOURNAL LIST */}
            <div className="space-y-4">

                {loading && (
                    <p className="text-center text-sm text-muted-foreground">
                        Loading journals...
                    </p>
                )}

                {!loading && journals.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                        No journal entries yet.
                    </p>
                )}

                {!loading &&
                    journals.map((journal) => (
                        <Card key={journal.id} className="border shadow-sm">
                            <CardContent className="p-5 space-y-3">

                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-base">
                                            {journal.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(journal.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(journal.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>

                                <p className="text-sm whitespace-pre-line">
                                    {journal.entryText}
                                </p>

                                {/* Mood Display */}
                                {journal.moodValue && (
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const MoodIcon =
                                                moodIcons.find(m => m.value === journal.moodValue)?.icon
                                            return MoodIcon ? (
                                                <MoodIcon className="h-4 w-4 text-primary" />
                                            ) : null
                                        })()}
                                        <span className="text-xs text-muted-foreground">
                                            Mood: {journal.moodValue}/5
                                        </span>
                                    </div>
                                )}

                                {/* Tags */}
                                {journal.tags && (
                                    <div className="flex flex-wrap gap-2">
                                        {journal.tags.split(",").map((tag, i) => (
                                            <Badge key={i} variant="secondary">
                                                {tag.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    )
}
