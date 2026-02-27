"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { JitsiMeeting } from "@jitsi/react-sdk"

export default function VideoSessionPage() {
  const { id } = useParams()
  const [roomName, setRoomName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch(`/api/sessions/${id}`)

      if (!res.ok) {
        console.error("Failed to fetch session")
        return
      }

      const data = await res.json()
      console.log(data)

      if (data?.meetingRoomId) {
        setRoomName(data.meetingRoomId)
      }
    }

    fetchSession()
  }, [id])

  if (!roomName) return <p>Loading video session...</p>

  return (
    <div className="h-screen w-full">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          enableLobby: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        }}
        getIFrameRef={(node) => {
          node.style.height = "100%"
          node.style.width = "100%"
        }}
      />
    </div>
  )
}
