/**
 * Email Templates for AI Family Night
 * Based on Phase 2 optimization plan - notification cadence
 */

// Trial Email Sequence (Days 1, 3, 4-6, 7)
export const TRIAL_EMAILS = {
  day1_welcome: {
    subject: "Welcome to AI Family Night! 🎉 Your first game is ready",
    getBody: (childName, parentGoal, interests) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #9333ea; font-size: 32px; margin-bottom: 20px;">Welcome to AI Family Night! 🎉</h1>

        <p style="font-size: 18px; color: #374151; line-height: 1.6;">
          Hi! We're so excited to have ${childName} join us.
        </p>

        <p style="font-size: 16px; color: #6b7280; line-height: 1.6;">
          You told us your goal is to <strong>${getGoalText(parentGoal)}</strong>.
          Here's how to get the most out of your 7-day trial:
        </p>

        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h2 style="color: #9333ea; font-size: 20px; margin-bottom: 16px;">Your Quick Start Guide</h2>
          <ol style="color: #374151; font-size: 16px; line-height: 1.8; padding-left: 20px;">
            <li><strong>Today:</strong> Try "Presidential Time Machine" (20 min, no prep needed)</li>
            <li><strong>This Week:</strong> Complete 3 missions to unlock your Space Explorer Badge</li>
            <li><strong>Explore:</strong> Browse all ${getInterestGames(interests)} based on ${childName}'s interests</li>
          </ol>
        </div>

        <a href="https://aifamilynight.com/dashboard" style="display: inline-block; background: #9333ea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; margin: 24px 0;">
          Start Your First Game →
        </a>

        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-top: 24px; border-radius: 4px;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">
            ✅ <strong>Parent Tip:</strong> The best time is right after dinner while ${childName} is still at the table.
            15-30 minutes of quality time, no cleanup required.
          </p>
        </div>

        <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
          Your 7-day trial ends on [TRIAL_END_DATE]. We'll remind you before it ends.
        </p>
      </div>
    `
  },

  day3_social_proof: {
    subject: `${'{childName}'} will love this... 🌟`,
    getBody: (childName, parentGoal) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #9333ea; font-size: 28px; margin-bottom: 20px;">How's it going?</h1>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          You're 3 days into your trial. Here's what other parents like you are saying:
        </p>

        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="color: #fbbf24; font-size: 20px;">⭐⭐⭐⭐⭐</div>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
            "My 7-year-old asks for 'game night' every evening now. It's become our favorite routine."
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">
            — Sarah M., parent of 2
          </p>
        </div>

        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="color: #fbbf24; font-size: 20px;">⭐⭐⭐⭐⭐</div>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
            "${getGoalTestimonial(parentGoal)}"
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">
            — Mike R., dad
          </p>
        </div>

        <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #92400e; margin-top: 0;">💡 Haven't started yet?</h3>
          <p style="color: #78350f; margin-bottom: 16px;">
            Tonight's the perfect time! Pick any game that matches ${childName}'s mood:
          </p>
          <ul style="color: #78350f; line-height: 1.8;">
            <li><strong>Low energy?</strong> Try Character Quiz (15 min, zero prep)</li>
            <li><strong>Silly mood?</strong> AI Joke Challenge (laugh-out-loud fun)</li>
            <li><strong>Creative?</strong> Comic Maker (they'll want to print it)</li>
          </ul>
        </div>

        <a href="https://aifamilynight.com/games" style="display: inline-block; background: #9333ea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; margin: 24px 0;">
          Browse All Games →
        </a>

        <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
          4 days left in your trial
        </p>
      </div>
    `
  },

  day5_personalized: {
    subject: "Based on ${childName}'s interests... 🎨",
    getBody: (childName, interests) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #9333ea; font-size: 28px; margin-bottom: 20px;">Games ${childName} will love 💜</h1>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Based on ${childName}'s interests (${interests.join(', ')}), here are the top-rated games:
        </p>

        ${getPersonalizedGameCards(interests)}

        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: #92400e; margin-top: 0;">🏆 Complete This Week's Challenge</h3>
          <p style="color: #78350f; margin-bottom: 12px;">
            Finish 3 missions this week to unlock the <strong>Space Explorer Badge</strong>!
          </p>
          <div style="background: rgba(255,255,255,0.5); border-radius: 8px; padding: 12px; margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #78350f; font-weight: 600;">Progress</span>
              <span style="color: #78350f;">1 of 3 complete</span>
            </div>
            <div style="background: #d97706; height: 8px; border-radius: 4px; width: 33%;"></div>
          </div>
        </div>

        <a href="https://aifamilynight.com/calendar" style="display: inline-block; background: #9333ea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; margin: 24px 0;">
          View Your Calendar →
        </a>

        <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
          2 days left in your trial
        </p>
      </div>
    `
  },

  day7_conversion: {
    subject: "Last day of your trial 🎁 Special offer inside",
    getBody: (childName, gamesPlayed) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #9333ea; font-size: 32px; margin-bottom: 20px;">Your trial ends tomorrow 🎁</h1>

        <p style="font-size: 18px; color: #374151; line-height: 1.6;">
          ${childName} has played <strong>${gamesPlayed} games</strong> this week!
          ${gamesPlayed >= 3 ? "That's amazing 🎉" : "You're just getting started!"}
        </p>

        <div style="background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h2 style="color: #065f46; margin-top: 0; font-size: 24px;">🎁 Founding Family Offer</h2>
          <p style="color: #064e3b; font-size: 16px; margin-bottom: 16px;">
            Subscribe today and get:
          </p>
          <ul style="color: #064e3b; font-size: 16px; line-height: 1.8;">
            <li><strong>52 new games per year</strong> (one every Sunday)</li>
            <li><strong>Unlimited plays</strong> on all games</li>
            <li><strong>Save all creations</strong> to your gallery forever</li>
            <li><strong>Multiple child profiles</strong> (coming Feb 2026)</li>
            <li><strong>Founding Family badge</strong> & early feature access</li>
          </ul>
          <div style="background: white; border-radius: 8px; padding: 16px; margin-top: 16px;">
            <div style="text-align: center;">
              <div style="color: #9ca3af; text-decoration: line-through; font-size: 16px;">$119.88/year</div>
              <div style="color: #065f46; font-size: 36px; font-weight: bold; margin: 8px 0;">$74.99/year</div>
              <div style="color: #059669; font-size: 14px; font-weight: 600;">Save 38% • Just $6.25/month</div>
            </div>
          </div>
        </div>

        <a href="https://aifamilynight.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 20px; margin: 24px 0; text-align: center; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">
          Subscribe Now & Save 38% →
        </a>

        <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 16px;">
          Or continue with our free plan (3 games, limited features)
        </p>

        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-top: 32px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>Question?</strong> Reply to this email and we'll help you out within 24 hours.
          </p>
        </div>
      </div>
    `
  }
}

