/**
 * Verify Stripe Checkout Session
 * Confirms payment succeeded and returns subscription details
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId } = req.query

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' })
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      })
    }

    // Get subscription details
    const subscription = session.subscription

    return res.status(200).json({
      success: true,
      customerEmail: session.customer_details?.email || session.customer?.email,
      subscriptionId: typeof subscription === 'string' ? subscription : subscription?.id,
      amount: session.amount_total / 100,
      currency: session.currency,
      status: session.status,
      trialEnd: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toLocaleDateString() : null
    })
  } catch (error) {
    console.error('Error verifying session:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
