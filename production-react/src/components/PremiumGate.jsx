import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LockClosedIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { trackPremiumGateView, trackPremiumGateCTA } from '../utils/analytics'

/**
 * Premium Gate Component
 * Shows a paywall for premium-only games
 */
export default function PremiumGate({ gameName, gameId }) {
  // Track when user hits the premium gate (critical conversion funnel metric)
  useEffect(() => {
    trackPremiumGateView(gameId || gameName.toLowerCase().replace(/\s+/g, '-'), gameName)
  }, [gameName, gameId])
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border-2 border-purple-200 p-8 md:p-12 text-center">
        {/* Lock Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-6">
          <LockClosedIcon className="w-10 h-10 text-white" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {gameName} is a Premium Game
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Unlock all 8 games with a Premium subscription
        </p>

        {/* Premium Benefits */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            What You Get with Premium
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <StarIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span><strong>All 8 games unlocked</strong> - Including AI-powered games like {gameName}</span>
            </li>
            <li className="flex items-start gap-2">
              <StarIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span><strong>Unlimited AI generations</strong> - Create unique content every time</span>
            </li>
            <li className="flex items-start gap-2">
              <StarIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span><strong>Weekly new games</strong> - 52 games per year</span>
            </li>
            <li className="flex items-start gap-2">
              <StarIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span><strong>Extra Safe Mode</strong> - Perfect for younger kids</span>
            </li>
            <li className="flex items-start gap-2">
              <StarIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span><strong>Gallery saves</strong> - Keep all your family's creations</span>
            </li>
          </ul>
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-600">/month</span>
          </div>
          <p className="text-sm text-gray-600">
            or <strong>$59/year</strong> (save 50%)
          </p>
          <p className="text-purple-600 font-semibold mt-2">
            7-day free trial • No credit card required
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link
            to="/pricing"
            onClick={() => trackPremiumGateCTA(gameId || gameName.toLowerCase().replace(/\s+/g, '-'), 'trial')}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2"
          >
            <StarIcon className="w-5 h-5" />
            Start Free Trial
          </Link>
          <Link
            to="/dashboard"
            onClick={() => trackPremiumGateCTA(gameId || gameName.toLowerCase().replace(/\s+/g, '-'), 'back_to_dashboard')}
            className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white"></div>
            ))}
          </div>
          <p>Join 1,200+ families already playing</p>
        </div>
      </div>
    </div>
  )
}
