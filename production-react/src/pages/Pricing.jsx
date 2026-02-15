import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  GiftIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { PRICING_TIERS, GIFT_OPTIONS } from '../config/stripe'
import { trackCheckoutStarted, trackPageView } from '../utils/analytics'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('yearly') // Default to yearly (better value)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Track pricing page view
  useEffect(() => {
    trackPageView('Pricing')
  }, [])

  const handleSubscribe = async (priceId) => {
    setIsProcessing(true)
    setError(null)

    // Track checkout started
    const tier = billingCycle === 'monthly' ? 'premium_monthly' : 'premium_yearly'
    trackCheckoutStarted(tier, billingCycle)

    try {
      // Call our API endpoint to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to start checkout. Please try again.')
      setIsProcessing(false)
    }
  }

  const currentTier = billingCycle === 'monthly' ? PRICING_TIERS.monthly : PRICING_TIERS.yearly

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">AI Family Night</span>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            7-day free trial. Cancel anytime. No credit card required to start.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly <span className="text-green-600 text-sm ml-1">(Save 50%)</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-800 text-center">⚠️ {error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Tier */}
          <PricingCard
            tier={PRICING_TIERS.free}
            onSelect={() => window.location.href = '/signup'}
            isProcessing={isProcessing}
          />

          {/* Premium Tier (Monthly or Yearly) */}
          <PricingCard
            tier={currentTier}
            onSelect={() => handleSubscribe(currentTier.stripePriceId)}
            isProcessing={isProcessing}
            highlighted
          />

          {/* Gift Card */}
          <GiftCard />
        </div>

        {/* Social Proof */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white"></div>
              ))}
            </div>
            <p className="text-gray-600 font-medium">Join 1,200+ families</p>
          </div>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="ml-2 text-gray-600">4.9/5 from focus group testing</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQ
              question="How does the free trial work?"
              answer="Sign up and get 7 days of Premium access with no credit card required. After the trial, you'll be downgraded to the free plan (3 games) unless you subscribe."
            />
            <FAQ
              question="Can I cancel anytime?"
              answer="Yes! Cancel your subscription at any time from your account settings. You'll keep Premium access until the end of your billing period, then automatically switch to the free plan."
            />
            <FAQ
              question="What's included in the free plan?"
              answer="The free plan includes 3 games permanently (Comic Maker, Character Quiz, Treehouse Designer) with up to 10 plays per month. Upgrade to Premium for all 8 games with unlimited plays and AI features."
            />
            <FAQ
              question="How do gift subscriptions work?"
              answer="Purchase a gift subscription (3, 6, or 12 months), and we'll email a beautiful gift card to your recipient. They can redeem it instantly and start playing!"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Pricing Card Component
function PricingCard({ tier, onSelect, isProcessing, highlighted = false }) {
  const isFreeTier = tier.id === 'free'

  return (
    <div className={`rounded-2xl p-8 relative ${
      highlighted
        ? 'border-2 border-purple-600 bg-gradient-to-b from-purple-50 to-white shadow-xl'
        : 'border-2 border-gray-200 bg-white'
    }`}>
      {tier.badge && (
        <div className="absolute top-0 right-6 transform -translate-y-1/2">
          <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-gray-900">
            ${tier.price}
          </span>
          {tier.interval && (
            <span className="text-gray-600">/{tier.interval}</span>
          )}
        </div>
        {tier.pricePerMonth && tier.pricePerMonth !== tier.price && (
          <p className="text-sm text-gray-600 mt-1">
            Just ${tier.pricePerMonth}/month
          </p>
        )}
        {tier.savings && (
          <p className="text-sm text-green-600 font-semibold mt-1">
            Save {tier.savings}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
        {tier.limitations && tier.limitations.map((limitation, i) => (
          <li key={`limit-${i}`} className="flex items-start gap-2">
            <XCircleIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-400">{limitation}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isProcessing && !isFreeTier}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          highlighted
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing && !isFreeTier ? 'Processing...' : tier.cta}
      </button>

      {!isFreeTier && (
        <p className="text-xs text-center text-gray-500 mt-3">
          7-day free trial • No credit card required
        </p>
      )}
    </div>
  )
}

// Gift Card Component
function GiftCard() {
  return (
    <div className="border-2 border-pink-200 bg-gradient-to-b from-pink-50 to-white rounded-2xl p-8">
      <div className="text-center mb-6">
        <GiftIcon className="w-12 h-12 text-pink-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Gift Subscription</h3>
        <p className="text-sm text-gray-600">
          Give the gift of family time
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {GIFT_OPTIONS.map((option) => (
          <div
            key={option.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              option.popular
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-pink-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{option.name}</div>
                {option.popular && (
                  <div className="text-xs text-pink-600 font-medium">Best Value</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${option.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/gift"
        className="w-full py-3 px-6 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all block text-center"
      >
        Buy as Gift
      </Link>

      <p className="text-xs text-center text-gray-500 mt-3">
        Email delivery • Personalized gift card
      </p>
    </div>
  )
}

// FAQ Component
function FAQ({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span className="text-gray-400">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  )
}
