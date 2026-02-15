import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionDuration } from '../utils/age-appropriate'

/**
 * Enhanced Auto-save hook with age-appropriate intervals
 * - Ages 5-7: Every 30 seconds (short attention span)
 * - Ages 8-10: Every 60 seconds
 * - Ages 11-12: Every 120 seconds
 *
 * @param {string} key - Unique key for this game/component
 * @param {any} value - The state value to save
 * @param {object} options - { useSupabase: boolean, gameId: string }
 * @returns {object} { saveStatus, lastSaved, forceSave }
 */
export function useAutoSave(key, value, options = {}) {
  const { useSupabase = false, gameId = null } = options
  const timeoutRef = useRef(null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null)
  const [autoSaveInterval, setAutoSaveInterval] = useState(60000) // default 60s

  // Load child age and set auto-save interval
  useEffect(() => {
    const loadChildAge = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.child_age) {
        const age = parseInt(user.user_metadata.child_age)
        const { autoSaveInterval: intervalSeconds } = getSessionDuration(age)
        setAutoSaveInterval(intervalSeconds * 1000) // Convert to milliseconds
      }
    }
    loadChildAge()
  }, [])

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout to save after age-appropriate delay
    timeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving')

      try {
        if (useSupabase && gameId) {
          // Save to Supabase
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase
              .from('game_saves')
              .upsert({
                user_id: user.id,
                game_id: gameId,
                game_state: value,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,game_id'
              })
          }
        } else {
          // Save to localStorage
          localStorage.setItem(key, JSON.stringify(value))
        }

        setSaveStatus('saved')
        setLastSaved(new Date())
        console.log(`✅ Auto-saved: ${key}`)

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Failed to auto-save:', error)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    }, autoSaveInterval)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key, value, autoSaveInterval, useSupabase, gameId])

  // Force save function
  const forceSave = async () => {
    setSaveStatus('saving')

    try {
      if (useSupabase && gameId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('game_saves')
            .upsert({
              user_id: user.id,
              game_id: gameId,
              game_state: value,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,game_id'
            })
        }
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }

      setSaveStatus('saved')
      setLastSaved(new Date())
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to force save:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  return { saveStatus, lastSaved, forceSave }
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

/**
 * Auto-Save Indicator Component
 * Shows visual feedback for save status
 */
export function AutoSaveIndicator({ status, lastSaved, className = '' }) {
  if (status === 'idle' && !lastSaved) return null

  let icon = null
  let text = ''
  let color = ''

  switch (status) {
    case 'saving':
      icon = (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
      text = 'Saving...'
      color = 'text-blue-600'
      break
    case 'saved':
      icon = '✓'
      text = 'Saved'
      color = 'text-green-600'
      break
    case 'error':
      icon = '⚠️'
      text = 'Save failed'
      color = 'text-red-600'
      break
    default:
      if (lastSaved) {
        icon = '✓'
        text = `Saved ${getTimeAgo(lastSaved)}`
        color = 'text-gray-500'
      }
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${color} ${className}`}>
      {icon}
      <span>{text}</span>
    </div>
  )
}

/**
 * Helper: Get relative time (e.g., "2 minutes ago")
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 120) return '1 minute ago'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 7200) return '1 hour ago'
  return `${Math.floor(seconds / 3600)} hours ago`
}
