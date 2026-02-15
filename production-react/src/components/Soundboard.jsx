import { useState } from 'react'
import { SpeakerWaveIcon } from '@heroicons/react/24/solid'

/**
 * Soundboard component for Movie Magic
 * Adds fun sound effects for family table reads and TikTok videos
 *
 * Focus Group Feedback: Maya (14) - "Can we add sound effects? Makes videos funnier!"
 */
export default function Soundboard() {
  const [activeSound, setActiveSound] = useState(null)

  /**
   * Play sound using Web Audio API
   * Generates sound effects programmatically (no files needed!)
   */
  const playSound = (soundType) => {
    setActiveSound(soundType)
    setTimeout(() => setActiveSound(null), 300)

    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const now = audioContext.currentTime

    switch (soundType) {
      case 'laugh':
        playLaughTrack(audioContext, now)
        break
      case 'dramatic':
        playDramaticSting(audioContext, now)
        break
      case 'boo':
        playBooHiss(audioContext, now)
        break
      case 'applause':
        playApplause(audioContext, now)
        break
      case 'crickets':
        playCrickets(audioContext, now)
        break
      case 'rimshot':
        playRimshot(audioContext, now)
        break
      default:
        break
    }
  }

  /**
   * Laugh Track - Sitcom style
   */
  const playLaughTrack = (context, startTime) => {
    // Create white noise for laugh effect
    const duration = 1.5
    const bufferSize = context.sampleRate * duration
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate noise with envelope
    for (let i = 0; i < bufferSize; i++) {
      const t = i / context.sampleRate
      const envelope = Math.exp(-t * 3) // Decay envelope
      data[i] = (Math.random() * 2 - 1) * envelope * 0.3
    }

    const source = context.createBufferSource()
    source.buffer = buffer

    const filter = context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1200
    filter.Q.value = 2

    const gain = context.createGain()
    gain.gain.value = 0.4

    source.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)

    source.start(startTime)
  }

  /**
   * Dramatic Dun-Dun-Dun! - Three descending ominous notes
   */
  const playDramaticSting = (context, startTime) => {
    const notes = [220, 185, 165] // Descending notes (A, F#, E)

    notes.forEach((freq, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sawtooth'
      oscillator.frequency.value = freq

      const noteStart = startTime + (index * 0.35)
      const noteEnd = noteStart + 0.3

      gain.gain.setValueAtTime(0, noteStart)
      gain.gain.linearRampToValueAtTime(0.5, noteStart + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, noteEnd)

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start(noteStart)
      oscillator.stop(noteEnd)
    })
  }

  /**
   * Boo / Hiss - Audience disapproval
   */
  const playBooHiss = (context, startTime) => {
    // Create filtered noise for "boo" effect
    const duration = 1.2
    const bufferSize = context.sampleRate * duration
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const source = context.createBufferSource()
    source.buffer = buffer

    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 300

    const gain = context.createGain()
    gain.gain.setValueAtTime(0.3, startTime)
    gain.gain.linearRampToValueAtTime(0, startTime + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)

    source.start(startTime)
  }

  /**
   * Applause - Clapping sound
   */
  const playApplause = (context, startTime) => {
    const duration = 2
    const bufferSize = context.sampleRate * duration
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate applause-like random bursts
    for (let i = 0; i < bufferSize; i++) {
      const t = i / context.sampleRate
      const burst = Math.sin(t * 30) > 0.7 ? 1 : 0
      const envelope = 1 - Math.exp(-t * 2) * Math.exp(-t * 0.5)
      data[i] = (Math.random() * 2 - 1) * burst * envelope * 0.3
    }

    const source = context.createBufferSource()
    source.buffer = buffer

    const filter = context.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 200

    const gain = context.createGain()
    gain.gain.value = 0.5

    source.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)

    source.start(startTime)
  }

  /**
   * Crickets - Awkward silence / bad joke
   */
  const playCrickets = (context, startTime) => {
    // Create cricket chirp sound
    const chirpCount = 4

    for (let i = 0; i < chirpCount; i++) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = 4000 + (Math.random() * 500)

      const chirpStart = startTime + (i * 0.4) + (Math.random() * 0.1)
      const chirpEnd = chirpStart + 0.05

      gain.gain.setValueAtTime(0, chirpStart)
      gain.gain.linearRampToValueAtTime(0.2, chirpStart + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.01, chirpEnd)

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start(chirpStart)
      oscillator.stop(chirpEnd)
    }
  }

  /**
   * Rimshot - Ba-dum-tss! (drum joke punctuation)
   */
  const playRimshot = (context, startTime) => {
    // Bass drum
    const bass = context.createOscillator()
    const bassGain = context.createGain()
    bass.type = 'sine'
    bass.frequency.value = 100
    bassGain.gain.setValueAtTime(0.8, startTime)
    bassGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
    bass.connect(bassGain)
    bassGain.connect(context.destination)
    bass.start(startTime)
    bass.stop(startTime + 0.15)

    // Snare drum (second hit)
    const snare1 = context.createOscillator()
    const snare1Gain = context.createGain()
    snare1.type = 'triangle'
    snare1.frequency.value = 200
    snare1Gain.gain.setValueAtTime(0.5, startTime + 0.15)
    snare1Gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25)
    snare1.connect(snare1Gain)
    snare1Gain.connect(context.destination)
    snare1.start(startTime + 0.15)
    snare1.stop(startTime + 0.25)

    // Cymbal "tss" (white noise)
    const bufferSize = context.sampleRate * 0.5
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
    const cymbal = context.createBufferSource()
    cymbal.buffer = buffer
    const cymbalFilter = context.createBiquadFilter()
    cymbalFilter.type = 'highpass'
    cymbalFilter.frequency.value = 5000
    const cymbalGain = context.createGain()
    cymbalGain.gain.setValueAtTime(0.3, startTime + 0.25)
    cymbalGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5)
    cymbal.connect(cymbalFilter)
    cymbalFilter.connect(cymbalGain)
    cymbalGain.connect(context.destination)
    cymbal.start(startTime + 0.25)
  }

  const sounds = [
    { id: 'laugh', emoji: '😂', label: 'Laugh Track', color: 'from-yellow-400 to-orange-400' },
    { id: 'dramatic', emoji: '🎺', label: 'Dun-Dun-Dun!', color: 'from-purple-400 to-indigo-400' },
    { id: 'boo', emoji: '👎', label: 'Boo / Hiss', color: 'from-red-400 to-pink-400' },
    { id: 'applause', emoji: '👏', label: 'Applause', color: 'from-green-400 to-emerald-400' },
    { id: 'crickets', emoji: '🦗', label: 'Crickets', color: 'from-gray-400 to-slate-400' },
    { id: 'rimshot', emoji: '🥁', label: 'Rimshot', color: 'from-blue-400 to-cyan-400' }
  ]

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <SpeakerWaveIcon className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Sound Effects</h3>
        <span className="text-sm text-gray-500 ml-2">Tap to play!</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => playSound(sound.id)}
            className={`
              p-4 rounded-xl border-2 transition-all transform
              ${activeSound === sound.id
                ? 'scale-95 border-purple-500 bg-purple-100'
                : 'border-purple-200 bg-white hover:border-purple-400 hover:scale-105'
              }
              shadow-md hover:shadow-lg active:scale-95
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">{sound.emoji}</span>
              <span className="text-sm font-semibold text-gray-700">{sound.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Perfect for family table reads and TikTok videos!
      </div>
    </div>
  )
}
