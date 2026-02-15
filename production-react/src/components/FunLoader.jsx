/**
 * Fun Loading Animation Component
 * Research: Kids perceive spinners as "broken" - use character animations instead
 * 1.0s transition limit - anything longer needs entertaining animation
 */

export default function FunLoader({ message = "Loading...", type = "dance" }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {type === "dance" && <DancingCharacter />}
      {type === "bounce" && <BouncingStars />}
      {type === "rainbow" && <RainbowLoader />}

      <p className="mt-6 text-xl font-semibold text-gray-700 animate-pulse">
        {message}
      </p>
    </div>
  )
}

/**
 * Dancing Character Animation
 * Fun alternative to boring spinner
 */
function DancingCharacter() {
  return (
    <div className="relative w-32 h-32">
      {/* Character body */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-7xl animate-bounce" style={{ animationDuration: '0.6s' }}>
          🎉
        </div>
      </div>

      {/* Sparkles around character */}
      <div className="absolute top-0 left-0 text-2xl animate-ping" style={{ animationDuration: '1s' }}>
        ✨
      </div>
      <div className="absolute top-0 right-0 text-2xl animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }}>
        ⭐
      </div>
      <div className="absolute bottom-0 left-0 text-2xl animate-ping" style={{ animationDuration: '1.1s', animationDelay: '0.4s' }}>
        💫
      </div>
      <div className="absolute bottom-0 right-0 text-2xl animate-ping" style={{ animationDuration: '1.3s', animationDelay: '0.1s' }}>
        🌟
      </div>
    </div>
  )
}

/**
 * Bouncing Stars Animation
 */
function BouncingStars() {
  const stars = ['⭐', '🌟', '✨', '💫', '⭐']

  return (
    <div className="flex gap-4">
      {stars.map((star, index) => (
        <div
          key={index}
          className="text-5xl animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.8s'
          }}
        >
          {star}
        </div>
      ))}
    </div>
  )
}

/**
 * Rainbow Loading Bar
 */
function RainbowLoader() {
  return (
    <div className="w-64">
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-rainbow-slide rounded-full"></div>
      </div>
      <style jsx>{`
        @keyframes rainbow-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-rainbow-slide {
          animation: rainbow-slide 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

/**
 * Full Page Loader
 * Use when loading entire page/game
 */
export function FullPageLoader({ message, type = "dance" }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <FunLoader message={message} type={type} />
    </div>
  )
}

/**
 * Inline Loader
 * Use for button loading states
 */
export function InlineLoader({ size = "md" }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizes[size]} animate-spin`}>
      <div className="text-2xl">🎨</div>
    </div>
  )
}
