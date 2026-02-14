import { useEffect, useRef } from 'react'

/**
 * Auto-save hook that persists state to localStorage
 * @param {string} key - Unique key for this game/component
 * @param {any} value - The state value to save
 * @param {number} delay - Debounce delay in ms (default 1000ms)
 */
export function useAutoSave(key, value, delay = 1000) {
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout to save after delay
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        console.log(`✅ Auto-saved: ${key}`)
      } catch (error) {
        console.error('Failed to auto-save:', error)
      }
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key, value, delay])
}

/**
 * Load saved state from localStorage
 * @param {string} key - Unique key for this game/component
 * @param {any} defaultValue - Default value if nothing is saved
 * @returns {any} The saved value or default value
 */
export function loadSavedState(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (error) {
    console.error('Failed to load saved state:', error)
    return defaultValue
  }
}

/**
 * Clear saved state from localStorage
 * @param {string} key - Unique key to clear
 */
export function clearSavedState(key) {
  try {
    localStorage.removeItem(key)
    console.log(`🗑️ Cleared saved state: ${key}`)
  } catch (error) {
    console.error('Failed to clear saved state:', error)
  }
}

/**
 * Save a completed creation to the gallery
 * @param {object} creation - The creation object {gameName, data, timestamp}
 */
export function saveToGallery(creation) {
  try {
    const gallery = JSON.parse(localStorage.getItem('creations-gallery') || '[]')
    const newCreation = {
      id: Date.now(),
      ...creation,
      timestamp: new Date().toISOString()
    }
    gallery.unshift(newCreation) // Add to beginning

    // Keep only last 50 creations
    const trimmed = gallery.slice(0, 50)

    localStorage.setItem('creations-gallery', JSON.stringify(trimmed))
    console.log('🎨 Saved to gallery:', newCreation.gameName)
    return newCreation
  } catch (error) {
    console.error('Failed to save to gallery:', error)
    return null
  }
}

/**
 * Get all creations from gallery
 * @returns {array} Array of creation objects
 */
export function getGallery() {
  try {
    return JSON.parse(localStorage.getItem('creations-gallery') || '[]')
  } catch (error) {
    console.error('Failed to load gallery:', error)
    return []
  }
}

/**
 * Delete a creation from gallery
 * @param {number} id - Creation ID to delete
 */
export function deleteFromGallery(id) {
  try {
    const gallery = JSON.parse(localStorage.getItem('creations-gallery') || '[]')
    const filtered = gallery.filter(item => item.id !== id)
    localStorage.setItem('creations-gallery', JSON.stringify(filtered))
    console.log('🗑️ Deleted from gallery:', id)
  } catch (error) {
    console.error('Failed to delete from gallery:', error)
  }
}
