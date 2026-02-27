import { useEffect } from 'react'

export default function ConfettiExplosion() {
  useEffect(() => {
    // Create confetti pieces
    const confettiPieces = Array.from({ length: 50 }).map((_, i) => {
      const piece = document.createElement('div')
      piece.style.position = 'fixed'
      piece.style.left = Math.random() * window.innerWidth + 'px'
      piece.style.top = '-10px'
      piece.style.width = Math.random() * 10 + 5 + 'px'
      piece.style.height = piece.style.width
      piece.style.backgroundColor = [
        '#6B9F7F', // primary
        '#E8D4A2', // secondary
        '#D4A574', // accent
        '#FF6B6B',
        '#4ECDC4',
      ][Math.floor(Math.random() * 5)]
      piece.style.borderRadius = '50%'
      piece.style.pointerEvents = 'none'
      piece.style.zIndex = '9999'

      const duration = Math.random() * 2 + 2
      const xOffset = (Math.random() - 0.5) * 400
      const rotation = Math.random() * 720

      piece.animate(
        [
          {
            transform: `translateY(0) translateX(0) rotate(0deg)`,
            opacity: 1,
          },
          {
            transform: `translateY(${window.innerHeight + 100}px) translateX(${xOffset}px) rotate(${rotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: duration * 1000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }
      )

      document.body.appendChild(piece)

      return piece
    })

    // Cleanup
    return () => {
      confettiPieces.forEach((piece) => {
        setTimeout(() => piece.remove(), 4000)
      })
    }
  }, [])

  return null
}
