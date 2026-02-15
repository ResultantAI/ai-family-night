import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000)
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (password.length < 8) return { text: 'Too short', color: 'text-red-600', bg: 'bg-red-100' }
    if (password.length < 12) return { text: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { text: 'Strong', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <Logo className="w-8 h-8" textClassName="text-lg" />
            </Link>
          </div>
        </div>
      </header>

      {/* Reset Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Set new password</h1>
                <p className="mt-2 text-gray-600">
                  Choose a strong password for your account
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
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      New password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    {strength && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${strength.bg} ${strength.color}`}>
                          {strength.text}
                        </span>
                        <span className="text-xs text-gray-500">
                          {password.length < 8 && 'Use at least 8 characters'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {loading ? 'Updating...' : 'Update password'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated!</h2>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully updated.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
