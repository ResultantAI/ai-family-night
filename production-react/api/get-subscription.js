/**
 * Get Subscription Details from Stripe
 * Fetches subscription info including next billing date and payment method
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' })
  }

  try {
    // Get subscription from Supabase
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, customers(stripe_customer_id)')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) {
      return res.status(404).json({ error: 'No subscription found' })
    }

    // If there's a Stripe subscription ID, fetch full details from Stripe
    if (subscription.stripe_subscription_id) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id,
        {
          expand: ['default_payment_method', 'latest_invoice']
        }
      )

      const paymentMethod = stripeSubscription.default_payment_method

      return res.status(200).json({
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        nextBillingDate: new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        amount: (stripeSubscription.items.data[0].price.unit_amount / 100).toFixed(2),
        interval: stripeSubscription.items.data[0].price.recurring.interval,
        paymentMethod: paymentMethod ? {
          type: paymentMethod.type,
          last4: paymentMethod.card?.last4 || paymentMethod.us_bank_account?.last4,
          brand: paymentMethod.card?.brand,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year
        } : null,
        customerId: subscription.customers?.stripe_customer_id
      })
    }

    // Return basic subscription data if no Stripe subscription
    return res.status(200).json({
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: false,
      nextBillingDate: subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) : null,
      amount: '9.99',
      interval: 'month',
      paymentMethod: null,
      customerId: subscription.customers?.stripe_customer_id
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).json({ error: error.message })
  }
}
