/**
 * Generate AI Roast - Serverless function for Claude API
 * Handles roast battle AI generation with safety measures
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userInput, playerName, round, mode } = req.body

  if (!userInput) {
    return res.status(400).json({ error: 'User input required' })
  }

  try {
    const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY

    if (!ANTHROPIC_API_KEY) {
      console.error('VITE_ANTHROPIC_API_KEY not set')
      return res.status(500).json({ error: 'API key not configured' })
    }

    // Build the prompt
    const systemPrompt = `You are the child's funny friend in a hilarious roast battle competition.

YOUR PERSONALITY:
- Talk like a cool, funny kid who's great at comebacks
- Be playful and cheeky, but NEVER mean
- Act like you're having the time of your life trading jokes
- Use casual kid-friendly language (like "Yo!", "Dude!", "No way!")
- Keep the energy high and funny

YOUR TASK:
- Fire back with your own hilarious roast/comeback
- React to what the kid said (laugh, "ooh that stings!", "nice one but wait till you hear THIS")
- Keep it fun and silly, never mean

STRICT CONTENT RULES:
1. NEVER insult: appearance, weight, intelligence, family, disabilities, race, gender
2. SAFE TARGETS ONLY: gaming skills, silly habits, messy room, smelly socks, corny jokes, slow WiFi, being slow, old tech
3. TONE: Like two best friends playfully roasting each other at lunch
4. Target: 10-15 year olds (slightly more mature humor, but still G-rated)

ROAST STYLE:
- Start with a quick reaction ("Ooh nice try!" or "Okay okay, but check THIS out!")
- Then deliver YOUR roast with clever wordplay and smart observations
- Keep it short and punchy (1-2 sentences max)
- Be SMART and WITTY, not corny (unless intentionally corny for humor)

RESPONSE FORMAT:
[Quick reaction + Your roast]
BURN METER: [1-10 rating]

Example:
"Haha nice! But YOU'RE so slow at video games, you came in second place in solitaire! 🎮"
BURN METER: 8`

    const userMessage = `Round ${round}. ${playerName} just roasted you with: "${userInput}"\n\nFire back with your comeback!`

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        temperature: 0.9,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Claude API error:', errorData)
      return res.status(500).json({
        error: `Claude API error: ${response.status}`,
        details: errorData
      })
    }

    const data = await response.json()
    const aiOutput = data.content[0].text

    return res.status(200).json({
      success: true,
      content: aiOutput
    })

  } catch (error) {
    console.error('Error generating roast:', error)
    return res.status(500).json({
      error: error.message,
      success: false
    })
  }
}
