import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { setUserTier } from '../config/stripe'
import { trackTrialStarted, trackCheckoutCompleted, trackSubscription } from '../utils/analytics'

export default function Success() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setIsLoading(false)
        setError('No session ID provided')
        return
      }

      try {
        // Verify session with backend
        const response = await fetch(`/api/verify-session?sessionId=${sessionId}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Session verification failed')
        }

        // Store session data
        setSessionData(data)

        // Determine tier based on subscription
        const tier = 'premium_monthly' // Default
        const billingInterval = 'monthly'
        const amount = data.amount || 9.99

        setUserTier(tier)

        // Track successful checkout completion
        trackTrialStarted(tier)
        trackCheckoutCompleted(tier, billingInterval, amount)
        trackSubscription(tier, billingInterval)

        setIsLoading(false)
      } catch (err) {
        console.error('Error verifying session:', err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    verifySession()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-red-200 p-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full mb-6">
              <span className="text-4xl text-white">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-8">
              {error || 'Unable to verify your subscription. Please contact support.'}
            </p>
            <Link
              to="/pricing"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-8 rounded-xl font-semibold transition-all"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full mb-6">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Premium! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Your 7-day free trial has started. You now have access to all 8 games!
          </p>
          {sessionData.customerEmail && (
            <p className="text-sm text-gray-500 mb-8">
              Confirmation sent to {sessionData.customerEmail}
            </p>
          )}
          {sessionData.trialEnd && (
            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-lg mb-8">
              <strong>Trial ends:</strong> {sessionData.trialEnd}
            </div>
          )}

          {/* What's Next */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
              What's Next?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">1.</span>
                <span>Play all 8 games - AI-powered content now unlocked!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">2.</span>
                <span>Get a new game every Sunday (52 games/year)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>Enable Extra Safe Mode in Settings for younger kids</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">4.</span>
                <span>We'll email you 3 days before your trial ends (no surprise charges!)</span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/dashboard"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-semibold transition-all"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/settings"
              className="flex-1 border-2 border-purple-300 hover:border-purple-500 text-purple-600 py-4 px-6 rounded-xl font-semibold transition-all"
            >
              Manage Subscription
            </Link>
          </div>

          {/* Trial Reminder */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Reminder:</strong> Your trial lasts 7 days. You can cancel anytime from Settings → Billing.
              We'll send you an email reminder before charging your card.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
