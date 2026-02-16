import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GiftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Referrals() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [referrals, setReferrals] = useState([])
  const [rewards, setRewards] = useState({
    totalReferrals: 0,
    paidReferrals: 0,
    freeMonthsEarned: 0,
    freeMonthsRemaining: 0
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        navigate('/login')
        return
      }

      setUser(authUser)

      // Generate or fetch referral code
      const code = generateReferralCode(authUser.id)
      setReferralCode(code)

      // Fetch referral stats
      await fetchReferralStats(authUser.id)

      setLoading(false)
    }

    fetchData()
  }, [navigate])

  const generateReferralCode = (userId) => {
    // Create a unique code from user ID
    // In production, store this in database
    const hash = userId.substring(0, 8).toUpperCase()
    return `FAMILY${hash}`
  }

  const fetchReferralStats = async (userId) => {
    try {
      // Fetch from API endpoint
      const response = await fetch(`/api/get-referrals?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals || [])
        setRewards(data.rewards || rewards)
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
    }
  }

  const copyReferralLink = () => {
    const link = `https://www.aifamilynight.com/signup?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaEmail = () => {
    const link = `https://www.aifamilynight.com/signup?ref=${referralCode}`
    const subject = encodeURIComponent('Join AI Family Night - Fun Games for Families!')
    const body = encodeURIComponent(
      `Hey! I've been using AI Family Night with my kids and we love it!\n\n` +
      `It's got amazing AI-powered games that create quality family time.\n\n` +
      `Sign up using my link and we both get rewards:\n${link}\n\n` +
      `You'll get a special discount, and I get closer to earning free months!\n\n` +
      `Trust me, your family will love it! 🎮❤️`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const shareViaSocial = (platform) => {
    const link = `https://www.aifamilynight.com/signup?ref=${referralCode}`
    const text = encodeURIComponent('Check out AI Family Night - amazing games for families! Sign up with my link:')

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const progressToNextReward = Math.min((rewards.paidReferrals % 3) / 3 * 100, 100)
  const nextRewardAt = Math.ceil(rewards.paidReferrals / 3) * 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <Logo className="w-8 h-8" textClassName="text-lg" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <GiftIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Refer Friends, Get Free Months!
          </h1>
          <p className="text-xl text-gray-600">
            Share AI Family Night and earn 3 free months for every 3 paying friends
          </p>
        </div>

        {/* Rewards Progress */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-xl border-2 border-purple-200 p-8 mb-8 text-white">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{rewards.totalReferrals}</div>
              <div className="text-purple-100">Total Referrals</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{rewards.paidReferrals}</div>
              <div className="text-purple-100">Paid Referrals</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{rewards.freeMonthsEarned}</div>
              <div className="text-purple-100">Free Months Earned</div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Progress to Next Reward</span>
              <span className="font-bold">{rewards.paidReferrals % 3} / 3</span>
            </div>
            <div className="bg-white/30 rounded-full h-4 overflow-hidden">
              <div
                className="bg-white h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressToNextReward}%` }}
              />
            </div>
            <p className="text-sm text-purple-100 mt-3 text-center">
              {3 - (rewards.paidReferrals % 3)} more paid referrals until you earn 3 free months!
            </p>
          </div>
        </div>

        {/* Share Your Link */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-purple-500" />
            Share Your Referral Link
          </h2>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Unique Referral Code
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={`https://www.aifamilynight.com/signup?ref=${referralCode}`}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-lg bg-white font-mono text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={shareViaEmail}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-4 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Share via Email
            </button>

            <button
              onClick={() => shareViaSocial('facebook')}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            <button
              onClick={() => shareViaSocial('twitter')}
              className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>

            <button
              onClick={() => shareViaSocial('linkedin')}
              className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-600">
                Send your unique referral link to friends and family
              </p>
            </div>

            <div className="text-center p-6 bg-pink-50 rounded-xl border-2 border-pink-200">
              <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">They Sign Up</h3>
              <p className="text-sm text-gray-600">
                Your friends get a discount when they subscribe using your link
              </p>
            </div>

            <div className="text-center p-6 bg-rose-50 rounded-xl border-2 border-rose-200">
              <div className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">You Get Rewarded</h3>
              <p className="text-sm text-gray-600">
                Earn 3 free months for every 3 friends who become paid subscribers
              </p>
            </div>
          </div>
        </div>

        {/* Referral List */}
        {referrals.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserGroupIcon className="w-7 h-7 text-purple-500" />
              Your Referrals
            </h2>

            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {referral.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {referral.name || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(referral.signupDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    referral.isPaid
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {referral.isPaid ? 'Paid ✓' : 'Free Trial'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
