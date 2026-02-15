/**
 * Vercel Serverless Function: Create Stripe Customer Portal Session
 * Endpoint: /api/create-portal-session
 *
 * Allows customers to manage their subscriptions, update payment methods, etc.
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customerId, returnUrl } = req.body

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' })
    }

    // Create Stripe Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin || 'http://localhost:5173'}/settings`,
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    res.status(500).json({ error: error.message })
  }
}
