/**
 * Claude AI Service - Secure API integration with Anthropic Claude
 * Integrates all security measures: sanitization, moderation, logging
 */

import { buildSafePrompt } from '../utils/aiPrompts'
import { moderateAIOutput, getSafeFallback } from '../utils/moderation'
import { logSecurityEvent, SecurityEventTypes } from '../utils/securityLogger'

/**
 * Calls Anthropic Claude API with full security measures
 * @param {object} params - Generation parameters
 * @returns {object} - { success: boolean, content?: string, error?: string }
 */
export async function generateWithClaude({
  userInput,
  gameContext,
  additionalData = {},
  model = 'claude-3-5-sonnet-20241022',
  maxTokens = 2048,
  temperature = 0.7
}) {
  try {
    // 1. Build safe prompt (automatically sanitizes and validates input)
    const promptMessages = buildSafePrompt(userInput, gameContext, additionalData)

    // 2. Format for Claude API (system prompt separate from messages)
    // Claude expects: { system: "...", messages: [{ role: "user", content: "..." }] }
    const systemPrompt = promptMessages.find(m => m.role === 'system')?.content || ''
    const userMessages = promptMessages.filter(m => m.role !== 'system')

    // 3. Get API key from environment
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new Error('Anthropic API key not configured. Please add VITE_ANTHROPIC_API_KEY to .env.local')
    }

    // 4. Call Claude API
    console.log(`🤖 Calling Claude for ${gameContext}...`)

    const requestBody = {
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: userMessages
    }

    console.log('Request:', { model, gameContext, messageCount: userMessages.length })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()

    // Extract content from Claude's response
    const aiOutput = data.content[0].text

    console.log(`✅ Received response from Claude (${aiOutput.length} chars)`)

    // 4. Moderate AI output before returning
    const moderation = await moderateAIOutput(aiOutput, gameContext)

    if (!moderation.safe) {
      console.warn(`⚠️ AI output failed moderation: ${moderation.reason}`)

      logSecurityEvent(SecurityEventTypes.INAPPROPRIATE_CONTENT, {
        gameContext,
        reason: moderation.reason,
        contentPreview: aiOutput.slice(0, 100)
      })

      return {
        success: false,
        error: moderation.reason,
        fallback: getSafeFallback(gameContext)
      }
    }

    // 5. Success! Return safe content
    console.log('✅ Content passed all safety checks')

    return {
      success: true,
      content: moderation.content
    }

  } catch (error) {
    console.error('Error calling Claude API:', error)

    logSecurityEvent(SecurityEventTypes.MODERATION_API_ERROR, {
      gameContext,
      error: error.message
    })

    return {
      success: false,
      error: error.message,
      fallback: getSafeFallback(gameContext)
    }
  }
}

/**
 * Generates content with streaming support (for future features)
 * @param {object} params - Same as generateWithClaude
 * @param {function} onChunk - Callback for each chunk of text
 * @returns {object} - { success: boolean, content?: string, error?: string }
 */
export async function generateWithClaudeStreaming({
  userInput,
  gameContext,
  additionalData = {},
  model = 'claude-3-5-sonnet-20241022',
  maxTokens = 2048,
  temperature = 0.7,
  onChunk = () => {}
}) {
  try {
    const promptMessages = buildSafePrompt(userInput, gameContext, additionalData)

    // Format for Claude API
    const systemPrompt = promptMessages.find(m => m.role === 'system')?.content || ''
    const userMessages = promptMessages.filter(m => m.role !== 'system')

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    console.log(`🤖 Streaming from Claude for ${gameContext}...`)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: userMessages,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    // Read stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))

          if (data.type === 'content_block_delta') {
            const text = data.delta.text
            fullContent += text
            onChunk(text) // Call callback with chunk
          }
        }
      }
    }

    // Moderate full content
    const moderation = await moderateAIOutput(fullContent, gameContext)

    if (!moderation.safe) {
      return {
        success: false,
        error: moderation.reason,
        fallback: getSafeFallback(gameContext)
      }
    }

    return {
      success: true,
      content: moderation.content
    }

  } catch (error) {
    console.error('Error streaming from Claude:', error)

    return {
      success: false,
      error: error.message,
      fallback: getSafeFallback(gameContext)
    }
  }
}

/**
 * Test connection to Claude API
 * @returns {object} - { success: boolean, message: string }
 */
export async function testClaudeConnection() {
  try {
    const result = await generateWithClaude({
      userInput: 'Say hello!',
      gameContext: 'superhero-origin',
      additionalData: {
        childName: 'Test User',
        age: '10',
        traits: { brave: true },
        favoriteColor: 'blue',
        superpower: 'flight'
      },
      maxTokens: 100
    })

    if (result.success) {
      return {
        success: true,
        message: '✅ Claude API connected successfully!',
        preview: result.content.slice(0, 100) + '...'
      }
    } else {
      return {
        success: false,
        message: `❌ Claude API error: ${result.error}`
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Connection failed: ${error.message}`
    }
  }
}

/**
 * Rate limiting helper (basic client-side implementation)
 * In production, implement server-side rate limiting
 */
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
  }

  canMakeRequest() {
    const now = Date.now()
    // Remove old requests outside time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow)

    if (this.requests.length >= this.maxRequests) {
      return false
    }

    this.requests.push(now)
    return true
  }

  getTimeUntilNextRequest() {
    if (this.requests.length < this.maxRequests) {
      return 0
    }

    const oldestRequest = this.requests[0]
    const timeUntilExpiry = this.timeWindow - (Date.now() - oldestRequest)
    return Math.max(0, timeUntilExpiry)
  }
}

// Export rate limiter instance (10 requests per minute)
export const rateLimiter = new RateLimiter(10, 60000)

/**
 * Wrapper that includes rate limiting
 * @param {object} params - Same as generateWithClaude
 * @returns {object} - { success: boolean, content?: string, error?: string }
 */
export async function generateWithRateLimit(params) {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(rateLimiter.getTimeUntilNextRequest() / 1000)

    return {
      success: false,
      error: `Rate limit exceeded. Please wait ${waitTime} seconds.`,
      fallback: 'You\'re being creative too fast! Take a short break and try again.'
    }
  }

  return generateWithClaude(params)
}
