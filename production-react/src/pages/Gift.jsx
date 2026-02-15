import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GiftIcon, ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline'
import { GIFT_OPTIONS } from '../config/stripe'
import { trackGiftPurchase, trackPageView } from '../utils/analytics'

export default function Gift() {
  const [selectedOption, setSelectedOption] = useState(GIFT_OPTIONS[1].id) // Default to 6 months (best value)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Track gift page view
  useEffect(() => {
    trackPageView('Gift Subscription')
  }, [])

  const handlePurchaseGift = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    // Validation
    if (!recipientEmail || !recipientName || !senderName) {
      setError('Please fill in all required fields')
      setIsProcessing(false)
      return
    }

    try {
      const selectedGift = GIFT_OPTIONS.find(opt => opt.id === selectedOption)

      // Track gift purchase attempt
      trackGiftPurchase(selectedGift.months, selectedGift.price)

      // Call our API endpoint to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedGift.stripePriceId,
          mode: 'payment', // One-time payment for gifts
          customerEmail: recipientEmail,
          // TODO: Store gift metadata (recipient, sender, message, delivery date)
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Gift purchase error:', err)
      setError(err.message || 'Failed to process gift purchase. Please try again.')
      setIsProcessing(false)
    }
  }

  const selectedGift = GIFT_OPTIONS.find(opt => opt.id === selectedOption)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/pricing" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Pricing</span>
            </Link>
            <div className="flex items-center gap-2">
              <GiftIcon className="w-8 h-8 text-pink-600" />
              <span className="text-xl font-bold text-gray-900">Gift Subscription</span>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mb-6">
            <GiftIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Give the Gift of Family Time
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Surprise a family with premium access to 8 interactive games and weekly new releases
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-800 text-center">⚠️ {error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Gift Options */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Gift Duration</h2>

            <div className="space-y-4 mb-8">
              {GIFT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                    selectedOption === option.id
                      ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-xl text-gray-900">{option.name}</div>
                      {option.popular && (
                        <div className="text-sm text-pink-600 font-medium">⭐ Best Value</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">${option.price}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(option.price / option.duration).toFixed(2)}/month
                  </div>
                </button>
              ))}
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-pink-600" />
                What's Included
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Full Premium access for {selectedGift?.duration} months</li>
                <li>✅ All 8 games unlocked</li>
                <li>✅ Unlimited AI generations</li>
                <li>✅ Weekly new games</li>
                <li>✅ Beautiful email delivery</li>
                <li>✅ Personalized gift card PDF</li>
              </ul>
            </div>
          </div>

          {/* Gift Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gift Details</h2>

            <form onSubmit={handlePurchaseGift} className="bg-white rounded-2xl p-6 border-2 border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Recipient's Name *
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Sarah Johnson"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Recipient's Email *
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Grandma Patty"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enjoy quality time with the kids! Love, Grandma"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to send immediately
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Purchase Gift - $${selectedGift?.price}`}
              </button>

              <p className="text-xs text-center text-gray-500">
                Secure checkout powered by Stripe
              </p>
            </form>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-3xl p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full text-pink-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Choose Your Gift</h3>
              <p className="text-gray-600 text-sm">
                Select 3, 6, or 12 months of Premium access
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full text-purple-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Add Personal Touch</h3>
              <p className="text-gray-600 text-sm">
                Include a message and choose when to deliver
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full text-pink-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">They Receive the Gift</h3>
              <p className="text-gray-600 text-sm">
                Beautiful email with redemption link and your message
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
