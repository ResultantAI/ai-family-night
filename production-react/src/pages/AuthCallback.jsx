import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // It exchanges the code for a session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          // Redirect to login after 3 seconds
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (session) {
          // Successfully authenticated
          console.log('User authenticated:', session.user.email)

          // TODO: Create or update user subscription in database
          // For now, set premium tier in localStorage (temporary)
          localStorage.setItem('subscription_tier', 'free')

          // Check if user has completed onboarding
          const hasCompletedOnboarding = session.user.user_metadata?.onboarding_completed

          // Redirect to onboarding if not completed, otherwise to intended destination
          if (!hasCompletedOnboarding && redirectTo === '/dashboard') {
            navigate('/onboarding')
          } else {
            navigate(redirectTo)
          }
        } else {
          setError('No session found')
          setTimeout(() => navigate('/login'), 3000)
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        setError('An unexpected error occurred')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleCallback()
  }, [navigate, redirectTo])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 animate-pulse">
          <SparklesIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In</h1>
        <p className="text-gray-600 mb-4">Please wait while we log you in...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  )
}
