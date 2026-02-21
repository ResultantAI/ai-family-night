/**
 * Stripe Webhook Handler
 * Handles subscription events from Stripe and updates Supabase
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'AI Family Night <noreply@aifamilynight.com>'
const DASHBOARD_URL = 'https://www.aifamilynight.com'

// ─── Email Helper ────────────────────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email to', to)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to: [to], subject, html })
  } catch (err) {
    // Non-fatal — don't let an email failure break the webhook response
    console.error('Email send failed:', err.message)
  }
}

// ─── Email Templates ─────────────────────────────────────────────────────────

function paymentFailedEmail(name, amount, retryDays, updatePaymentUrl) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333}
    .container{max-width:600px;margin:0 auto;padding:20px}
    .header{background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:white;padding:40px 20px;text-align:center;border-radius:8px}
    .content{background:#f9fafb;padding:30px;border-radius:8px;margin-top:20px}
    .button{display:inline-block;background:#ef4444;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;margin:20px 0}
    .footer{text-align:center;color:#6b7280;font-size:14px;margin-top:30px}
  </style></head><body>
  <div class="container">
    <div class="header"><h1>⚠️ Payment Failed</h1></div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>We were unable to process your payment of <strong>$${(amount / 100).toFixed(2)}</strong> for AI Family Night Premium.</p>
      <p>Your card was declined. This can happen due to insufficient funds, an expired card, or your bank blocking the charge.</p>
      <p><strong>What to do:</strong></p>
      <ol>
        <li>Update your payment method using the button below</li>
        <li>Contact your bank if the issue persists</li>
        <li>We'll retry the payment automatically in ${retryDays} days</li>
      </ol>
      <center><a href="${updatePaymentUrl}" class="button">Update Payment Method</a></center>
      <p style="background:#fef2f2;padding:15px;border-radius:8px;border-left:4px solid #ef4444;margin-top:20px">
        <strong>⚠️ Important:</strong> If payment fails again, your account will be downgraded to the free plan after 7 days.
      </p>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email — we're here to help.</p>
      <p style="font-size:12px;color:#9ca3af">AI Family Night | Turn screen time into quality time</p>
    </div>
  </div></body></html>`
}

function paymentSucceededEmail(name, amount, plan, nextBillingDate, invoiceUrl) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333}
    .container{max-width:600px;margin:0 auto;padding:20px}
    .header{background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;padding:40px 20px;text-align:center;border-radius:8px}
    .content{background:#f9fafb;padding:30px;border-radius:8px;margin-top:20px}
    .receipt{background:white;padding:20px;border-radius:8px;margin:20px 0}
    .receipt-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}
    .footer{text-align:center;color:#6b7280;font-size:14px;margin-top:30px}
  </style></head><body>
  <div class="container">
    <div class="header"><h1>✅ Payment Received!</h1></div>
    <div class="content">
      <h2>Thank you, ${name}!</h2>
      <p>Your payment has been successfully processed.</p>
      <div class="receipt">
        <h3>📄 Receipt</h3>
        <div class="receipt-row"><span>Plan</span><span><strong>${plan}</strong></span></div>
        <div class="receipt-row"><span>Amount</span><span><strong>$${(amount / 100).toFixed(2)}</strong></span></div>
        <div class="receipt-row"><span>Next billing</span><span>${new Date(nextBillingDate * 1000).toLocaleDateString()}</span></div>
        ${invoiceUrl ? `<div class="receipt-row" style="border-bottom:none"><span>Invoice</span><span><a href="${invoiceUrl}">Download PDF</a></span></div>` : ''}
      </div>
      <p>Your Premium access continues — enjoy all 8 games with your family!</p>
    </div>
    <div class="footer">
      <p>Manage your subscription anytime in <a href="${DASHBOARD_URL}/settings">Settings</a></p>
      <p style="font-size:12px;color:#9ca3af">AI Family Night | Turn screen time into quality time</p>
    </div>
  </div></body></html>`
}

function trialEndingEmail(name, daysLeft, trialEnd, price) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333}
    .container{max-width:600px;margin:0 auto;padding:20px}
    .header{background:linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%);color:white;padding:40px 20px;text-align:center;border-radius:8px}
    .content{background:#f9fafb;padding:30px;border-radius:8px;margin-top:20px}
    .button{display:inline-block;background:#667eea;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;margin:20px 0}
    .footer{text-align:center;color:#6b7280;font-size:14px;margin-top:30px}
  </style></head><body>
  <div class="container">
    <div class="header"><h1>⏰ Trial Ending in ${daysLeft} Days</h1></div>
    <div class="content">
      <h2>Hi ${name}!</h2>
      <p>Your 7-day free trial ends in <strong>${daysLeft} days</strong> (${new Date(trialEnd * 1000).toLocaleDateString()}).</p>
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>✅ <strong>Keep Premium:</strong> Your card will be charged $${price} on ${new Date(trialEnd * 1000).toLocaleDateString()}</li>
        <li>❌ <strong>Cancel anytime:</strong> Switch to the free plan (3 games) — no charge</li>
      </ul>
      <center><a href="${DASHBOARD_URL}/settings" class="button">Manage Subscription</a></center>
      <p style="background:#fef3c7;padding:15px;border-radius:8px;border-left:4px solid #f59e0b;margin-top:20px">
        <strong>💡 Save 34%:</strong> Switch to our yearly plan for just $79/year ($6.58/month) in Settings!
      </p>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email — we're happy to help.</p>
      <p style="font-size:12px;color:#9ca3af">AI Family Night | Turn screen time into quality time</p>
    </div>
  </div></body></html>`
}

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
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
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

async function handleTrialWillEnd(subscription) {
  // Stripe fires this 3 days before trial_end
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email = customer.email
  const name = customer.name || email.split('@')[0]

  const daysLeft = Math.ceil((subscription.trial_end - Date.now() / 1000) / 86400)
  const priceData = subscription.items.data[0]?.price
  const amount = priceData ? (priceData.unit_amount / 100).toFixed(2) : '9.99'

  await sendEmail(
    email,
    `Your AI Family Night trial ends in ${daysLeft} days`,
    trialEndingEmail(name, daysLeft, subscription.trial_end, amount)
  )
}

async function handlePaymentFailed(invoice) {
  if (!invoice.customer_email && !invoice.customer) return

  let email = invoice.customer_email
  let name = email?.split('@')[0] || 'there'

  if (!email && invoice.customer) {
    const customer = await stripe.customers.retrieve(invoice.customer)
    email = customer.email
    name = customer.name || email.split('@')[0]
  }

  if (!email) return

  // Stripe portal link so they can update their card
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: invoice.customer,
    return_url: `${DASHBOARD_URL}/settings`,
  }).catch(() => null)

  const updatePaymentUrl = portalSession?.url || `${DASHBOARD_URL}/settings`
  const retryDays = invoice.next_payment_attempt
    ? Math.ceil((invoice.next_payment_attempt - Date.now() / 1000) / 86400)
    : 3

  await sendEmail(
    email,
    'Payment failed — action required',
    paymentFailedEmail(name, invoice.amount_due, retryDays, updatePaymentUrl)
  )
}

async function handlePaymentSucceeded(invoice) {
  // Skip $0 invoices (trial starts, etc.)
  if (!invoice.amount_paid || invoice.amount_paid === 0) return
  // Skip if this is the first payment on a trial (trial conversion is a separate flow)
  if (invoice.billing_reason === 'subscription_create') return

  let email = invoice.customer_email
  let name = email?.split('@')[0] || 'there'

  if (!email && invoice.customer) {
    const customer = await stripe.customers.retrieve(invoice.customer)
    email = customer.email
    name = customer.name || email.split('@')[0]
  }

  if (!email) return

  const lineItem = invoice.lines?.data?.[0]
  const plan = lineItem?.description || 'Premium'
  const nextBillingDate = invoice.period_end

  await sendEmail(
    email,
    'Payment received — AI Family Night Premium',
    paymentSucceededEmail(name, invoice.amount_paid, plan, nextBillingDate, invoice.hosted_invoice_url)
  )
}

export const config = {
  api: { bodyParser: false }
}
