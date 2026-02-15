import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarIcon,
  StarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowLeftIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { isPremiumUser } from '../config/stripe'
import Logo from '../components/Logo'

export default function Calendar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(null)
  const [streak, setStreak] = useState(0)

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

      // TODO: Fetch real streak and progress data from database
      // For now, use sample data
      setStreak(3)
      loadCurrentWeek()

      setLoading(false)
    }

    fetchUser()
  }, [navigate])

  const loadCurrentWeek = () => {
    // Sample themed week - will be replaced with dynamic data
    setCurrentWeek({
      theme: 'Space Week',
      emoji: '🚀',
      weekNumber: 7,
      year: 2026,
      missions: [
        {
          day: 'Monday',
          date: 'Feb 17',
          title: 'Design Your Spaceship',
          game: 'spaceship-designer',
          duration: '20 min',
          status: 'completed', // completed, available, locked
          points: 100,
          isPremium: true
        },
        {
          day: 'Wednesday',
          date: 'Feb 19',
          title: 'Meet an Alien Civilization',
          game: 'alien-encounter',
          duration: '25 min',
          status: 'available',
          points: 150,
          isPremium: true
        },
        {
          day: 'Sunday',
          date: 'Feb 23',
          title: 'Space Adventure Story',
          game: 'space-story',
          duration: '30 min',
          status: 'locked',
          points: 200,
          isPremium: true,
          unlockRequirement: 'Complete Monday & Wednesday missions'
        }
      ],
      weeklyReward: {
        name: 'Space Explorer Badge',
        emoji: '🛸',
        unlocked: false
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  const completedMissions = currentWeek.missions.filter(m => m.status === 'completed').length
  const totalMissions = currentWeek.missions.length
  const weekProgress = Math.round((completedMissions / totalMissions) * 100)

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

      {/* Calendar Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <CalendarIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Weekly Missions
          </h1>
          <p className="text-xl text-gray-600">
            Complete all 3 missions this week to unlock your special reward!
          </p>
        </div>

        {/* Streak & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6 text-center">
            <FireIcon className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">{streak} weeks</div>
            <div className="text-sm text-gray-600 mt-1">Current streak</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-6 text-center">
            <TrophyIcon className="w-10 h-10 text-purple-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">{completedMissions}/{totalMissions}</div>
            <div className="text-sm text-gray-600 mt-1">Missions this week</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6 text-center">
            <StarIcon className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">{weekProgress}%</div>
            <div className="text-sm text-gray-600 mt-1">Week complete</div>
          </div>
        </div>

        {/* This Week's Theme */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-8 mb-12 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{currentWeek.emoji}</div>
              <div>
                <div className="text-sm opacity-90">Week {currentWeek.weekNumber}, {currentWeek.year}</div>
                <h2 className="text-3xl font-bold">{currentWeek.theme}</h2>
              </div>
            </div>
            {!user.isPremium && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <LockClosedIcon className="w-5 h-5 inline mr-2" />
                <span className="font-semibold">Premium Only</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${weekProgress}%` }}
            />
          </div>
          <p className="text-sm mt-2 opacity-90">
            {completedMissions === totalMissions
              ? '🎉 Week complete! Claim your reward below!'
              : `Complete ${totalMissions - completedMissions} more mission${totalMissions - completedMissions === 1 ? '' : 's'} to unlock your reward`
            }
          </p>
        </div>

        {/* Mission Cards */}
        <div className="space-y-6 mb-12">
          {currentWeek.missions.map((mission, index) => (
            <MissionCard
              key={index}
              mission={mission}
              isPremium={user.isPremium}
            />
          ))}
        </div>

        {/* Weekly Reward */}
        <div className={`rounded-3xl p-8 text-center ${
          completedMissions === totalMissions
            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-xl'
            : 'bg-white border-2 border-gray-200 text-gray-400'
        }`}>
          <div className="text-6xl mb-4">{currentWeek.weeklyReward.emoji}</div>
          <h3 className={`text-2xl font-bold mb-2 ${
            completedMissions === totalMissions ? 'text-white' : 'text-gray-900'
          }`}>
            Weekly Reward: {currentWeek.weeklyReward.name}
          </h3>
          {completedMissions === totalMissions ? (
            <button className="mt-4 bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105">
              Claim Reward! 🎉
            </button>
          ) : (
            <p className="text-gray-600 mt-2">
              Complete all missions to unlock
            </p>
          )}
        </div>

        {/* Premium Upsell if not premium */}
        {!user.isPremium && (
          <div className="mt-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Unlock Weekly Missions</h3>
            <p className="text-lg mb-6 opacity-90">
              Get new themed missions every week with {user.childName}'s Premium subscription
            </p>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>52 themed weeks per year</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>3 missions per week (156/year)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Build streaks & earn rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Personalized based on interests</span>
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

// Mission Card Component
function MissionCard({ mission, isPremium }) {
  const isLocked = mission.status === 'locked'
  const isCompleted = mission.status === 'completed'
  const isAvailable = mission.status === 'available'

  return (
    <div className={`rounded-2xl p-6 transition-all ${
      isCompleted
        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg'
        : isAvailable && isPremium
        ? 'bg-white border-2 border-purple-200 shadow-md hover:shadow-lg hover:border-purple-400'
        : 'bg-gray-100 border-2 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              isCompleted
                ? 'bg-white/20 text-white'
                : isAvailable
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {mission.day}
            </div>
            <div className={`text-sm ${
              isCompleted ? 'text-white/90' : 'text-gray-600'
            }`}>
              {mission.date}
            </div>
            {mission.isPremium && !isPremium && (
              <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                <LockClosedIcon className="w-3 h-3" />
                <span>Premium</span>
              </div>
            )}
          </div>

          <h3 className={`text-xl font-bold mb-2 ${
            isCompleted ? 'text-white' : isLocked ? 'text-gray-500' : 'text-gray-900'
          }`}>
            {mission.title}
          </h3>

          <div className={`flex items-center gap-4 text-sm ${
            isCompleted ? 'text-white/90' : 'text-gray-600'
          }`}>
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{mission.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4" />
              <span>{mission.points} points</span>
            </div>
          </div>

          {isLocked && mission.unlockRequirement && (
            <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4" />
              <span>{mission.unlockRequirement}</span>
            </div>
          )}
        </div>

        {/* Status Icon */}
        <div className="ml-4">
          {isCompleted ? (
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
          ) : isAvailable && isPremium ? (
            <Link
              to={`/games/${mission.game}`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Start
            </Link>
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <LockClosedIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
