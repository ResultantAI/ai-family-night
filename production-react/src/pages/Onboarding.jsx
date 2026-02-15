import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { startTrialEmailSequence } from '../lib/notifications'
import Logo from '../components/Logo'

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    parentGoal: '',
    interests: []
  })

  const parentGoals = [
    { id: 'reading', label: 'Build stronger reading skills', icon: '📚' },
    { id: 'family-time', label: 'Make family time more meaningful', icon: '❤️' },
    { id: 'screen-time', label: 'Productive screen time when I\'m busy', icon: '⏰' },
    { id: 'creativity', label: 'Foster creativity and confidence', icon: '🎨' },
  ]

  const interests = [
    { id: 'space', label: 'Space & Science', icon: '🚀' },
    { id: 'animals', label: 'Animals & Nature', icon: '🦁' },
    { id: 'art', label: 'Art & Creativity', icon: '🎨' },
    { id: 'stories', label: 'Stories & Reading', icon: '📖' },
    { id: 'math', label: 'Math & Puzzles', icon: '🧮' },
    { id: 'history', label: 'History & Culture', icon: '🏛️' },
    { id: 'sports', label: 'Sports & Games', icon: '⚽' },
    { id: 'technology', label: 'Technology & Coding', icon: '💻' },
  ]

  const handleGoalSelect = (goalId) => {
    setFormData({ ...formData, parentGoal: goalId })
  }

  const handleInterestToggle = (interestId) => {
    const current = formData.interests
    if (current.includes(interestId)) {
      setFormData({ ...formData, interests: current.filter(i => i !== interestId) })
    } else {
      setFormData({ ...formData, interests: [...current, interestId] })
    }
  }

  const handleComplete = async () => {
    // Save onboarding data to Supabase user metadata AND children table
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const trialStartDate = new Date().toISOString()

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          parent_goal: formData.parentGoal,
          trial_start_date: trialStartDate
        }
      })

      // Create child profile in database
      const { error: childError } = await supabase
        .from('children')
        .insert({
          user_id: user.id,
          name: formData.childName,
          age: parseInt(formData.childAge),
          interests: formData.interests
        })

      if (childError) {
        console.error('Error creating child profile:', childError)
      }

      // Start the trial email sequence
      await startTrialEmailSequence(user.id, {
        child_name: formData.childName,
        parent_goal: formData.parentGoal,
        interests: formData.interests,
        trial_start_date: trialStartDate
      })
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo className="w-8 h-8" textClassName="text-lg" />
            <div className="text-sm text-gray-600">
              Step {step} of 3
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8">
            <div className="text-center mb-8">
              <SparklesIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to AI Family Night!
              </h1>
              <p className="text-gray-600">
                Let's personalize your experience in just 3 quick steps
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What's your child's first name?
                </label>
                <input
                  type="text"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Alex"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How old is your child?
                </label>
                <select
                  value={formData.childAge}
                  onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select age</option>
                  {[5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                    <option key={age} value={age}>{age} years old</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.childName || !formData.childAge}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What matters most to you right now?
              </h2>
              <p className="text-gray-600">
                We'll personalize {formData.childName}'s experience to help achieve your goals
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {parentGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                    formData.parentGoal === goal.id
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{goal.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{goal.label}</div>
                    </div>
                    {formData.parentGoal === goal.id && (
                      <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.parentGoal}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What does {formData.childName} love?
              </h2>
              <p className="text-gray-600">
                Select all that apply - we'll recommend the best games to start with
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.interests.includes(interest.id)
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-4xl block mb-2">{interest.icon}</span>
                    <div className="font-semibold text-gray-900 text-sm">{interest.label}</div>
                  </div>
                  {formData.interests.includes(interest.id) && (
                    <CheckCircleIcon className="w-5 h-5 text-purple-600 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>

            {/* Trust & Safety Message */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Safe, High-Quality Screen Time</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✅ No ads. No in-app purchases. Just kid-safe learning.</li>
                    <li>✅ Expert-designed activities for ages 5-12</li>
                    <li>✅ Parent controls & time limits built-in</li>
                    <li>✅ 7-day free trial - cancel anytime</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={formData.interests.length === 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-xl font-semibold transition-all"
              >
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Trust Signals */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            💡 <strong>Your 7-day trial starts today.</strong> We'll remind you before it ends.
          </p>
          <p>
            No surprise charges. Cancel anytime from Settings.
          </p>
        </div>
      </div>
    </div>
  )
}
