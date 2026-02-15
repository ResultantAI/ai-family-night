/**
 * Age-Appropriate UX Utilities
 * Based on Child-Computer Interaction (CCI) research
 *
 * Motor control precision develops until age 10
 * Working memory capacity varies significantly by age
 */

/**
 * Get recommended button size based on child's age
 * Research: Fat-finger problem is primary barrier for ages 5-7
 */
export function getButtonSize(childAge) {
  if (childAge >= 5 && childAge <= 7) {
    // "Mash Phase" - needs large targets
    return {
      className: 'btn-age-5-7',
      px: 76, // 2cm at standard DPI
      description: 'Extra large (76x76px minimum)'
    }
  } else if (childAge >= 8 && childAge <= 10) {
    // "Refinement Phase" - moderate precision
    return {
      className: 'btn-age-8-10',
      px: 57, // 1.5cm
      description: 'Large (57x57px minimum)'
    }
  } else {
    // Age 11-12 "Adult-Adjacent"
    return {
      className: 'btn-age-11-12',
      px: 44, // 1cm (Apple's minimum recommendation)
      description: 'Standard (44x44px minimum)'
    }
  }
}

/**
 * Get safe zone padding between interactive elements
 * Prevents accidental taps on adjacent buttons
 */
export function getSafeZonePadding(childAge) {
  if (childAge >= 5 && childAge <= 7) {
    return {
      className: 'safe-zone-5-7',
      px: 40, // 10-15mm
      description: 'Extra spacing'
    }
  } else if (childAge >= 8 && childAge <= 10) {
    return {
      className: 'safe-zone-8-10',
      px: 24,
      description: 'Moderate spacing'
    }
  } else {
    return {
      className: 'safe-zone-11-12',
      px: 16,
      description: 'Standard spacing'
    }
  }
}

/**
 * Get maximum number of primary choices to show
 * Reduces cognitive load - working memory limits
 */
export function getMaxChoices(childAge) {
  if (childAge >= 5 && childAge <= 7) {
    return 3 // Never more than 3 primary choices
  } else if (childAge >= 8 && childAge <= 10) {
    return 5
  } else {
    return 7
  }
}

/**
 * Get recommended session duration
 * Based on sustained attention span research
 */
export function getSessionDuration(childAge) {
  if (childAge >= 5 && childAge <= 7) {
    return {
      min: 3,
      ideal: 5,
      max: 12,
      autoSaveInterval: 30, // seconds
      description: '3-5 minute micro-episodes'
    }
  } else if (childAge >= 8 && childAge <= 10) {
    return {
      min: 5,
      ideal: 10,
      max: 20,
      autoSaveInterval: 60,
      description: '10 minute sessions with break points'
    }
  } else {
    return {
      min: 10,
      ideal: 20,
      max: 35,
      autoSaveInterval: 120,
      description: '20-30 minute sessions'
    }
  }
}

/**
 * Check if gesture is appropriate for age
 */
export function isGestureAppropriate(gesture, childAge) {
  const simpleGestures = ['tap', 'click', 'long-press']
  const moderateGestures = ['drag', 'swipe']
  const complexGestures = ['pinch', 'rotate', 'multi-touch']

  if (childAge >= 5 && childAge <= 7) {
    return simpleGestures.includes(gesture)
  } else if (childAge >= 8 && childAge <= 10) {
    return [...simpleGestures, ...moderateGestures].includes(gesture)
  } else {
    return true // All gestures OK for 11-12
  }
}

/**
 * Get latency tolerance thresholds
 * Kids perceive delays differently than adults
 */
export const LATENCY_THRESHOLDS = {
  BUTTON_FEEDBACK: 100, // 0.1s - Must show visual/haptic feedback
  TRANSITION: 1000, // 1.0s - Max for screen transitions
  LOADING_ABSOLUTE: 10000, // 10s - Absolute max before abandonment
}

/**
 * Generate age-appropriate button classes
 * Returns Tailwind classes based on child age
 */
export function getButtonClasses(childAge, variant = 'primary') {
  const baseClasses = 'font-semibold rounded-xl transition-all active:scale-95'

  // Size classes based on age
  let sizeClasses = ''
  if (childAge >= 5 && childAge <= 7) {
    sizeClasses = 'min-w-[76px] min-h-[76px] px-8 py-6 text-xl'
  } else if (childAge >= 8 && childAge <= 10) {
    sizeClasses = 'min-w-[57px] min-h-[57px] px-6 py-4 text-lg'
  } else {
    sizeClasses = 'min-w-[44px] min-h-[44px] px-4 py-3 text-base'
  }

  // Variant-specific colors
  let variantClasses = ''
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
      break
    case 'secondary':
      variantClasses = 'bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600'
      break
    case 'success':
      variantClasses = 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
      break
    case 'danger':
      variantClasses = 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
      break
    default:
      variantClasses = 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  }

  return `${baseClasses} ${sizeClasses} ${variantClasses}`
}

/**
 * Get grid spacing classes for age
 * Ensures safe zones between interactive elements
 */
export function getGridGapClasses(childAge) {
  if (childAge >= 5 && childAge <= 7) {
    return 'gap-10' // 40px gap
  } else if (childAge >= 8 && childAge <= 10) {
    return 'gap-6' // 24px gap
  } else {
    return 'gap-4' // 16px gap
  }
}

/**
 * Check if feature requires literacy
 * Returns true if feature should have voice input option
 */
export function requiresLiteracySupport(childAge) {
  return childAge >= 5 && childAge <= 8
}

/**
 * Get font size recommendations
 */
export function getFontSizeClasses(childAge, element = 'body') {
  if (childAge >= 5 && childAge <= 7) {
    return {
      heading: 'text-4xl md:text-5xl',
      subheading: 'text-2xl md:text-3xl',
      body: 'text-xl',
      small: 'text-lg'
    }[element]
  } else if (childAge >= 8 && childAge <= 10) {
    return {
      heading: 'text-3xl md:text-4xl',
      subheading: 'text-xl md:text-2xl',
      body: 'text-lg',
      small: 'text-base'
    }[element]
  } else {
    return {
      heading: 'text-2xl md:text-3xl',
      subheading: 'text-lg md:text-xl',
      body: 'text-base',
      small: 'text-sm'
    }[element]
  }
}
