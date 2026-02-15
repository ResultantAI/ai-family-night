/**
 * Notification Framework for AI Family Night
 * Handles email scheduling and in-app notifications
 */

import { supabase } from './supabase'
import { TRIAL_EMAILS, WEEKLY_EMAILS } from './email-templates'

/**
 * Email Service Configuration
 * TODO: Set up with Resend, SendGrid, or similar email service
 */
const EMAIL_CONFIG = {
  apiKey: import.meta.env.VITE_EMAIL_API_KEY || '',
  fromEmail: 'hello@aifamilynight.com',
  fromName: 'AI Family Night',
  replyTo: 'support@aifamilynight.com'
}

/**
 * Notification Schedule (based on Phase 2 optimization plan)
 * Mon/Wed/Fri/Sun = 4 touchpoints per week
 */
export const NOTIFICATION_SCHEDULE = {
  // Trial sequence (Days 1, 3, 5, 7)
  trial: {
    day1: { delay: 0, template: 'day1_welcome', type: 'email' },
    day3: { delay: 2 * 24 * 60 * 60 * 1000, template: 'day3_social_proof', type: 'email' },
    day5: { delay: 4 * 24 * 60 * 60 * 1000, template: 'day5_personalized', type: 'email' },
    day7: { delay: 6 * 24 * 60 * 60 * 1000, template: 'day7_conversion', type: 'email' }
  },

  // Weekly mission reminders (Mon 9am, Wed 5pm, Sun 10am)
  weekly: {
    monday: { dayOfWeek: 1, hour: 9, template: 'monday_mission', type: 'email+push' },
    wednesday: { dayOfWeek: 3, hour: 17, template: 'wednesday_reminder', type: 'email+push' },
    sunday: { dayOfWeek: 0, hour: 10, template: 'sunday_finale', type: 'email+push' }
  },

  // Retention campaigns
  retention: {
    streak_reminder: {
      trigger: 'missed_2_weeks',
      template: 'comeback_offer',
      type: 'email'
    },
    badge_unlock: {
      trigger: 'mission_complete',
      template: 'badge_earned',
      type: 'push'
    }
  }
}

/**
 * Send trial welcome email sequence
 */
export async function startTrialEmailSequence(userId, userData) {
  const { child_name, parent_goal, interests, trial_start_date } = userData

  try {
    // Schedule all 4 trial emails
    const trialStart = new Date(trial_start_date)

    await scheduleEmail({
      userId,
      scheduledFor: trialStart,
      template: 'day1_welcome',
      data: {
        childName: child_name,
        parentGoal: parent_goal,
        interests: interests || []
      }
    })

    await scheduleEmail({
      userId,
      scheduledFor: new Date(trialStart.getTime() + NOTIFICATION_SCHEDULE.trial.day3.delay),
      template: 'day3_social_proof',
      data: {
        childName: child_name,
        parentGoal: parent_goal
      }
    })

    await scheduleEmail({
      userId,
      scheduledFor: new Date(trialStart.getTime() + NOTIFICATION_SCHEDULE.trial.day5.delay),
      template: 'day5_personalized',
      data: {
        childName: child_name,
        interests: interests || []
      }
    })

    await scheduleEmail({
      userId,
      scheduledFor: new Date(trialStart.getTime() + NOTIFICATION_SCHEDULE.trial.day7.delay),
      template: 'day7_conversion',
      data: {
        childName: child_name,
        gamesPlayed: 0 // Will be updated from DB
      }
    })

    console.log('Trial email sequence scheduled for user:', userId)
    return { success: true }
  } catch (error) {
    console.error('Error scheduling trial emails:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send weekly mission notification
 */
export async function sendWeeklyMissionNotification(userId, missionData) {
  const { childName, weekTheme, missionTitle, dayOfWeek } = missionData

  let template
  switch (dayOfWeek) {
    case 1: // Monday
      template = WEEKLY_EMAILS.monday_mission
      break
    case 3: // Wednesday
      template = WEEKLY_EMAILS.wednesday_reminder
      break
    case 0: // Sunday
      template = WEEKLY_EMAILS.sunday_finale
      break
    default:
      return { success: false, error: 'Invalid day of week' }
  }

  try {
    await sendEmail({
      userId,
      subject: template.subject,
      body: template.getBody(childName, weekTheme, missionTitle),
      template: `weekly_${['sunday', 'monday', '', 'wednesday'][dayOfWeek]}`
    })

    // Also send in-app notification
    await createInAppNotification({
      userId,
      title: `New ${['Sunday', 'Monday', '', 'Wednesday'][dayOfWeek]} Mission!`,
      message: missionTitle,
      link: '/calendar',
      type: 'mission'
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending weekly mission notification:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Schedule an email for future delivery
 */
async function scheduleEmail({ userId, scheduledFor, template, data }) {
  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  // For now, store in database for scheduled sending

  const { error } = await supabase
    .from('scheduled_emails')
    .insert({
      user_id: userId,
      scheduled_for: scheduledFor.toISOString(),
      template,
      data,
      status: 'pending'
    })

  if (error) {
    throw new Error(`Failed to schedule email: ${error.message}`)
  }

  return { success: true }
}

/**
 * Send email immediately
 */
async function sendEmail({ userId, subject, body, template }) {
  // TODO: Implement actual email sending with Resend/SendGrid
  // For now, log to console

  console.log('Sending email:', {
    userId,
    subject,
    template,
    timestamp: new Date().toISOString()
  })

  // Example Resend integration:
  /*
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAIL_CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      to: userEmail,
      subject,
      html: body
    })
  })
  */

  // Log to database
  const { error } = await supabase
    .from('email_logs')
    .insert({
      user_id: userId,
      template,
      subject,
      sent_at: new Date().toISOString(),
      status: 'sent'
    })

  if (error) {
    console.error('Failed to log email:', error)
  }

  return { success: true }
}

/**
 * Create in-app notification
 */
async function createInAppNotification({ userId, title, message, link, type }) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      link,
      type,
      read: false,
      created_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  return { success: true }
}

/**
 * Get user's unread notifications
 */
export async function getUnreadNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    return { success: false }
  }

  return { success: true }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(userId, preferences) {
  const { error } = await supabase.auth.updateUser({
    data: {
      notification_preferences: {
        email_weekly_missions: preferences.emailWeeklyMissions ?? true,
        email_badges: preferences.emailBadges ?? true,
        email_new_games: preferences.emailNewGames ?? true,
        push_mission_reminders: preferences.pushMissionReminders ?? true,
        push_badge_unlocks: preferences.pushBadgeUnlocks ?? true,
        preferred_time: preferences.preferredTime || '18:00', // 6pm default
        timezone: preferences.timezone || 'America/Los_Angeles'
      }
    }
  })

  if (error) {
    console.error('Error updating notification preferences:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return user.user_metadata?.notification_preferences || {
    emailWeeklyMissions: true,
    emailBadges: true,
    emailNewGames: true,
    pushMissionReminders: true,
    pushBadgeUnlocks: true,
    preferredTime: '18:00',
    timezone: 'America/Los_Angeles'
  }
}
