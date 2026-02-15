/**
 * Content moderation for AI-generated outputs
 * Multi-layer defense: profanity filter + pattern matching + optional API
 */

import { logSecurityEvent, SecurityEventTypes } from './securityLogger'

/**
 * Profanity word list (basic filter)
 * In production, consider using a comprehensive library like 'bad-words'
 */
const profanityList = [
  'damn',
  'hell',
  'crap',
  'stupid',
  'idiot',
  'dumb',
  'shut up',
  'suck',
  'hate',
  // Add more as needed - keeping family-friendly threshold
  // For comprehensive list, use npm package: https://www.npmjs.com/package/bad-words
]

/**
 * Checks if text contains profanity
 * @param {string} text - Text to check
 * @returns {boolean} - True if profanity found
 */
function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false

  const lowerText = text.toLowerCase()

  return profanityList.some(word => {
    // Use word boundaries to avoid false positives
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lowerText)
  })
}

/**
 * Checks for inappropriate patterns in AI output
 * @param {string} text - Text to check
 * @returns {object} - { flagged: boolean, category?: string }
 */
function containsInappropriateContent(text) {
  if (!text || typeof text !== 'string') {
    return { flagged: false }
  }

  const inappropriatePatterns = [
    {
      category: 'violence',
      patterns: [
        /\b(kill|murder|die|death|blood|gore)\b/i,
        /\b(shoot|stab|attack|fight|hit)\b/i,
      ]
    },
    {
      category: 'bullying',
      patterns: [
        /\b(ugly|fat|skinny|dumb|stupid|loser)\b/i,
        /\b(worthless|useless|pathetic)\b/i,
      ]
    },
    {
      category: 'sexual',
      patterns: [
        /\b(sex|sexual|porn|naked)\b/i,
      ]
    },
    {
      category: 'hate_speech',
      patterns: [
        /\b(hate|racist|discriminat)\b/i,
      ]
    },
    {
      category: 'scary',
      patterns: [
        // Allow some scary elements for age-appropriate context
        // but flag extreme content
        /\b(terrifying|nightmare|horrifying)\b/i,
      ]
    }
  ]

  for (const { category, patterns } of inappropriatePatterns) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        // Some words are OK in certain contexts (e.g., "fight" in superhero story)
        // Use context-aware filtering
        return { flagged: true, category }
      }
    }
  }

  return { flagged: false }
}

/**
 * Checks if content is age-appropriate based on context
 * @param {string} text - Text to check
 * @param {string} gameContext - Game context (affects what's acceptable)
 * @returns {boolean} - True if appropriate
 */
function isAgeAppropriate(text, gameContext) {
  // Different games have different thresholds
  const contextRules = {
    'superhero-origin': {
      // Superheroes can mention "fight" and "defeat"
      allowedWords: ['fight', 'defeat', 'battle', 'save'],
      forbiddenWords: ['kill', 'murder', 'die', 'blood']
    },
    'family-movie': {
      // Movies can be mildly scary
      allowedWords: ['scary', 'spooky', 'creepy'],
      forbiddenWords: ['terrifying', 'horrifying', 'nightmare']
    },
    'roast-battle': {
      // Roasts can be cheeky but not mean
      allowedWords: ['silly', 'goofy', 'messy', 'stinky'],
      forbiddenWords: ['ugly', 'fat', 'stupid', 'dumb']
    },
    'default': {
      allowedWords: [],
      forbiddenWords: ['kill', 'murder', 'die', 'stupid', 'ugly', 'hate']
    }
  }

  const rules = contextRules[gameContext] || contextRules.default
  const lowerText = text.toLowerCase()

  // Check forbidden words
  for (const word of rules.forbiddenWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lowerText)) {
      return false
    }
  }

  return true
}

/**
 * Moderates AI-generated output before displaying to users
 * @param {string} content - AI-generated content
 * @param {string} gameContext - Game context for context-aware moderation
 * @returns {object} - { safe: boolean, content?: string, reason?: string }
 */
export async function moderateAIOutput(content, gameContext = 'default') {
  if (!content || typeof content !== 'string') {
    return {
      safe: false,
      content: null,
      reason: 'Invalid content'
    }
  }

  // Layer 1: Profanity filter
  if (containsProfanity(content)) {
    logSecurityEvent(SecurityEventTypes.PROFANITY_DETECTED, {
      gameContext,
      contentPreview: content.slice(0, 100)
    })

    return {
      safe: false,
      content: null,
      reason: 'Content contained inappropriate language'
    }
  }

  // Layer 2: Pattern matching for inappropriate content
  const { flagged, category } = containsInappropriateContent(content)
  if (flagged) {
    logSecurityEvent(SecurityEventTypes.INAPPROPRIATE_CONTENT, {
      gameContext,
      category,
      contentPreview: content.slice(0, 100)
    })

    return {
      safe: false,
      content: null,
      reason: `Content flagged: ${category}`
    }
  }

  // Layer 3: Age-appropriate check based on context
  if (!isAgeAppropriate(content, gameContext)) {
    logSecurityEvent(SecurityEventTypes.INAPPROPRIATE_CONTENT, {
      gameContext,
      category: 'age_inappropriate',
      contentPreview: content.slice(0, 100)
    })

    return {
      safe: false,
      content: null,
      reason: 'Content not age-appropriate for context'
    }
  }

  // Layer 4: Length validation (prevent token stuffing or generation issues)
  if (content.length > 10000) {
    return {
      safe: false,
      content: null,
      reason: 'Content too long (generation error)'
    }
  }

  if (content.length < 10) {
    return {
      safe: false,
      content: null,
      reason: 'Content too short (generation error)'
    }
  }

  // Layer 5: OpenAI Moderation API (optional, for high-risk features)
  // Only use for games like Roast Battle where safety is critical
  const enableAPIModeration = import.meta.env.VITE_ENABLE_API_MODERATION === 'true'
  const highRiskGames = ['roast-battle', 'dad-jokes']

  if (enableAPIModeration && highRiskGames.includes(gameContext)) {
    try {
      const moderationResult = await callOpenAIModerationAPI(content)

      if (moderationResult.flagged) {
        logSecurityEvent(SecurityEventTypes.API_MODERATION_FLAGGED, {
          gameContext,
          categories: moderationResult.categories,
          contentPreview: content.slice(0, 100)
        })

        return {
          safe: false,
          content: null,
          reason: 'Content flagged by moderation service'
        }
      }
    } catch (error) {
      // Don't fail if moderation API is down - log and continue
      logSecurityEvent(SecurityEventTypes.MODERATION_API_ERROR, {
        error: error.message,
        gameContext
      })
    }
  }

  // All checks passed - content is safe
  return { safe: true, content }
}

