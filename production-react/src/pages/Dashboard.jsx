import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
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

export default function Dashboard() {
  const [user] = useState({
    firstName: 'Sarah',
    email: 'sarah@example.com',
    isPremium: true,
    trialEndsAt: null,
    nextBillingDate: '2026-03-15',
    subscriptionStatus: 'active'
  })

  const [children] = useState([
    { id: 1, name: 'Emma', age: 8, gamesCompleted: 12 },
    { id: 2, name: 'Noah', age: 11, gamesCompleted: 8 }
  ])

  const [recentCreations] = useState([
    { id: 1, gameTitle: 'Presidential Time Machine', createdAt: '2026-02-13', imageUrl: null },
    { id: 2, gameTitle: 'Superhero Origin', createdAt: '2026-02-10', imageUrl: null },
    { id: 3, gameTitle: 'Love Story Comic', createdAt: '2026-02-08', imageUrl: null }
  ])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <SparklesIcon className="w-8 h-8 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">AI Family Night</span>
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

              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <CogIcon className="w-6 h-6" />
              </button>

              <div className="relative">
                <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.firstName[0]}
                  </div>
                </button>
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
                to="/settings/billing"
                className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="w-4 h-4" />
                Manage Billing
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard
              icon={<CheckCircleIcon className="w-8 h-8 text-green-600" />}
              label="Games Completed"
              value="20"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={<PhotoIcon className="w-8 h-8 text-blue-600" />}
              label="Creations Saved"
              value="15"
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
              value="8.5"
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
                to="/settings/children/new"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Child
              </Link>
            </div>

            <div className="space-y-3">
              {children.map((child) => (
                <ChildCard key={child.id} child={child} />
              ))}
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

            <div className="space-y-3">
              {recentCreations.map((creation) => (
                <CreationCard key={creation.id} creation={creation} />
              ))}
            </div>
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
          <div className="text-sm text-gray-500">Games completed</div>
          <div className="text-lg font-bold text-purple-600">{child.gamesCompleted}</div>
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
