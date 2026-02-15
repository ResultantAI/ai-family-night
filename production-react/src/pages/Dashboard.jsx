import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ClockIcon,
  PhotoIcon,
  CogIcon,
  PlusIcon,
  CheckCircleIcon,
  PlayIcon,
  LockClosedIcon,
  StarIcon,
  CreditCardIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import Logo, { LogoIcon } from '../components/Logo'
import { isPremiumUser, checkPremiumStatus, setUserTier } from '../config/stripe'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [children, setChildren] = useState([])
  const [recentCreations, setRecentCreations] = useState([])

  // Fetch real user data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        navigate('/login')
        return
      }

      // Check if onboarding is completed
      const hasCompletedOnboarding = authUser.user_metadata?.onboarding_completed
      if (!hasCompletedOnboarding) {
        navigate('/onboarding')
        return
      }

      // Extract user data from Supabase auth
      const firstName = authUser.user_metadata?.first_name ||
                       authUser.user_metadata?.firstName ||
                       authUser.user_metadata?.full_name?.split(' ')[0] ||
                       authUser.email?.split('@')[0]

      const email = authUser.email

      // Check subscription status from both localStorage and database
      let hasPremium = isPremiumUser()

      // Also check database for premium status and sync to localStorage
      const dbPremiumStatus = await checkPremiumStatus()
      if (dbPremiumStatus && !hasPremium) {
        // User has premium in database but not in localStorage - sync it
        setUserTier('premium')
        hasPremium = true
      }

      setUser({
        firstName,
        email,
        isPremium: hasPremium,
        trialEndsAt: null,
        nextBillingDate: null,
        subscriptionStatus: hasPremium ? 'premium' : 'free'
      })

      // Fetch children profiles
      const { data: childrenData } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: true })

      if (childrenData) {
        setChildren(childrenData)
      }

      // Fetch recent creations from gallery
      const { data: galleryData } = await supabase
        .from('gallery')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (galleryData) {
        // Transform gallery data to match creation card format
        const creations = galleryData.map(item => ({
          id: item.id,
          gameTitle: item.game_name,
          createdAt: new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          imageUrl: item.preview
        }))
        setRecentCreations(creations)
      }

      setLoading(false)
    }

    fetchUser()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const thisWeeksGame = {
    title: 'Presidential Time Machine',
    slug: 'presidential-time-machine',
    description: 'Bring a president to 2026 and see what would shock them',
    duration: '20 min',
    difficulty: 'Easy',
    releaseDate: '2026-02-13'
  }

  const upcomingGames = [
    { title: 'Superhero Origin Story', releaseDate: '2026-02-20', isPremium: true },
    { title: 'Dream Treehouse Designer', releaseDate: '2026-02-27', isPremium: true },
    { title: 'Restaurant Menu Maker', releaseDate: '2026-03-06', isPremium: true }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mx-auto mb-4 flex justify-center">
            <LogoIcon className="w-16 h-16" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/">
                <Logo className="w-8 h-8" textClassName="text-lg" />
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className="text-purple-600 font-semibold border-b-2 border-purple-600 pb-1"
                >
                  Dashboard
                </Link>
                <Link
                  to="/games"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  All Games
                </Link>
                <Link
                  to="/calendar"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Calendar
                </Link>
                <Link
                  to="/gallery"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Gallery
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {user.isPremium && (
                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg">
                  <StarIcon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">Premium</span>
                </div>
              )}

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.firstName[0].toUpperCase()}
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user.firstName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <CogIcon className="w-5 h-5 text-gray-400" />
                        Settings
                      </Link>

                      <Link
                        to="/pricing"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <StarIcon className="w-5 h-5 text-gray-400" />
                        {user.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                      </Link>

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's new this week
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Subscription Status Card */}
          <div className="lg:col-span-1">
            {user.isPremium ? (
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Premium Plan</h3>
                  <StarIcon className="w-6 h-6" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Status</span>
                    <span className="font-semibold">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Next billing</span>
                    <span className="font-semibold">{user.nextBillingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Amount</span>
                    <span className="font-semibold">$9.99/month</span>
                  </div>
                </div>

                <Link
                  to="/settings"
                  className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  Manage Billing
                </Link>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Free Plan</h3>
                  <StarIcon className="w-6 h-6 text-gray-400" />
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>3 free games</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Premium games locked</span>
                  </div>
                </div>

                <Link
                  to="/pricing"
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
                >
                  <StarIcon className="w-4 h-4" />
                  Upgrade to Premium
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard
              icon={<CheckCircleIcon className="w-8 h-8 text-green-600" />}
              label="Games Completed"
              value="0"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={<PhotoIcon className="w-8 h-8 text-blue-600" />}
              label="Creations Saved"
              value="0"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<UserCircleIcon className="w-8 h-8 text-purple-600" />}
              label="Children"
              value={children.length}
              bgColor="bg-purple-50"
            />
            <StatCard
              icon={<ClockIcon className="w-8 h-8 text-orange-600" />}
              label="Hours Together"
              value="0"
              bgColor="bg-orange-50"
            />
          </div>
        </div>

        {/* This Week's Game */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">This Week's Game</h2>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    NEW THIS WEEK
                  </span>
                  <span className="text-sm text-gray-600">Released {thisWeeksGame.releaseDate}</span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {thisWeeksGame.title}
                </h3>
                <p className="text-gray-700 mb-4">
                  {thisWeeksGame.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {thisWeeksGame.duration}
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    {thisWeeksGame.difficulty}
                  </span>
                </div>
              </div>

              <Link
                to={`/games/${thisWeeksGame.slug}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <PlayIcon className="w-6 h-6" />
                Play Now
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Children */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Children</h2>
              <Link
                to="/settings"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Child
              </Link>
            </div>

            <div className="space-y-3">
              {children.length > 0 ? (
                children.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No children profiles yet</p>
                  <Link
                    to="/settings"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm inline-flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add your first child
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Creations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Creations</h2>
              <Link
                to="/gallery"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>

            {recentCreations.length > 0 ? (
              <div className="space-y-3">
                {recentCreations.map((creation) => (
                  <CreationCard key={creation.id} creation={creation} />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No creations yet</h3>
                <p className="text-gray-600 mb-6">Start playing games to create and save your family memories!</p>
                <Link
                  to="/games"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <PlayIcon className="w-5 h-5" />
                  Browse Games
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Games */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingGames.map((game, index) => (
              <UpcomingGameCard key={index} game={game} isPremium={user.isPremium} />
            ))}
          </div>
        </div>

        {/* Free User Upgrade Prompt */}
        {!user.isPremium && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Unlock All Games</h3>
                <p className="text-purple-100">
                  Get a new game every week + save unlimited creations for just $9.99/month
                </p>
              </div>
              <Link
                to="/upgrade"
                className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <StarIcon className="w-6 h-6" />
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable Components
function StatCard({ icon, label, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="mt-1 text-sm text-gray-600">{label}</div>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  )
}

function ChildCard({ child }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {child.name[0]}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{child.name}</div>
            <div className="text-sm text-gray-500">{child.age} years old</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Interests</div>
          <div className="text-xs text-purple-600 font-medium">
            {child.interests?.length > 0 ? child.interests.slice(0, 2).join(', ') : 'None yet'}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreationCard({ creation }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          {creation.imageUrl ? (
            <img src={creation.imageUrl} alt={creation.gameTitle} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <PhotoIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{creation.gameTitle}</div>
          <div className="text-sm text-gray-500">{creation.createdAt}</div>
        </div>
        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
          View
        </button>
      </div>
    </div>
  )
}

function UpcomingGameCard({ game, isPremium }) {
  return (
    <div className={`border-2 rounded-xl p-6 relative ${
      isPremium
        ? 'border-purple-200 bg-purple-50'
        : 'border-gray-200 bg-white opacity-60'
    }`}>
      {!isPremium && (
        <div className="absolute top-4 right-4">
          <LockClosedIcon className="w-5 h-5 text-gray-400" />
        </div>
      )}

      <div className="text-sm text-gray-600 mb-2">{game.releaseDate}</div>
      <div className="font-bold text-gray-900">{game.title}</div>

      {!isPremium && (
        <div className="mt-4">
          <Link
            to="/upgrade"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Unlock with Premium →
          </Link>
        </div>
      )}
    </div>
  )
}
