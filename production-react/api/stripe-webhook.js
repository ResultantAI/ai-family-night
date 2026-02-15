/**
 * Stripe Webhook Handler
 * Handles subscription events from Stripe and updates Supabase
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

async function handleCheckoutCompleted(session) {
  const customerId = session.customer
  const subscriptionId = session.subscription
  const customer = await stripe.customers.retrieve(customerId)
  const email = customer.email

  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)

  if (!user) return

  await supabase.from('customers').upsert({
    user_id: user.id,
    stripe_customer_id: customerId,
    email: email
  }, { onConflict: 'user_id' })

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    await updateSubscription(user.id, subscription)
  }
}

async function handleSubscriptionUpdate(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer)
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users.users.find(u => u.email === customer.email)
  if (user) await updateSubscription(user.id, subscription)
}

async function updateSubscription(userId, subscription) {
  const priceId = subscription.items.data[0].price.id
  let tier = 'free'
  if (priceId === process.env.VITE_STRIPE_PRICE_MONTHLY) tier = 'premium_monthly'
  else if (priceId === process.env.VITE_STRIPE_PRICE_YEARLY) tier = 'premium_yearly'

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    tier: tier,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
  }, { onConflict: 'user_id' })
}

async function handleSubscriptionDeleted(subscription) {
  await supabase.from('subscriptions')
    .update({ status: 'canceled', canceled_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id)
}

export const config = {
  api: { bodyParser: false }
}
