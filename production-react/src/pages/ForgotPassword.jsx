import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setEmailSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <Logo className="w-8 h-8" textClassName="text-lg" />
            </Link>
            <div className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {!emailSent ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
                <p className="mt-2 text-gray-600">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
                  </button>
                </form>
              </div>

              <p className="mt-8 text-center text-sm text-gray-600">
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                  ← Back to login
                </Link>
              </p>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600 mb-6">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
