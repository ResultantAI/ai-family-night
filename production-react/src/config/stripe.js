/**
 * Stripe Pricing Configuration
 * Based on PRICING-TIERS-STRATEGY.md
 */

export const STRIPE_CONFIG = {
  // You'll need to add your Stripe publishable key here
  // Get it from: https://dashboard.stripe.com/apikeys
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
}

/**
 * Pricing tiers configuration
 * These match the products/prices you'll create in Stripe Dashboard
 */
export const PRICING_TIERS = {
  free: {
    id: 'free',
    name: 'Free Forever',
    price: 0,
    interval: null,
    features: [
      '3 games permanently free',
      'Print and save creations',
      'Mobile-friendly',
      'Content moderation',
      'Voice input on free games',
    ],
    limitations: [
      'No AI-powered games',
      'Limited to 10 plays per month',
      'No gallery saves',
      'No weekly new games',
    ],
    cta: 'Get Started Free',
    popular: false,
  },

  monthly: {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month',
    // You'll create this in Stripe Dashboard and add the price ID here
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
    features: [
      'All 8 games unlocked',
      'Unlimited AI generations',
      'Voice input on all games',
      'Extra Safe Mode',
      'Gallery saves unlimited',
      'Weekly new games (52/year)',
      'Early access to features',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },

  yearly: {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 59.99,
    pricePerMonth: 5.00,
    interval: 'year',
    savings: '50%',
    // You'll create this in Stripe Dashboard and add the price ID here
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_yearly_placeholder',
    features: [
      'All 8 games unlocked',
      'Unlimited AI generations',
      'Voice input on all games',
      'Extra Safe Mode',
      'Gallery saves unlimited',
      'Weekly new games (52/year)',
      'Early access to features',
      'Priority support',
      '"Founding Family" badge',
      'Vote on next game ideas',
      'Exclusive seasonal packs',
    ],
    cta: 'Save 50%',
    popular: false,
    badge: 'BEST VALUE',
  },
}

/**
 * Gift subscription options
 */
export const GIFT_OPTIONS = [
  {
    id: 'gift_3_months',
    duration: 3,
    name: '3 Months',
    price: 25,
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_GIFT_3 || 'price_gift_3_placeholder',
  },
  {
    id: 'gift_6_months',
    duration: 6,
    name: '6 Months',
    price: 45,
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_GIFT_6 || 'price_gift_6_placeholder',
    popular: true,
  },
  {
    id: 'gift_12_months',
    duration: 12,
    name: '12 Months',
    price: 59.99,
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_GIFT_12 || 'price_gift_12_placeholder',
  },
]

/**
 * Free tier game IDs
 */
export const FREE_GAMES = [
  'comic-maker',
  'character-quiz',
  'treehouse-designer',
]

/**
 * Premium-only game IDs
 */
export const PREMIUM_GAMES = [
  'superhero-origin',
  'family-movie-magic',
  'noisy-storybook',
  'ai-roast-battle',
  'restaurant-menu',
]

/**
 * Check if a user has access to a specific game
 */
export function hasGameAccess(gameId, userTier = 'free') {
  if (userTier === 'premium_monthly' || userTier === 'premium_yearly') {
    return true
  }
  return FREE_GAMES.includes(gameId)
}

/**
 * Get user's subscription tier from localStorage (temporary - will use real auth later)
 */
export function getUserTier() {
  return localStorage.getItem('subscription_tier') || 'free'
}

/**
 * Set user's subscription tier
 */
export function setUserTier(tier) {
  localStorage.setItem('subscription_tier', tier)
}

/**
 * Check if user has premium access
 * Checks both localStorage (for immediate feedback) and will be supplemented by Supabase check
 */
export function isPremiumUser() {
  const tier = getUserTier()
  return tier === 'premium_monthly' || tier === 'premium_yearly' || tier === 'premium'
}

/**
 * Check premium status from Supabase database
 * Returns a Promise that resolves to boolean
 */
export async function checkPremiumStatus() {
  try {
    const { supabase } = await import('../lib/supabase')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .single()

    if (!subscription) return false

    // Check if subscription is active or trialing
    const isActive = subscription.status === 'active' || subscription.status === 'trialing'

    // Check if not expired
    const notExpired = !subscription.current_period_end ||
                      new Date(subscription.current_period_end) > new Date()

    // Check if premium tier
    const isPremium = subscription.tier === 'premium_monthly' ||
                     subscription.tier === 'premium_yearly'

    return isActive && notExpired && isPremium
  } catch (error) {
    console.error('Error checking premium status:', error)
    return false
  }
}
