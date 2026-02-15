import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  SparklesIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import { isPremiumUser, checkPremiumStatus, setUserTier } from '../config/stripe'

export default function Games() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
      category: 'History'
    },
    {
      title: 'Love Story Comic',
      slug: 'love-story-comic',
      description: 'Create romantic comics with AI illustrations',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: false,
      category: 'Creative'
    },
    {
      title: 'Family Character Quiz',
      slug: 'character-quiz',
      description: 'Discover which character archetype matches your family',
      duration: '10 min',
      difficulty: 'Easy',
      isPremium: false,
      category: 'Fun'
    },
    {
      title: 'Treehouse Designer',
      slug: 'treehouse-designer',
      description: 'Design your dream treehouse with AI',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: false,
      category: 'Creative'
    },
    {
      title: 'Superhero Origin Story',
      slug: 'superhero-origin',
      description: 'Create epic superhero origin stories for your family',
      duration: '25 min',
      difficulty: 'Medium',
      isPremium: true,
      category: 'Creative'
    },
    {
      title: 'Family Movie Night',
      slug: 'family-movie-magic',
      description: 'Generate custom movie plots starring your family',
      duration: '20 min',
      difficulty: 'Medium',
      isPremium: true,
      category: 'Entertainment'
    },
    {
      title: 'Noisy Storybook',
      slug: 'noisy-storybook',
      description: 'Interactive stories with sound effects and voices',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: true,
      category: 'Kids'
    },
    {
      title: 'AI Joke Challenge',
      slug: 'ai-roast-battle',
      description: 'Family-friendly joke battles with AI',
      duration: '20 min',
      difficulty: 'Medium',
      isPremium: true,
      category: 'Fun'
    },
    {
      title: 'Restaurant Menu',
      slug: 'restaurant-menu',
      description: 'Design a custom restaurant menu for your family',
      duration: '15 min',
      difficulty: 'Easy',
      isPremium: true,
      category: 'Creative'
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
      </div>
    </div>
  )
}

function GameCard({ game, isPremium }) {
  const hasAccess = !game.isPremium || isPremium

  return (
    <Link
      to={hasAccess ? `/games/${game.slug}` : '/pricing'}
      className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all transform hover:scale-105"
    >
      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <SparklesIcon className="w-16 h-16 text-purple-400" />
        {game.isPremium && !isPremium && (
          <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <LockClosedIcon className="w-3 h-3" />
            Premium
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
        <p className="text-gray-600 mb-4 text-sm">{game.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {game.duration}
          </div>
          <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
            {game.category}
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold text-sm">
            <PlayIcon className="w-4 h-4" />
            {hasAccess ? 'Play Now' : 'Unlock with Premium'}
          </div>
        </div>
      </div>
    </Link>
  )
}
