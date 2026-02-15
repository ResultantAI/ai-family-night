import { useState, useEffect, useRef } from 'react'
import { SpeakerWaveIcon, StopIcon } from '@heroicons/react/24/outline'
import AgeButton from './AgeButton'

/**
 * ReadAloud Component
 *
 * Uses ElevenLabs API for high-quality, natural-sounding text-to-speech.
 * Falls back to browser TTS if API fails.
 *
 * Addresses focus group feedback: "I can't read the story it made" (Bella, 6)
 *
 * Features:
 * - ElevenLabs AI voice (Rachel - warm, friendly female)
 * - Browser-native fallback (works offline)
 * - Pause/resume capability
 * - Visual feedback (speaking/paused/stopped)
 * - Age-appropriate reading speed
 *
 * Usage:
 * <ReadAloud text={storyText} />
 */

export default function ReadAloud({
  text,
  className = '',
  variant = 'primary'
}) {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usingBrowserTTS, setUsingBrowserTTS] = useState(false)

  const audioRef = useRef(null)
  const utteranceRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speakWithElevenLabs = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call our serverless function
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 429) {
          throw new Error('Monthly voice limit reached. Using browser voice.')
        }

        throw new Error(errorData.error || 'Failed to generate audio')
      }

      // Get audio blob
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create audio element
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => {
        setSpeaking(true)
        setPaused(false)
        setLoading(false)
      }

      audio.onended = () => {
        setSpeaking(false)
        setPaused(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setSpeaking(false)
        setLoading(false)
        URL.revokeObjectURL(audioUrl)
        throw new Error('Audio playback failed')
      }

      await audio.play()

    } catch (err) {
      console.warn('ElevenLabs TTS failed, falling back to browser TTS:', err.message)
      setError(err.message)
      setLoading(false)

      // Fallback to browser TTS
      speakWithBrowserTTS()
    }
  }

  const speakWithBrowserTTS = () => {
    setUsingBrowserTTS(true)

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    utterance.rate = 0.9  // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setSpeaking(true)
      setPaused(false)
      setLoading(false)
    }

    utterance.onend = () => {
      setSpeaking(false)
      setPaused(false)
      setUsingBrowserTTS(false)
    }

    utterance.onerror = (event) => {
      console.error('Browser TTS error:', event)
      setSpeaking(false)
      setPaused(false)
      setUsingBrowserTTS(false)
      setError('Could not read text aloud')
    }

    window.speechSynthesis.speak(utterance)
  }

  const speak = async () => {
    // If already speaking, stop
    if (speaking) {
      stop()
      return
    }

    // Clear any previous errors
    setError(null)

    // Try ElevenLabs first
    await speakWithElevenLabs()
  }

  const togglePause = () => {
    if (!speaking) return

    if (usingBrowserTTS) {
      // Browser TTS pause/resume
      if (paused) {
        window.speechSynthesis.resume()
        setPaused(false)
      } else {
        window.speechSynthesis.pause()
        setPaused(true)
      }
    } else if (audioRef.current) {
      // ElevenLabs audio pause/resume
      if (paused) {
        audioRef.current.play()
        setPaused(false)
      } else {
        audioRef.current.pause()
        setPaused(true)
      }
    }
  }

  const stop = () => {
    if (usingBrowserTTS) {
      window.speechSynthesis.cancel()
      setUsingBrowserTTS(false)
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    setSpeaking(false)
    setPaused(false)
    setLoading(false)
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AgeButton
        onClick={speak}
        variant={speaking || loading ? 'secondary' : variant}
        className="flex items-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </>
        ) : speaking ? (
          <>
            <StopIcon className="w-5 h-5" />
            Stop Reading
          </>
        ) : (
          <>
            <SpeakerWaveIcon className="w-5 h-5" />
            Read to Me
          </>
        )}
      </AgeButton>

      {speaking && !loading && (
        <button
          onClick={togglePause}
          className="text-sm text-purple-600 hover:text-purple-700 underline"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      )}

      {speaking && !loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs">
            {paused ? 'Paused' : 'Reading...'}
          </span>
        </div>
      )}

      {error && !speaking && (
        <div className="text-xs text-orange-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{usingBrowserTTS ? 'Using backup voice' : error}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Inline variant - Just an icon button
 */
export function ReadAloudIcon({ text, className = '' }) {
  const [speaking, setSpeaking] = useState(false)

  const toggleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setSpeaking(true)
    }
  }

  return (
    <button
      onClick={toggleSpeak}
      className={`p-2 rounded-full hover:bg-purple-100 transition-colors ${className}`}
      aria-label={speaking ? 'Stop reading' : 'Read aloud'}
    >
      {speaking ? (
        <StopIcon className="w-5 h-5 text-purple-600" />
      ) : (
        <SpeakerWaveIcon className="w-5 h-5 text-purple-600" />
      )}
    </button>
  )
}
