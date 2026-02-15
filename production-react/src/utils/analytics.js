/**
 * Plausible Analytics Event Tracking
 *
 * Privacy-first analytics for conversion tracking.
 *
 * Setup:
 * 1. Create account at https://plausible.io
 * 2. Add your domain (aifamilynight.com)
 * 3. Update data-domain in index.html if different
 * 4. No cookies, no personal data collection
 */

/**
 * Track custom event in Plausible
 * @param {string} eventName - Event name (e.g., 'Signup', 'Trial Started')
 * @param {object} props - Additional properties (optional)
 */
export function trackEvent(eventName, props = {}) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props })
  } else {
    console.log('[Analytics]', eventName, props)
  }
}

/**
 * Conversion Funnel Events
 */

// User Authentication Events
export function trackSignup(method = 'email') {
  trackEvent('Signup', { method })
}

export function trackLogin() {
  trackEvent('Login')
}

// Subscription Events
export function trackTrialStarted(tier) {
  trackEvent('Trial Started', { tier })
}

export function trackSubscription(tier, billingInterval) {
  trackEvent('Subscription', {
    tier,
    interval: billingInterval,
    value: billingInterval === 'monthly' ? 9.99 : 59
  })
}

export function trackTierUpgrade(fromTier, toTier) {
  trackEvent('Tier Upgrade', {
    from: fromTier,
    to: toTier
  })
}

export function trackCancellation(tier, reason = '') {
  trackEvent('Cancellation', { tier, reason })
}

// Gift Subscription Events
export function trackGiftPurchase(months, amount) {
  trackEvent('Gift Purchase', {
    duration_months: months,
    value: amount
  })
}

export function trackGiftRedemption() {
  trackEvent('Gift Redemption')
}

// Game Play Events
export function trackGamePlayed(gameId, gameName, userTier) {
  trackEvent('Game Played', {
    game_id: gameId,
    game_name: gameName,
    user_tier: userTier
  })
}

export function trackGameCompleted(gameId, gameName, duration) {
  trackEvent('Game Completed', {
    game_id: gameId,
    game_name: gameName,
    duration_seconds: duration
  })
}

// Premium Gate Events (Conversion Tracking)
export function trackPremiumGateView(gameId, gameName) {
  trackEvent('Premium Gate Viewed', {
    game_id: gameId,
    game_name: gameName
  })
}

export function trackPremiumGateCTA(gameId, ctaType) {
  trackEvent('Premium Gate CTA', {
    game_id: gameId,
    cta_type: ctaType // 'trial', 'pricing_page', 'learn_more'
  })
}

// Checkout Events
export function trackCheckoutStarted(tier, billingInterval) {
  trackEvent('Checkout Started', {
    tier,
    interval: billingInterval
  })
}

export function trackCheckoutCompleted(tier, billingInterval, amount) {
  trackEvent('Checkout Completed', {
    tier,
    interval: billingInterval,
    value: amount
  })
}

export function trackCheckoutAbandoned(tier, step) {
  trackEvent('Checkout Abandoned', {
    tier,
    step // 'payment_form', 'card_declined', etc.
  })
}

// Voice Feature Usage
export function trackVoiceInputUsed(gameId) {
  trackEvent('Voice Input Used', { game_id: gameId })
}

export function trackVoiceInputError(gameId, error) {
  trackEvent('Voice Input Error', {
    game_id: gameId,
    error_type: error
  })
}

// Gallery Events
export function trackGallerySave(gameId, gameName) {
  trackEvent('Gallery Save', {
    game_id: gameId,
    game_name: gameName
  })
}

export function trackGalleryShare(gameId, method) {
  trackEvent('Gallery Share', {
    game_id: gameId,
    share_method: method // 'download', 'email', 'social'
  })
}

// Settings & Features
export function trackSafeModeToggle(enabled) {
  trackEvent('Safe Mode Toggle', { enabled })
}

export function trackGrandmaModeToggle(enabled) {
  trackEvent('Grandma Mode Toggle', { enabled })
}

// Page Views (Automatic with Plausible, but can track custom views)
export function trackPageView(pageName) {
  trackEvent('Page View', { page: pageName })
}

/**
 * Revenue Tracking Helpers
 */

// Calculate Monthly Recurring Revenue
export function getMRRValue(tier, billingInterval) {
  if (billingInterval === 'monthly') return 9.99
  if (billingInterval === 'yearly') return 59 / 12 // ~$4.92/month
  return 0
}

// Track conversion rate from free to paid
export function trackConversionRate(eventType, metadata = {}) {
  trackEvent(`Conversion: ${eventType}`, metadata)
}

/**
 * Conversion Funnel Tracking
 *
 * Full funnel from visitor → paying customer:
 * 1. Landing Page Visit (automatic)
 * 2. Dashboard View (automatic page view)
 * 3. Premium Gate Viewed (trackPremiumGateView)
 * 4. CTA Clicked (trackPremiumGateCTA)
 * 5. Pricing Page Visit (automatic)
 * 6. Checkout Started (trackCheckoutStarted)
 * 7. Trial Started (trackTrialStarted)
 * 8. Subscription Completed (trackSubscription)
 *
 * Goal: Measure drop-off at each step
 */

/**
 * A/B Testing Support
 */
export function trackExperiment(experimentName, variant) {
  trackEvent('Experiment', {
    experiment: experimentName,
    variant
  })
}

/**
 * Error Tracking
 */
export function trackError(errorType, message, context = {}) {
  trackEvent('Error', {
    type: errorType,
    message: message.substring(0, 100),
    ...context
  })
}
