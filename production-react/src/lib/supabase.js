/**
 * Supabase Client Configuration
 *
 * To set up Supabase:
 * 1. Create account at https://supabase.com
 * 2. Create new project
 * 3. Get your project URL and anon key from Settings → API
 * 4. Add to .env.local:
 *    VITE_SUPABASE_URL=https://your-project.supabase.co
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Auth Helper Functions
 */

// Sign up new user with email/password
export async function signUp(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata // Store additional user data (name, etc.)
    }
  })

  if (error) {
    console.error('Sign up error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, user: data.user }
}

// Sign in existing user
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, user: data.user, session: data.session }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Get user error:', error)
    return null
  }

  return user
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Get session error:', error)
    return null
  }

  return session
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

/**
 * Database Helper Functions
 */

// Get user's subscription from database
export async function getUserSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      customers (
        stripe_customer_id
      )
    `)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Get subscription error:', error)
    return null
  }

  return data
}

// Update user's subscription status
export async function updateSubscription(userId, subscriptionData) {
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      ...subscriptionData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Update subscription error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Create or update Stripe customer
export async function upsertCustomer(userId, stripeCustomerId, email) {
  const { data, error } = await supabase
    .from('customers')
    .upsert({
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      email,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Upsert customer error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Get user's game play count (for free tier limits)
export async function getGamePlayCount(userId, gameId) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count, error } = await supabase
    .from('game_plays')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  if (error) {
    console.error('Get play count error:', error)
    return 0
  }

  return count || 0
}

// Record a game play
export async function recordGamePlay(userId, gameId, metadata = {}) {
  const { error } = await supabase
    .from('game_plays')
    .insert({
      user_id: userId,
      game_id: gameId,
      metadata,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Record game play error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Save creation to gallery
export async function saveToGalleryDb(userId, creationData) {
  const { data, error } = await supabase
    .from('gallery')
    .insert({
      user_id: userId,
      game_name: creationData.gameName,
      data: creationData.data,
      preview: creationData.preview,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Save to gallery error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Get user's gallery items
export async function getGalleryItems(userId, limit = 50) {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Get gallery error:', error)
    return []
  }

  return data || []
}
