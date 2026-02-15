/**
 * Vercel Serverless Function: Send Email with Resend
 * Endpoint: /api/send-email
 *
 * To set up Resend:
 * 1. Create account at https://resend.com
 * 2. Verify your domain or use resend's test domain
 * 3. Get API key from https://resend.com/api-keys
 * 4. Add to environment: RESEND_API_KEY=re_...
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
const templates = {
  welcome: (data) => ({
    subject: `Welcome to AI Family Night, ${data.name}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .game-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .game-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Welcome to AI Family Night!</h1>
          </div>

          <div class="content">
            <h2>Hi ${data.name}! 👋</h2>
            <p>Thank you for joining AI Family Night! We're excited to help you create amazing memories with your family.</p>

            ${data.trial ? `
              <p><strong>🎁 Your 7-day free trial has started!</strong></p>
              <p>You now have access to all 8 games. No charge until ${new Date(data.trialEnd).toLocaleDateString()}.</p>
            ` : `
              <p>You're on the <strong>${data.tier === 'free' ? 'Free Plan' : 'Premium Plan'}</strong>.</p>
            `}

            <div class="game-list">
              <h3>🎮 ${data.trial || data.tier !== 'free' ? 'Your Premium Games' : 'Free Games Available'}:</h3>
              ${data.trial || data.tier !== 'free' ? `
                <div class="game-item">🎨 <strong>Comic Maker</strong> - Create 4-panel comics</div>
                <div class="game-item">🦸 <strong>Superhero Origin</strong> - AI-powered hero creator</div>
                <div class="game-item">🏡 <strong>Treehouse Designer</strong> - Design dream treehouses</div>
                <div class="game-item">🎭 <strong>Family Movie Night</strong> - Generate movie scripts</div>
                <div class="game-item">📚 <strong>Noisy Storybook</strong> - Record sound effects for stories</div>
                <div class="game-item">🔥 <strong>AI Joke Challenge</strong> - Comedy battle with AI</div>
                <div class="game-item">🍕 <strong>Restaurant Menu</strong> - Create fun menus</div>
                <div class="game-item">❓ <strong>Character Quiz</strong> - Find your character match</div>
              ` : `
                <div class="game-item">🎨 <strong>Comic Maker</strong> - Create 4-panel comics</div>
                <div class="game-item">❓ <strong>Character Quiz</strong> - Find your character match</div>
                <div class="game-item">🏡 <strong>Treehouse Designer</strong> - Design dream treehouses</div>
                <p style="margin-top: 15px;"><small>💡 Upgrade to Premium to unlock all 8 games!</small></p>
              `}
            </div>

            <center>
              <a href="${data.dashboardUrl}" class="button">Go to Dashboard →</a>
            </center>

            <h3>📌 Quick Tips:</h3>
            <ul>
              <li>🎤 <strong>Voice Input:</strong> Click the mic icon to speak instead of type (great for young kids!)</li>
              <li>🛡️ <strong>Extra Safe Mode:</strong> Enable in Settings for younger children (ages 4-7)</li>
              <li>💾 <strong>Save Creations:</strong> Your gallery automatically saves everything you create</li>
              <li>🆕 <strong>New Games:</strong> We add a new game every Sunday!</li>
            </ul>

            ${data.trial ? `
              <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>💡 Reminder:</strong> Your trial lasts 7 days. We'll send you a reminder 3 days before it ends. You can cancel anytime from Settings.
              </p>
            ` : ''}
          </div>

          <div class="footer">
            <p>Need help? Reply to this email or visit our <a href="${data.dashboardUrl}/settings">Help Center</a></p>
            <p style="font-size: 12px; color: #9ca3af;">AI Family Night | Turn screen time into quality time</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  trialEnding: (data) => ({
    subject: `Your AI Family Night trial ends in ${data.daysLeft} days`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 14px; color: #6b7280; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Trial Ending Soon</h1>
          </div>

          <div class="content">
            <h2>Hi ${data.name}!</h2>
            <p>Your 7-day free trial ends in <strong>${data.daysLeft} days</strong> (${new Date(data.trialEnd).toLocaleDateString()}).</p>

            <h3>📊 Your Family's Stats:</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${data.gamesPlayed || 0}</div>
                <div class="stat-label">Games Played</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${data.creationsSaved || 0}</div>
                <div class="stat-label">Creations Saved</div>
              </div>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>✅ <strong>Keep Premium:</strong> Your card will be charged $${data.price} on ${new Date(data.trialEnd).toLocaleDateString()}</li>
              <li>❌ <strong>Cancel anytime:</strong> You'll keep access until your trial ends, then switch to the free plan (3 games)</li>
            </ul>

            <center>
              <a href="${data.dashboardUrl}/settings" class="button">Manage Subscription</a>
            </center>

            <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
              <strong>💡 Want to save 50%?</strong> Switch to our yearly plan for just $59/year ($4.92/month) in Settings!
            </p>
          </div>

          <div class="footer">
            <p>Questions? Reply to this email - we're here to help!</p>
            <p style="font-size: 12px; color: #9ca3af;">AI Family Night | Turn screen time into quality time</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentSuccess: (data) => ({
    subject: `Payment received - AI Family Night Premium`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Received!</h1>
          </div>

          <div class="content">
            <h2>Thank you, ${data.name}!</h2>
            <p>Your payment has been successfully processed.</p>

            <div class="receipt">
              <h3>📄 Receipt</h3>
              <div class="receipt-row">
                <span>Plan</span>
                <span><strong>${data.plan}</strong></span>
              </div>
              <div class="receipt-row">
                <span>Amount</span>
                <span><strong>$${data.amount}</strong></span>
              </div>
              <div class="receipt-row">
                <span>Date</span>
                <span>${new Date(data.date).toLocaleDateString()}</span>
              </div>
              <div class="receipt-row">
                <span>Next billing</span>
                <span>${new Date(data.nextBillingDate).toLocaleDateString()}</span>
              </div>
              <div class="receipt-row" style="border-bottom: none;">
                <span>Invoice</span>
                <span><a href="${data.invoiceUrl}">Download PDF</a></span>
              </div>
            </div>

            <p>Your Premium access continues! Enjoy all 8 games with your family.</p>

            <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <strong>💡 Tip:</strong> Share the fun! Give a gift subscription to grandparents, aunts, or friends at <a href="${data.dashboardUrl}/gift">${data.dashboardUrl}/gift</a>
            </p>
          </div>

          <div class="footer">
            <p>Manage your subscription anytime in <a href="${data.dashboardUrl}/settings">Settings</a></p>
            <p style="font-size: 12px; color: #9ca3af;">AI Family Night | Turn screen time into quality time</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentFailed: (data) => ({
    subject: `Payment failed - Action required`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>

          <div class="content">
            <h2>Hi ${data.name},</h2>
            <p>We were unable to process your payment of $${data.amount} for AI Family Night Premium.</p>

            <p><strong>Why this happened:</strong></p>
            <p>${data.reason || 'Your card was declined. This could be due to insufficient funds, an expired card, or your bank blocking the charge.'}</p>

            <p><strong>What to do:</strong></p>
            <ol>
              <li>Update your payment method in Settings</li>
              <li>Contact your bank if the issue persists</li>
              <li>We'll retry the payment automatically in ${data.retryDays || 3} days</li>
            </ol>

            <center>
              <a href="${data.updatePaymentUrl}" class="button">Update Payment Method</a>
            </center>

            <p style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 20px;">
              <strong>⚠️ Important:</strong> If payment fails again, your account will be downgraded to the free plan after ${data.gracePeriodDays || 7} days.
            </p>
          </div>

          <div class="footer">
            <p>Need help? Reply to this email or contact support</p>
            <p style="font-size: 12px; color: #9ca3af;">AI Family Night | Turn screen time into quality time</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  subscriptionCanceled: (data) => ({
    subject: `We're sad to see you go`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💔 Subscription Canceled</h1>
          </div>

          <div class="content">
            <h2>We're sorry to see you go, ${data.name}</h2>
            <p>Your AI Family Night Premium subscription has been canceled.</p>

            <p><strong>What this means:</strong></p>
            <ul>
              <li>✅ You'll keep Premium access until ${new Date(data.accessUntil).toLocaleDateString()}</li>
              <li>📉 After that, you'll be downgraded to the free plan (3 games)</li>
              <li>💾 All your saved creations will remain in your gallery</li>
              <li>🔄 You can resubscribe anytime!</li>
            </ul>

            <p>We'd love your feedback! What made you cancel?</p>
            <ul>
              <li>⏰ Not enough time to use it?</li>
              <li>💰 Too expensive?</li>
              <li>🎮 Not enough games your family enjoyed?</li>
              <li>📱 Technical issues?</li>
            </ul>

            <p>Reply to this email and let us know - we read every response!</p>

            <center>
              <a href="${data.reactivateUrl}" class="button">Reactivate Subscription</a>
            </center>

            <p style="background: #ede9fe; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin-top: 20px;">
              <strong>💡 Changed your mind?</strong> You can reactivate your subscription anytime before ${new Date(data.accessUntil).toLocaleDateString()} and keep your current billing cycle!
            </p>
          </div>

          <div class="footer">
            <p>Thanks for being part of AI Family Night. We hope to see you again! ❤️</p>
            <p style="font-size: 12px; color: #9ca3af;">AI Family Night | Turn screen time into quality time</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  giftReceived: (data) => ({
    subject: `🎁 You received a gift: ${data.duration} months of AI Family Night Premium!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px; }
          .gift-box { background: white; border: 3px solid #ec4899; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #ec4899; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .message-box { background: #fce7f3; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899; margin: 20px 0; font-style: italic; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 You Got a Gift!</h1>
          </div>

          <div class="content">
            <div class="gift-box">
              <h2 style="color: #ec4899; margin: 0;">🎉 ${data.duration} Months of Premium!</h2>
              <p style="font-size: 18px; color: #6b7280;">From: <strong>${data.senderName}</strong></p>
            </div>

            ${data.message ? `
              <div class="message-box">
                <p>"${data.message}"</p>
                <p style="text-align: right; margin: 10px 0 0 0;">- ${data.senderName}</p>
              </div>
            ` : ''}

            <h3>What's Included:</h3>
            <ul>
              <li>✨ All 8 games unlocked</li>
              <li>🤖 Unlimited AI generations</li>
              <li>🎤 Voice input on all games</li>
              <li>💾 Save unlimited creations</li>
              <li>🆕 New game every Sunday</li>
            </ul>

            <center>
              <a href="${data.redeemUrl}" class="button">Redeem Your Gift →</a>
            </center>

            <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 20px;">
              <strong>💡 New to AI Family Night?</strong> Don't worry! Creating an account takes just 30 seconds, then you'll have instant access to all Premium games.
            </p>
          </div>

          <div class="footer">
            <p>Questions? Reply to this email - we're here to help!</p>
            <p style="font-size: 12px; color: #9ca3af;">AI Family Night | Turn screen time into quality time</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { template, to, data } = req.body

    if (!template || !to || !data) {
      return res.status(400).json({ error: 'Missing required fields: template, to, data' })
    }

    const emailTemplate = templates[template]
    if (!emailTemplate) {
      return res.status(400).json({ error: `Unknown template: ${template}` })
    }

    const { subject, html } = emailTemplate(data)

    const result = await resend.emails.send({
      from: 'AI Family Night <noreply@aifamilynight.com>', // Update with your verified domain
      to: [to],
      subject,
      html
    })

    res.status(200).json({ success: true, emailId: result.id })
  } catch (error) {
    console.error('Email send error:', error)
    res.status(500).json({ error: error.message })
  }
}
