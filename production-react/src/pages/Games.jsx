import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  SparklesIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  PlayIcon,
  StarIcon,
  LightBulbIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import { isPremiumUser, checkPremiumStatus, setUserTier } from '../config/stripe'

export default function Games() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [gameRequest, setGameRequest] = useState({ title: '', description: '', category: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        navigate('/login')
        return
      }

      // Check subscription status from both localStorage and database
      let hasPremium = isPremiumUser()

      // Also check database for premium status and sync to localStorage
      const dbPremiumStatus = await checkPremiumStatus()
      if (dbPremiumStatus && !hasPremium) {
        // User has premium in database but not in localStorage - sync it
        setUserTier('premium')
        hasPremium = true
      }

      setUser({ isPremium: hasPremium })
      setLoading(false)
    }

    fetchUser()
  }, [navigate])

  const allGames = [
    {
      title: 'Presidential Time Machine',
      slug: 'presidential-time-machine',
      description: 'Bring a president to 2026 and discover what would shock them',
      duration: '20 min',
      difficulty: 'Easy',
      isPremium: false,
      category: 'History',
      icon: '🏛️',
      gradient: 'from-blue-400 to-indigo-500'
    },
    {
      title: 'Love Story Comic',
      slug: 'love-story-comic',
      description: 'Create romantic comics with AI illustrations',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: false,
      category: 'Creative',
      icon: '❤️',
      gradient: 'from-pink-400 to-rose-500'
    },
    {
      title: 'Family Character Quiz',
      slug: 'character-quiz',
      description: 'Discover which character archetype matches your family',
      duration: '10 min',
      difficulty: 'Easy',
      isPremium: false,
      category: 'Fun',
      icon: '🎭',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Treehouse Designer',
      slug: 'treehouse-designer',
      description: 'Design your dream treehouse with AI',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: false,
      category: 'Creative',
      icon: '🏡',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Superhero Origin Story',
      slug: 'superhero-origin',
      description: 'Create epic superhero origin stories for your family',
      duration: '25 min',
      difficulty: 'Medium',
      isPremium: true,
      category: 'Creative',
      icon: '🦸',
      gradient: 'from-red-400 to-orange-500'
    },
    {
      title: 'Family Movie Night',
      slug: 'family-movie-magic',
      description: 'Generate custom movie plots starring your family',
      duration: '20 min',
      difficulty: 'Medium',
      isPremium: true,
      category: 'Entertainment',
      icon: '🎬',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      title: 'Noisy Storybook',
      slug: 'noisy-storybook',
      description: 'Interactive stories with sound effects and voices',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: true,
      category: 'Kids',
      icon: '📖',
      gradient: 'from-cyan-400 to-blue-500'
    },
    {
      title: 'AI Joke Challenge',
      slug: 'ai-roast-battle',
      description: 'Family-friendly joke battles with AI',
      duration: '20 min',
      difficulty: 'Medium',
      isPremium: true,
      category: 'Fun',
      icon: '🔥',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      title: 'Restaurant Menu',
      slug: 'restaurant-menu',
      description: 'Design a custom restaurant menu for your family',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: true,
      category: 'Creative',
      icon: '🍽️',
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      title: 'Musical Maestro',
      slug: 'musical-maestro',
      description: 'Sing Disney, K-pop, or your own songs and get AI performance reviews!',
      duration: '20 min',
      difficulty: 'Easy',
      isPremium: true,
      category: 'Music',
      icon: '🎤',
      gradient: 'from-purple-400 to-pink-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/">
              <Logo className="w-8 h-8" textClassName="text-lg" />
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All Games
          </h1>
          <p className="text-xl text-gray-600">
            {allGames.length} magical experiences for your family
          </p>
        </div>

        {/* Free Games */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            Free Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGames.filter(game => !game.isPremium).map((game) => (
              <GameCard key={game.slug} game={game} isPremium={user?.isPremium} />
            ))}
          </div>
        </div>

        {/* Premium Games */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <StarIcon className="w-6 h-6 text-purple-600" />
            Premium Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGames.filter(game => game.isPremium).map((game) => (
              <GameCard key={game.slug} game={game} isPremium={user?.isPremium} />
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        {!user?.isPremium && (
          <div className="mt-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Unlock All Games</h3>
            <p className="text-lg mb-6 opacity-90">
              Get unlimited access to all premium games with a family subscription
            </p>
            <Link
              to="/pricing"
              className="inline-block bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              Start 7-Day Free Trial
            </Link>
          </div>
        )}

        {/* Request Future Games */}
        <div className="mt-12">
          {!showRequestForm ? (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-8 text-center">
              <LightBulbIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Have a Game Idea?</h3>
              <p className="text-gray-600 mb-6">
                We're always looking for new game ideas! Share your creative suggestion and help shape the future of AI Family Night.
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <LightBulbIcon className="w-5 h-5" />
                Suggest a Game
              </button>
            </div>
          ) : submitted ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
              <p className="text-gray-600 mb-6">
                Your game idea has been received! Our team will review it and we'll let you know if we decide to build it.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setShowRequestForm(false)
                  setGameRequest({ title: '', description: '', category: '' })
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Suggest Another Game
              </button>
            </div>
          ) : (
            <div className="bg-white border-2 border-blue-200 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <LightBulbIcon className="w-7 h-7 text-blue-600" />
                  Suggest a New Game
                </h3>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setSubmitting(true)

                  try {
                    // Save to Supabase or send email
                    const { data: { user: authUser } } = await supabase.auth.getUser()

                    const response = await fetch('/api/submit-game-idea', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...gameRequest,
                        userId: authUser?.id,
                        userEmail: authUser?.email
                      })
                    })

                    if (response.ok) {
                      setSubmitted(true)
                    } else {
                      alert('Error submitting idea. Please try again.')
                    }
                  } catch (error) {
                    console.error('Error:', error)
                    alert('Error submitting idea. Please try again.')
                  } finally {
                    setSubmitting(false)
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Game Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={gameRequest.title}
                    onChange={(e) => setGameRequest({ ...gameRequest, title: e.target.value })}
                    placeholder="e.g., Time Travel Adventure"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={gameRequest.category}
                    onChange={(e) => setGameRequest({ ...gameRequest, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category...</option>
                    <option value="creative">Creative & Art</option>
                    <option value="educational">Educational</option>
                    <option value="fun">Just for Fun</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="problem-solving">Problem Solving</option>
                    <option value="music">Music & Sound</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe Your Game Idea *
                  </label>
                  <textarea
                    required
                    value={gameRequest.description}
                    onChange={(e) => setGameRequest({ ...gameRequest, description: e.target.value })}
                    placeholder="What would the game do? What makes it fun for families? Any special features?"
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Be as detailed as you'd like! The more we know, the better we can design it.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !gameRequest.title || !gameRequest.description}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        Submit Idea
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GameCard({ game, isPremium }) {
  const hasAccess = !game.isPremium || isPremium
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      to={hasAccess ? `/games/${game.slug}` : '/pricing'}
      className="group bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-2xl hover:border-purple-400 transition-all transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Game Icon Header */}
      <div className={`relative aspect-video bg-gradient-to-br ${game.gradient} flex items-center justify-center overflow-hidden`}>
        {/* Animated background particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute top-8 right-8 w-3 h-3 bg-white rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-6 left-12 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
        </div>

        {/* Large emoji icon with animation */}
        <div
          className="relative z-10 transition-all duration-300"
          style={{
            fontSize: '4rem',
            transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1) rotate(0deg)',
            filter: isHovered ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' : 'none'
          }}
        >
          {game.icon}
        </div>

        {/* Sparkle effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <SparklesIcon className="absolute top-4 left-4 w-6 h-6 text-white animate-ping" />
            <SparklesIcon className="absolute bottom-4 right-4 w-8 h-8 text-white animate-ping" style={{ animationDelay: '0.2s' }} />
            <SparklesIcon className="absolute top-1/2 left-1/2 w-5 h-5 text-white animate-ping" style={{ animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Premium badge */}
        {game.isPremium && !isPremium && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <LockClosedIcon className="w-3 h-3" />
            Premium
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {game.title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {game.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {game.duration}
          </div>
          <span className={`px-2 py-1 bg-gradient-to-r ${game.gradient} bg-opacity-10 text-gray-700 rounded-full text-xs font-semibold`}>
            {game.category}
          </span>
        </div>

        {/* Play button */}
        <div className={`bg-gradient-to-r ${game.gradient} text-white py-3 px-4 rounded-xl font-bold text-sm text-center shadow-md group-hover:shadow-lg transition-all flex items-center justify-center gap-2`}>
          <PlayIcon className="w-5 h-5" />
          {hasAccess ? 'Play Now' : 'Unlock with Premium'}
        </div>
      </div>
    </Link>
  )
}
