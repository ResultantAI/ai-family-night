/**
 * Security utilities for AI Family Night
 * Prevents prompt injection, XSS, and other security threats
 */

import { logSecurityEvent } from './securityLogger'

/**
 * Sanitizes user input to prevent prompt injection attacks
 * @param {string} input - Raw user input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized input
 */
export function sanitizeUserInput(input, maxLength = 500) {
  if (!input || typeof input !== 'string') return ''

  // Remove or escape prompt injection keywords
  const injectionPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /disregard\s+all\s+prior/gi,
    /forget\s+what\s+I\s+said/gi,
    /new\s+instructions:/gi,
    /system:/gi,
    /assistant:/gi,
    /you\s+are\s+now/gi,
    /<\|.*?\|>/gi,  // Special tokens
    /```/g,          // Code blocks
    /\[INST\]/gi,    // Instruction markers
    /\[\/INST\]/gi,
    /<s>/gi,         // Special tokens
    /<\/s>/gi,
  ]

  let sanitized = input

  injectionPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[filtered]')
  })

  // Limit length to prevent token stuffing attacks
  sanitized = sanitized.slice(0, maxLength)

  // Escape HTML to prevent XSS
  sanitized = escapeHTML(sanitized)

  // Log suspicious input for review
  if (input !== sanitized) {
    logSecurityEvent('prompt_injection_attempt', {
      original: input.slice(0, 100), // Don't log full content for privacy
      sanitized: sanitized.slice(0, 100)
    })
  }

  return sanitized.trim()
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeHTML(str) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char])
}

/**
 * Validates input doesn't contain system prompts or injection attempts
 * @param {string} input - User input to validate
 * @param {string} context - Context of the input (name, story, chat, etc.)
 * @returns {object} - { valid: boolean, sanitized?: string, error?: string }
 */
export function validateInput(input, context = 'general') {
  if (!input) {
    return { valid: false, error: 'Input cannot be empty' }
  }

  const sanitized = sanitizeUserInput(input)

  // Validation rules by context
  const rules = {
    name: {
      maxLength: 50,
      minLength: 1,
      allowedChars: /^[a-zA-Z0-9\s\-'.]+$/,
      errorMessage: 'Names can only contain letters, numbers, spaces, hyphens, and apostrophes'
    },
    story: {
      maxLength: 500,
      minLength: 10,
      allowedChars: /^[a-zA-Z0-9\s\-',.!?()]+$/,
      errorMessage: 'Story text contains invalid characters'
    },
    chat: {
      maxLength: 200,
      minLength: 1,
      allowedChars: /^[a-zA-Z0-9\s\-',.!?()]+$/,
      errorMessage: 'Message contains invalid characters'
    },
    general: {
      maxLength: 500,
      minLength: 1,
      allowedChars: /^[a-zA-Z0-9\s\-',.!?()]+$/,
      errorMessage: 'Input contains invalid characters'
    }
  }

  const rule = rules[context] || rules.general

  // Check length
  if (sanitized.length > rule.maxLength) {
    return {
      valid: false,
      error: `Input too long (max ${rule.maxLength} characters)`
    }
  }

  if (sanitized.length < rule.minLength) {
    return {
      valid: false,
      error: `Input too short (min ${rule.minLength} characters)`
    }
  }

  // Check allowed characters
  if (rule.allowedChars && !rule.allowedChars.test(sanitized)) {
    return {
      valid: false,
      error: rule.errorMessage
    }
  }

  return { valid: true, sanitized }
}

/**
 * Checks if input contains suspicious patterns
 * @param {string} input - Input to check
 * @returns {boolean} - True if suspicious
 */
export function isSuspiciousInput(input) {
  const suspiciousPatterns = [
    /ignore/i,
    /system/i,
    /instruction/i,
    /prompt/i,
    /<script/i,
    /javascript:/i,
    /on\w+=/i,  // Event handlers like onclick=
    /eval\(/i,
    /function\s*\(/i,
  ]

  return suspiciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Validates array of inputs (for games with multiple fields)
 * @param {object} inputs - Object with input values
 * @param {object} contexts - Object mapping field names to validation contexts
 * @returns {object} - { valid: boolean, errors?: object, sanitized?: object }
 */
export function validateMultipleInputs(inputs, contexts) {
  const errors = {}
  const sanitized = {}
  let allValid = true

  for (const [field, value] of Object.entries(inputs)) {
    const context = contexts[field] || 'general'
    const result = validateInput(value, context)

    if (!result.valid) {
      errors[field] = result.error
      allValid = false
    } else {
      sanitized[field] = result.sanitized
    }
  }

  if (!allValid) {
    return { valid: false, errors }
  }

  return { valid: true, sanitized }
}

/**
 * Generates a safe ID for storage (prevents path traversal)
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Safe ID
 */
export function generateSafeId(prefix = 'item') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Sanitizes filename for download (prevents path traversal)
 * @param {string} filename - Original filename
 * @returns {string} - Safe filename
 */
export function sanitizeFilename(filename) {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100)
}

/**
 * Validates that localStorage is available and working
 * @returns {boolean} - True if localStorage is available
 */
export function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Safely gets item from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} - Stored value or default
 */
export function safeGetStorage(key, defaultValue = null) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available')
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Failed to read from localStorage:', error)
    return defaultValue
  }
}

/**
 * Safely sets item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} - True if successful
 */
export function safeSetStorage(key, value) {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available')
    return false
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Failed to write to localStorage:', error)
    return false
  }
}
