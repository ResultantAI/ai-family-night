export default function Logo({ className = "w-10 h-10", textClassName = "text-xl" }) {
  return (
    <div className="flex items-center gap-2">
      {/* SVG Logo */}
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Main circle background */}
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

        {/* Family figures (simplified) */}
        <g transform="translate(50, 50)">
          {/* Parent 1 (left) */}
          <circle cx="-18" cy="-8" r="6" fill="white" opacity="0.9" />
          <path d="M -18 -2 L -18 12 M -18 3 L -24 8 M -18 3 L -12 8 M -18 12 L -24 22 M -18 12 L -12 22"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9" />

          {/* Parent 2 (right) */}
          <circle cx="18" cy="-8" r="6" fill="white" opacity="0.9" />
          <path d="M 18 -2 L 18 12 M 18 3 L 12 8 M 18 3 L 24 8 M 18 12 L 12 22 M 18 12 L 24 22"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9" />

          {/* Child (center, smaller) */}
          <circle cx="0" cy="-3" r="5" fill="white" opacity="0.95" />
          <path d="M 0 2 L 0 14 M 0 6 L -5 10 M 0 6 L 5 10 M 0 14 L -5 22 M 0 14 L 5 22"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.95" />
        </g>

        {/* Magic sparkles/stars around the family */}
        <g>
          {/* Top left sparkle */}
          <path d="M 20 20 L 22 24 L 20 28 L 18 24 Z M 16 24 L 20 24 L 24 24"
                fill="url(#starGradient)"
                stroke="url(#starGradient)"
                strokeWidth="1" />

          {/* Top right sparkle */}
          <path d="M 80 20 L 82 24 L 80 28 L 78 24 Z M 76 24 L 80 24 L 84 24"
                fill="url(#starGradient)"
                stroke="url(#starGradient)"
                strokeWidth="1" />

          {/* Bottom sparkle */}
          <path d="M 50 78 L 52 82 L 50 86 L 48 82 Z M 46 82 L 50 82 L 54 82"
                fill="url(#starGradient)"
                stroke="url(#starGradient)"
                strokeWidth="1" />

          {/* Small accent stars */}
          <circle cx="30" cy="70" r="2" fill="#fbbf24" opacity="0.8" />
          <circle cx="70" cy="70" r="2" fill="#fbbf24" opacity="0.8" />
          <circle cx="15" cy="45" r="1.5" fill="#fbbf24" opacity="0.6" />
          <circle cx="85" cy="45" r="1.5" fill="#fbbf24" opacity="0.6" />
        </g>
      </svg>

      {/* Text Logo */}
      <span className={`font-bold text-gray-900 ${textClassName}`}>
        AI Family Night
      </span>
    </div>
  )
}

// Simplified version without text for small spaces
export function LogoIcon({ className = "w-10 h-10" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

      <g transform="translate(50, 50)">
        <circle cx="-18" cy="-8" r="6" fill="white" opacity="0.9" />
        <path d="M -18 -2 L -18 12 M -18 3 L -24 8 M -18 3 L -12 8 M -18 12 L -24 22 M -18 12 L -12 22"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.9" />

        <circle cx="18" cy="-8" r="6" fill="white" opacity="0.9" />
        <path d="M 18 -2 L 18 12 M 18 3 L 12 8 M 18 3 L 24 8 M 18 12 L 12 22 M 18 12 L 24 22"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.9" />

        <circle cx="0" cy="-3" r="5" fill="white" opacity="0.95" />
        <path d="M 0 2 L 0 14 M 0 6 L -5 10 M 0 6 L 5 10 M 0 14 L -5 22 M 0 14 L 5 22"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.95" />
      </g>

      <g>
        <path d="M 20 20 L 22 24 L 20 28 L 18 24 Z M 16 24 L 20 24 L 24 24"
              fill="url(#starGradient)"
              stroke="url(#starGradient)"
              strokeWidth="1" />

        <path d="M 80 20 L 82 24 L 80 28 L 78 24 Z M 76 24 L 80 24 L 84 24"
              fill="url(#starGradient)"
              stroke="url(#starGradient)"
              strokeWidth="1" />

        <path d="M 50 78 L 52 82 L 50 86 L 48 82 Z M 46 82 L 50 82 L 54 82"
              fill="url(#starGradient)"
              stroke="url(#starGradient)"
              strokeWidth="1" />

        <circle cx="30" cy="70" r="2" fill="#fbbf24" opacity="0.8" />
        <circle cx="70" cy="70" r="2" fill="#fbbf24" opacity="0.8" />
        <circle cx="15" cy="45" r="1.5" fill="#fbbf24" opacity="0.6" />
        <circle cx="85" cy="45" r="1.5" fill="#fbbf24" opacity="0.6" />
      </g>
    </svg>
  )
}
