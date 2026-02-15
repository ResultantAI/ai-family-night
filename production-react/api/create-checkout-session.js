/**
 * Vercel Serverless Function: Create Stripe Checkout Session
 * Endpoint: /api/create-checkout-session
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, mode = 'subscription', successUrl, cancelUrl, customerEmail } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode, // 'subscription' or 'payment' (for one-time purchases like gifts)
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      success_url: successUrl || `${req.headers.origin || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:5173'}/pricing`,
      // Allow promo codes
      allow_promotion_codes: true,
      // Subscription-specific options
      ...(mode === 'subscription' && {
        subscription_data: {
          trial_period_days: 7, // 7-day free trial
        },
      }),
    })

    res.status(200).json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    res.status(500).json({ error: error.message })
  }
}