// Weekly Engagement Emails (Mon/Wed/Fri/Sun)
export const WEEKLY_EMAILS = {
  monday_mission: {
    subject: "🚀 New Space Week mission unlocked!",
    getBody: (childName, weekTheme, missionTitle) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #9333ea; font-size: 32px; margin-bottom: 20px;">${weekTheme} starts today! 🚀</h1>

        <p style="font-size: 18px; color: #374151; line-height: 1.6;">
          Hey ${childName}! Your Monday mission is ready:
        </p>

        <div style="background: linear-gradient(135deg, #312e81 0%, #6366f1 100%); border-radius: 16px; padding: 32px; margin: 24px 0; color: white;">
          <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
          <h2 style="margin-top: 0; font-size: 28px;">${missionTitle}</h2>
          <div style="display: flex; gap: 16px; margin-top: 16px; font-size: 14px; opacity: 0.9;">
            <div>⏱️ 20 minutes</div>
            <div>⭐ 100 points</div>
            <div>📅 Due: Tonight</div>
          </div>
        </div>

        <a href="https://aifamilynight.com/calendar" style="display: inline-block; background: #9333ea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; margin: 24px 0;">
          Start Mission →
        </a>

        <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            💡 <strong>Parent Tip:</strong> Set a timer for 20 minutes right after dinner. That's all you need!
          </p>
        </div>
      </div>
    `
  },

  wednesday_reminder: {
    subject: "Halfway there! 🎯 Wednesday mission ready",
    getBody: (childName, missionTitle, mondayCompleted) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #9333ea; font-size: 28px; margin-bottom: 20px;">
          ${mondayCompleted ? "Great job! Keep the streak going 🔥" : "Don't miss out! 🎯"}
        </h1>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${mondayCompleted
            ? `${childName} completed Monday's mission! Wednesday's challenge is ready:`
            : `No worries if you missed Monday - you can still complete this week's challenge!`
          }
        </p>

        <div style="background: white; border: 2px solid #9333ea; border-radius: 16px; padding: 24px; margin: 24px 0;">
          <h2 style="color: #9333ea; margin-top: 0;">${missionTitle}</h2>
          <div style="background: #f3e8ff; border-radius: 8px; padding: 12px; margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b21a8; font-weight: 600;">Week Progress</span>
              <span style="color: #6b21a8;">${mondayCompleted ? '1' : '0'} of 3 complete</span>
            </div>
            <div style="background: #e9d5ff; height: 8px; border-radius: 4px;">
              <div style="background: #9333ea; height: 8px; border-radius: 4px; width: ${mondayCompleted ? '33%' : '0%'};"></div>
            </div>
          </div>
        </div>

        <a href="https://aifamilynight.com/calendar" style="display: inline-block; background: #9333ea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px;">
          Continue Mission →
        </a>
      </div>
    `
  },

  sunday_finale: {
    subject: "🏆 Final mission! Unlock your Space Explorer Badge",
    getBody: (childName, missionsCompleted, badgeName) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${missionsCompleted >= 2 ? `
          <h1 style="color: #10b981; font-size: 32px; margin-bottom: 20px;">You're so close! 🏆</h1>
          <p style="font-size: 18px; color: #374151; line-height: 1.6;">
            ${childName}, you've completed ${missionsCompleted} of 3 missions.
            Finish today's finale to unlock the <strong>${badgeName}</strong>!
          </p>
        ` : `
          <h1 style="color: #9333ea; font-size: 32px; margin-bottom: 20px;">Final mission of the week! 🎯</h1>
          <p style="font-size: 18px; color: #374151; line-height: 1.6;">
            This week's adventure ends with an epic finale mission!
          </p>
        `}

        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 16px; padding: 32px; margin: 24px 0; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 16px;">🛸</div>
          <h2 style="color: #92400e; margin: 0; font-size: 24px;">${badgeName}</h2>
          <p style="color: #78350f; margin-top: 8px;">
            ${missionsCompleted >= 2 ? "Almost unlocked!" : "Complete all 3 missions to claim"}
          </p>
        </div>

        <a href="https://aifamilynight.com/calendar" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 20px; margin: 24px 0; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">
          ${missionsCompleted >= 2 ? "Claim Your Badge! 🏆" : "Start Final Mission →"}
        </a>

        ${missionsCompleted < 2 && `
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-top: 24px; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              ⚠️ <strong>Heads up:</strong> You can still complete Monday and Wednesday's missions today to unlock your badge!
            </p>
          </div>
        `}
      </div>
    `
  }
}

