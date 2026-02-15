/**
 * Security event logging for AI Family Night
 * Monitors and logs security-related events for review
 */

/**
 * Security event types
 */
export const SecurityEventTypes = {
  PROMPT_INJECTION_ATTEMPT: 'prompt_injection_attempt',
  PROFANITY_DETECTED: 'profanity_detected',
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  API_MODERATION_FLAGGED: 'api_moderation_flagged',
  MODERATION_API_ERROR: 'moderation_api_error',
  INPUT_VALIDATION_FAILED: 'input_validation_failed',
  XSS_ATTEMPT: 'xss_attempt',
  SUSPICIOUS_PATTERN: 'suspicious_pattern',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
}

/**
 * Logs security events for monitoring and debugging
 * @param {string} eventType - Type of security event
 * @param {object} metadata - Additional event metadata
 */
export function logSecurityEvent(eventType, metadata = {}) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...metadata
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('[SECURITY EVENT]', event)
  }

  // Store locally for review
  try {
    const log = JSON.parse(localStorage.getItem('security-log') || '[]')
    log.unshift(event)

    // Keep last 50 events
    const trimmed = log.slice(0, 50)
    localStorage.setItem('security-log', JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to log security event:', error)
  }

  // TODO: In production, send critical events to backend analytics
  // if (shouldReportToBackend(eventType)) {
  //   sendToAnalytics(event)
  // }
}

/**
 * Retrieves security log
 * @param {string} eventTypeFilter - Optional filter by event type
 * @returns {array} - Array of security events
 */
export function getSecurityLog(eventTypeFilter = null) {
  try {
    const log = JSON.parse(localStorage.getItem('security-log') || '[]')

    if (eventTypeFilter) {
      return log.filter(event => event.type === eventTypeFilter)
    }

    return log
  } catch (error) {
    console.error('Failed to retrieve security log:', error)
    return []
  }
}

/**
 * Clears security log
 */
export function clearSecurityLog() {
  try {
    localStorage.removeItem('security-log')
    return true
  } catch (error) {
    console.error('Failed to clear security log:', error)
    return false
  }
}

/**
 * Gets security event statistics
 * @returns {object} - Statistics by event type
 */
export function getSecurityStats() {
  const log = getSecurityLog()

  const stats = {
    total: log.length,
    byType: {},
    last24Hours: 0,
    lastWeek: 0
  }

  const now = Date.now()
  const oneDayAgo = now - (24 * 60 * 60 * 1000)
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

  log.forEach(event => {
    // Count by type
    stats.byType[event.type] = (stats.byType[event.type] || 0) + 1

    // Count by time period
    const eventTime = new Date(event.timestamp).getTime()
    if (eventTime > oneDayAgo) {
      stats.last24Hours++
    }
    if (eventTime > oneWeekAgo) {
      stats.lastWeek++
    }
  })

  return stats
}

/**
 * Checks if there are unusual security patterns
 * @returns {object} - { alert: boolean, reason?: string }
 */
export function checkSecurityAlerts() {
  const stats = getSecurityStats()

  // Alert if more than 5 security events in last 24 hours
  if (stats.last24Hours > 5) {
    return {
      alert: true,
      reason: `${stats.last24Hours} security events detected in last 24 hours`
    }
  }

  // Alert if more than 3 prompt injection attempts
  const injectionAttempts = stats.byType[SecurityEventTypes.PROMPT_INJECTION_ATTEMPT] || 0
  if (injectionAttempts > 3) {
    return {
      alert: true,
      reason: `${injectionAttempts} prompt injection attempts detected`
    }
  }

  return { alert: false }
}

/**
 * Determines if event should be reported to backend
 * @param {string} eventType - Type of security event
 * @returns {boolean} - True if should report
 */
function shouldReportToBackend(eventType) {
  // In production, report critical events to backend for monitoring
  const criticalEvents = [
    SecurityEventTypes.PROMPT_INJECTION_ATTEMPT,
    SecurityEventTypes.INAPPROPRIATE_CONTENT,
    SecurityEventTypes.API_MODERATION_FLAGGED,
    SecurityEventTypes.XSS_ATTEMPT,
  ]

  return criticalEvents.includes(eventType)
}

/**
 * Sends security event to analytics backend (placeholder)
 * @param {object} event - Security event
 */
async function sendToAnalytics(event) {
  // TODO: Implement backend analytics endpoint
  // Example:
  // try {
  //   await fetch('/api/security-events', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(event)
  //   })
  // } catch (error) {
  //   console.error('Failed to send security event to backend:', error)
  // }
}

/**
 * Exports security log as JSON for review
 * @returns {string} - JSON string of security log
 */
export function exportSecurityLog() {
  const log = getSecurityLog()
  const stats = getSecurityStats()

  const exportData = {
    exportDate: new Date().toISOString(),
    statistics: stats,
    events: log
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Downloads security log as file
 */
export function downloadSecurityLog() {
  const logData = exportSecurityLog()
  const blob = new Blob([logData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `security-log-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