/**
 * Calls OpenAI Moderation API (optional feature for high-risk games)
 * @param {string} content - Content to moderate
 * @returns {object} - { flagged: boolean, categories?: object }
 */
async function callOpenAIModerationAPI(content) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ input: content })
    })

    if (!response.ok) {
      throw new Error(`Moderation API error: ${response.status}`)
    }

    const data = await response.json()
    return data.results[0]  // { flagged: boolean, categories: {...} }
  } catch (error) {
    console.error('Moderation API error:', error)
    throw error
  }
}

/**
 * Returns appropriate fallback content when moderation fails
 * @param {string} gameContext - Game context
 * @returns {string} - Fallback message
 */
export function getSafeFallback(gameContext) {
  const fallbacks = {
    'roast-battle': "Oops! My joke generator got stuck. Let's try again!",
    'dad-jokes': "Hmm, I couldn't think of a good joke. Ask me another!",
    'family-movie': "Sorry, I couldn't generate that scene. Let's create a different story!",
    'noisy-storybook': "Hmm, that story didn't work out. Let's pick a new theme!",
    'superhero-origin': "Oops! Let me try creating that superhero story again.",
    'comic-maker': "Something went wrong with that comic. Let's try different ideas!",
    'default': "Something went wrong. Let's try again!"
  }

  return fallbacks[gameContext] || fallbacks.default
}

/**
 * Moderates user input (different from AI output - more permissive)
 * Used for user-generated content in games
 * @param {string} input - User input
 * @returns {object} - { safe: boolean, reason?: string }
 */
export function moderateUserInput(input) {
  if (!input || typeof input !== 'string') {
    return { safe: true }
  }

  // Check for profanity
  if (containsProfanity(input)) {
    return {
      safe: false,
      reason: 'Please keep it family-friendly! 😊'
    }
  }

  // Check for obviously inappropriate content
  const { flagged, category } = containsInappropriateContent(input)
  if (flagged && ['sexual', 'hate_speech'].includes(category)) {
    return {
      safe: false,
      reason: "That doesn't seem appropriate. Let's try something else!"
    }
  }

  return { safe: true }
}

/**
 * Gets moderation statistics for review
 * @returns {object} - Statistics about moderated content
 */
export function getModerationStats() {
  const securityLog = JSON.parse(localStorage.getItem('security-log') || '[]')

  const moderationEvents = securityLog.filter(event =>
    [
      SecurityEventTypes.PROFANITY_DETECTED,
      SecurityEventTypes.INAPPROPRIATE_CONTENT,
      SecurityEventTypes.API_MODERATION_FLAGGED
    ].includes(event.type)
  )

  const stats = {
    total: moderationEvents.length,
    byCategory: {},
    byGame: {}
  }

  moderationEvents.forEach(event => {
    // Count by category
    const category = event.category || 'unknown'
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

    // Count by game
    const game = event.gameContext || 'unknown'
    stats.byGame[game] = (stats.byGame[game] || 0) + 1
  })

  return stats
}

/**
 * Checks if Grandma Mode is enabled (extra safe mode)
 * @returns {boolean} - True if Grandma Mode is on
 */
export function isGrandmaModeEnabled() {
  return localStorage.getItem('grandma-mode') === 'true'
}

/**
 * Sets Grandma Mode on or off
 * @param {boolean} enabled - True to enable, false to disable
 */
export function setGrandmaMode(enabled) {
  localStorage.setItem('grandma-mode', enabled ? 'true' : 'false')

  logSecurityEvent(SecurityEventTypes.SETTINGS_CHANGED, {
    setting: 'grandma-mode',
    value: enabled
  })
}

/**
 * Applies stricter moderation for Grandma Mode
 * @param {string} content - Content to check
 * @param {string} gameContext - Game context
 * @returns {object} - { safe: boolean, content?: string, reason?: string }
 */
export async function moderateWithGrandmaMode(content, gameContext) {
  // First apply standard moderation
  const standardResult = await moderateAIOutput(content, gameContext)

  if (!standardResult.safe) {
    return standardResult
  }

  // If Grandma Mode is enabled, apply stricter rules
  if (isGrandmaModeEnabled()) {
    // Extra strict word list
    const strictWords = [
      'fight', 'battle', 'scary', 'spooky', 'creepy',
      'angry', 'mad', 'yell', 'scream'
    ]

    const lowerContent = content.toLowerCase()
    for (const word of strictWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i')
      if (regex.test(lowerContent)) {
        logSecurityEvent(SecurityEventTypes.INAPPROPRIATE_CONTENT, {
          gameContext,
          category: 'grandma_mode_strict',
          word,
          contentPreview: content.slice(0, 100)
        })

        return {
          safe: false,
          content: null,
          reason: 'Content too intense for Extra Safe mode'
        }
      }
    }
  }

  return standardResult
}
