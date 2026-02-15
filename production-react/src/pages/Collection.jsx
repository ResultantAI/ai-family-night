import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  SparklesIcon,
  TrophyIcon,
  StarIcon,
  ArrowLeftIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { isPremiumUser } from '../config/stripe'
import Logo from '../components/Logo'

export default function Collection() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collections, setCollections] = useState({
    badges: [],
    stickers: [],
    artifacts: [],
    milestones: []
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        navigate('/login')
        return
      }

      const hasPremium = isPremiumUser()
      const childName = authUser.user_metadata?.child_name ||
                       authUser.user_metadata?.first_name ||
                       'your child'

      setUser({
        childName,
        isPremium: hasPremium
      })

      // TODO: Fetch real collection data from database
      // For now, load sample data to show the concept
      loadSampleCollections()

      setLoading(false)
    }

    fetchUser()
  }, [navigate])

  const loadSampleCollections = () => {
    // Sample data structure - will be replaced with real DB data
    setCollections({
      badges: [
        { id: 1, name: 'First Story', icon: '📖', earned: true, game: 'Presidential Time Machine' },
        { id: 2, name: 'Creative Mind', icon: '🎨', earned: true, game: 'Love Story Comic' },
        { id: 3, name: 'Problem Solver', icon: '🧩', earned: true, game: 'Character Quiz' },
        { id: 4, name: 'Space Explorer', icon: '🚀', earned: false, game: 'Space Week (locked)' },
      ],
      stickers: [
        { id: 1, emoji: '⭐', name: 'Gold Star', earned: true },
        { id: 2, emoji: '🌟', name: 'Shining Star', earned: true },
        { id: 3, emoji: '💫', name: 'Super Star', earned: false },
      ],
      artifacts: [
        { id: 1, type: 'drawing', title: 'Presidential Story', date: '2026-02-13', thumbnail: null },
        { id: 2, type: 'comic', title: 'Love Adventure', date: '2026-02-12', thumbnail: null },
      ],
      milestones: [
        { id: 1, title: '3 Games Completed', reached: true, icon: '🎮' },
        { id: 2, title: '7-Day Streak', reached: false, progress: 3, total: 7, icon: '🔥' },
        { id: 3, title: '10 Badges Earned', reached: false, progress: 3, total: 10, icon: '🏆' },
      ]
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading collection...</p>
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
            <Logo className="w-8 h-8" textClassName="text-lg" />
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Collection Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <TrophyIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {user.childName}'s Collection
          </h1>
          <p className="text-xl text-gray-600">
            All your earned badges, stickers, and creations
          </p>
        </div>

        {/* Milestones Progress */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <StarIcon className="w-6 h-6 text-purple-600" />
            Milestones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`rounded-2xl p-6 ${
                  milestone.reached
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{milestone.icon}</div>
                  <div className={`font-bold mb-2 ${milestone.reached ? 'text-white' : 'text-gray-900'}`}>
                    {milestone.title}
                  </div>
                  {!milestone.reached && milestone.progress !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{milestone.progress} / {milestone.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${(milestone.progress / milestone.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges Earned</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {collections.badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-xl p-6 text-center transition-all ${
                  badge.earned
                    ? 'bg-white border-2 border-purple-200 shadow-md hover:shadow-lg'
                    : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-5xl mb-2">{badge.icon}</div>
                <div className="font-semibold text-gray-900 text-sm">{badge.name}</div>
                <div className="text-xs text-gray-500 mt-1">{badge.game}</div>
                {!badge.earned && (
                  <LockClosedIcon className="w-4 h-4 text-gray-400 mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sticker Collection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sticker Collection</h2>
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8">
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
              {collections.stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className={`aspect-square rounded-lg flex items-center justify-center text-4xl ${
                    sticker.earned
                      ? 'bg-purple-50 border-2 border-purple-200 hover:scale-110 transition-transform cursor-pointer'
                      : 'bg-gray-50 border-2 border-dashed border-gray-300 opacity-40'
                  }`}
                  title={sticker.name}
                >
                  {sticker.earned ? sticker.emoji : '?'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Creations/Artifacts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Creations</h2>
          {collections.artifacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <SparklesIcon className="w-16 h-16 text-purple-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{artifact.title}</h3>
                    <p className="text-sm text-gray-600">{artifact.type}</p>
                    <p className="text-xs text-gray-500 mt-2">{artifact.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-12 text-center">
              <SparklesIcon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No creations yet</h3>
              <p className="text-gray-600 mb-6">Start playing games to create and save your masterpieces!</p>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Games
              </Link>
            </div>
          )}
        </div>

        {/* Premium Upsell if not premium */}
        {!user.isPremium && (
          <div className="mt-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Unlock Your Full Collection</h3>
            <p className="text-lg mb-6 opacity-90">
              Keep all of {user.childName}'s badges, creations, and progress safe forever with Premium
            </p>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Unlimited badges & stickers</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5" />
                  <span>Save all creations & artifacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5" />
                  <span>Access all 9 premium games</span>
                </div>
              </div>
            </div>
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