// Helper functions
function getGoalText(goalId) {
  const goals = {
    'reading': 'build stronger reading skills',
    'family-time': 'make family time more meaningful',
    'screen-time': 'have productive screen time when you\'re busy',
    'creativity': 'foster creativity and confidence'
  }
  return goals[goalId] || 'have quality family time'
}

function getGoalTestimonial(goalId) {
  const testimonials = {
    'reading': 'My daughter\'s reading comprehension has improved so much since we started playing these games together.',
    'family-time': 'Finally, screen time that actually brings us closer instead of everyone on separate devices.',
    'screen-time': 'Perfect for when I\'m cooking dinner. 20 minutes of independent fun that\'s actually educational.',
    'creativity': 'My son went from "I can\'t draw" to creating entire comic book series. The confidence boost is real.'
  }
  return testimonials[goalId] || 'Our kids actually ask to play these games. That never happens!'
}

function getInterestGames(interests) {
  const count = interests.length * 6 // Rough estimate
  return `${count}+ games`
}

function getPersonalizedGameCards(interests) {
  // This would be dynamic based on interests
  // For now, returning a sample
  return `
    <div style="margin: 24px 0;">
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h3 style="color: #9333ea; margin-top: 0;">🚀 Spaceship Designer</h3>
        <p style="color: #6b7280; margin: 8px 0;">Design your dream spacecraft with AI-powered suggestions</p>
        <div style="color: #9ca3af; font-size: 14px;">⏱️ 25 min • ⭐ Rated 4.9/5</div>
      </div>
    </div>
  `
}
