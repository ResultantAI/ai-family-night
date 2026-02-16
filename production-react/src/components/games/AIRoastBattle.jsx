import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FireIcon,
  MicrophoneIcon,
  StopIcon,
  ArrowLeftIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { isGrandmaModeEnabled } from '../../utils/moderation'

/**
 * AI Roast Battle - Comedy game for kids with safety rails
 *
 * Focus Group Feedback:
 * - Leo (11): "Hey AI, you're so slow, you race glaciers!" → EXPLOSIVE LAUGHTER
 * - Maya (14): "I'd do this at sleepovers to see who gets AI to say weirdest thing."
 * - Sarah (Skeptical Mom): "Need 'Grandma Mode'. If AI bullies my kid, I'm deleting."
 * - David (Tech Dad): "Comedy depends on SPEED. 6-second spinner kills the joke."
 *
 * Safety Requirements:
 * - G-rated roasts only
 * - No appearance, weight, intelligence insults
 * - Targets: gaming skills, messy room, smelly socks, corny jokes
 * - Tone: SpongeBob/Muppets level - cheeky but harmless
 */
export default function AIRoastBattle() {
  // Check if Extra Safe Mode is enabled and set game titles dynamically
  const grandmaMode = isGrandmaModeEnabled()
  const gameTitle = grandmaMode ? 'AI Joke Challenge' : 'AI Roast Battle'
  const roastModeLabel = grandmaMode ? 'Joke Challenge' : 'Roast Battle'

  const [gameMode, setGameMode] = useState('roast') // 'roast' or 'dad-jokes'
  const [playerName, setPlayerName] = useState('')
  const [aiVoice, setAIVoice] = useState('male') // 'male' or 'female'
  const [gameStarted, setGameStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [maxRounds] = useState(5)

  const [playerInput, setPlayerInput] = useState('')
  const [interimInput, setInterimInput] = useState('') // Show what user is saying in real-time
  const [isListening, setIsListening] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [aiResponse, setAIResponse] = useState('')
  const [burnScore, setBurnScore] = useState(null)
  const [autoListen, setAutoListen] = useState(true) // Auto-start listening after AI speaks
  const [showConfirm, setShowConfirm] = useState(false) // Show confirmation after user speaks

  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAIScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)

  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  const currentAudioRef = useRef(null) // Track current playing audio to prevent overlaps
  const isProcessingRef = useRef(false) // Track if AI is currently thinking or speaking
  const silenceTimeoutRef = useRef(null) // Track silence after user stops speaking
  const audioContextRef = useRef(null) // For boxing bell sound effect

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true // Keep listening for complete thought
      recognitionRef.current.interimResults = true // Show what user is saying in real-time
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        // CRITICAL FIX: Only process if AI is not currently working
        if (isProcessingRef.current) {
          console.warn('Ignoring voice input - AI is still processing')
          return
        }

        let interimTranscript = ''
        let finalTranscript = ''

        // Build complete transcript from all results
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Show what user is saying in real-time (interim + final)
        const displayText = (finalTranscript + interimTranscript).trim()
        if (displayText) {
          setPlayerInput(displayText)
        }

        // If we got a final result, start silence countdown
        if (finalTranscript.trim()) {
          // Clear any existing timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
          }

          // Wait 2 seconds of silence, then submit
          silenceTimeoutRef.current = setTimeout(() => {
            const finalText = (finalTranscript + interimTranscript).trim()
            if (finalText && recognitionRef.current) {
              try {
                recognitionRef.current.stop()
              } catch (e) {
                console.warn('Error stopping recognition:', e)
              }
              setIsListening(false)
              setInterimInput('')
              handleSubmitRoast(finalText)
            }
          }, 2000) // 2 second silence before submitting
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setInterimInput('')
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
        }
        setError('Microphone error. Try typing instead!')
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setInterimInput('')
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
        }
      }
    }

    // Cleanup: Stop all audio when component unmounts
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause()
          currentAudioRef.current.currentTime = 0
        } catch (err) {
          console.warn('Cleanup audio error:', err)
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          console.warn('Cleanup recognition error:', err)
        }
      }
    }
  }, [])

  // Play boxing bell sound effect
  const playBell = () => {
    try {
      // Initialize AudioContext if not already created
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const now = ctx.currentTime

      // Create oscillator for bell sound (two tones for realistic bell)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gainNode = ctx.createGain()

      // Bell frequencies (metallic sound)
      osc1.frequency.value = 1200 // High tone
      osc2.frequency.value = 1800 // Higher harmonic

      // Connect oscillators to gain
      osc1.connect(gainNode)
      osc2.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Bell envelope (quick attack, long decay)
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8)

      // Play the bell
      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.8)
      osc2.stop(now + 0.8)

      console.log('🔔 Boxing bell!')
    } catch (err) {
      console.warn('Could not play bell sound:', err)
    }
  }

  const startGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name first!')
      return
    }
    setGameStarted(true)
    setError(null)

    // Start listening immediately when game starts (will play bell)
    setTimeout(() => {
      startListening()
    }, 1000) // Give user 1 second to get ready
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Voice input not supported on this browser. Try typing!')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setError(null)
      } catch (error) {
        console.error('Failed to start recognition:', error)
        setError('Microphone error. Try typing instead!')
      }
    }
  }

  const speakText = async (text) => {
    // CRITICAL FIX: Stop any currently playing audio to prevent overlaps
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
        currentAudioRef.current = null
      } catch (err) {
        console.warn('Error stopping previous audio:', err)
      }
    }

    // Always cancel browser speech synthesis first
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    // CRITICAL FIX: Stop voice recognition to prevent microphone from hearing AI voice
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (err) {
        console.warn('Error stopping recognition before speaking:', err)
      }
    }

    setIsAISpeaking(true)

    // Try ElevenLabs first for better quality
    try {
      // Use different voices based on selection
      const voiceId = aiVoice === 'male'
        ? 'pNInz6obpgDQGcFmaJgB' // Adam (deep, confident male)
        : 'EXAVITQu4vr4xnSDxMaL' // Bella (young female)

      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId // Pass custom voice ID
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        // Store reference to current audio
        currentAudioRef.current = audio

        await new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            currentAudioRef.current = null
            setIsAISpeaking(false)
            // CRITICAL FIX: Mark processing as complete
            isProcessingRef.current = false
            resolve()
          }

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl)
            currentAudioRef.current = null
            setIsAISpeaking(false)
            // CRITICAL FIX: Mark processing as complete
            isProcessingRef.current = false
            resolve()
          }

          audio.play().catch((err) => {
            console.warn('Audio play failed:', err)
            URL.revokeObjectURL(audioUrl)
            currentAudioRef.current = null
            setIsAISpeaking(false)
            // CRITICAL FIX: Mark processing as complete
            isProcessingRef.current = false
            resolve()
          })
        })

        // Auto-start listening for next round if enabled
        if (autoListen && !gameOver) {
          setTimeout(() => {
            startListening()
          }, 500) // Small delay before listening
        }
        return // Success!
      }
    } catch (err) {
      console.warn('ElevenLabs TTS failed, falling back to browser voice:', err)
    }

    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      // Cancel again to be extra safe
      window.speechSynthesis.cancel()

      // Small delay to ensure cancellation completes
      await new Promise(resolve => setTimeout(resolve, 100))

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = aiVoice === 'male' ? 0.8 : 1.2 // Lower for male, higher for female
      utterance.volume = 1.0

      // Try to select appropriate voice
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        if (aiVoice === 'male') {
          utterance.voice = voices.find(v => v.name.includes('Male') || v.name.includes('David')) || voices[0]
        } else {
          utterance.voice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha')) || voices[0]
        }
      }

      utterance.onend = () => {
        setIsAISpeaking(false)
        // CRITICAL FIX: Mark processing as complete
        isProcessingRef.current = false
        // Auto-start listening for next round if enabled
        if (autoListen && !gameOver) {
          setTimeout(() => {
            startListening()
          }, 500)
        }
      }

      utterance.onerror = () => {
        setIsAISpeaking(false)
        // CRITICAL FIX: Mark processing as complete
        isProcessingRef.current = false
      }

      window.speechSynthesis.speak(utterance)
    } else {
      // No speech synthesis available
      setIsAISpeaking(false)
      // CRITICAL FIX: Mark processing as complete
      isProcessingRef.current = false
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Voice input not supported on this browser.')
      return
    }

    if (!isListening && !isAISpeaking && !isAIThinking) {
      try {
        // Play boxing bell at the start of each round (including round 1!)
        if (gameStarted) {
          playBell()
        }

        // Clear previous input when starting new listening session
        setPlayerInput('')
        setInterimInput('')
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
        }

        recognitionRef.current.start()
        setIsListening(true)
        setError(null)
      } catch (error) {
        console.error('Failed to start recognition:', error)
      }
    }
  }

  const handleSubmitRoast = async (voiceInput = null) => {
    const input = voiceInput || playerInput
    if (!input.trim()) {
      setError('Say something first!')
      // Restart listening
      setTimeout(() => startListening(), 1000)
      return
    }

    // CRITICAL FIX: Prevent multiple simultaneous submissions
    if (isProcessingRef.current) {
      console.warn('AI is already processing, ignoring duplicate submission')
      return
    }

    // CRITICAL FIX: Stop voice recognition immediately to prevent it from hearing the AI
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (err) {
        console.warn('Error stopping recognition:', err)
      }
    }

    setPlayerInput(input) // Update display

    // Mark as processing
    isProcessingRef.current = true

    setIsAIThinking(true)
    setError(null)

    try {
      // Call our serverless API endpoint for roast generation
      const response = await fetch('/api/generate-roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userInput: input,
          playerName,
          round,
          mode: gameMode
        })
      })

      const result = await response.json()

      if (!result.success) {
        // Fallback roast - use backup jokes (no error needed, game continues smoothly)
        const fallbackResponse = getFallbackResponse(gameMode)
        const fallbackScore = Math.floor(Math.random() * 5) + 3 // Random 3-7
        setAIResponse(fallbackResponse)
        setBurnScore(fallbackScore)

        // Speak the fallback roast too!
        speakText(fallbackResponse)

        // Update scores
        const playerRoundScore = Math.floor(Math.random() * 10) + 1
        setPlayerScore(prev => prev + playerRoundScore)
        setAIScore(prev => prev + fallbackScore)

        // Add to history
        setHistory(prev => [...prev, {
          round,
          player: input,
          playerScore: playerRoundScore,
          ai: fallbackResponse,
          aiScore: fallbackScore
        }])

        // Check if game over
        if (round >= maxRounds) {
          setGameOver(true)
          const finalPlayerScore = playerScore + playerRoundScore
          const finalAIScore = aiScore + fallbackScore
          setWinner(finalPlayerScore > finalAIScore ? 'player' : 'ai')
        } else {
          setRound(prev => prev + 1)
        }
      } else {
        // Parse response and score
        const { roast, score } = parseAIResponse(result.content)
        setAIResponse(roast)
        setBurnScore(score)

        // Speak the roast
        speakText(roast)

        // Update scores
        const playerRoundScore = Math.floor(Math.random() * 10) + 1
        setPlayerScore(prev => prev + playerRoundScore)
        setAIScore(prev => prev + score)

        // Add to history
        setHistory(prev => [...prev, {
          round,
          player: playerInput,
          playerScore: playerRoundScore,
          ai: roast,
          aiScore: score
        }])

        // Check if game over
        if (round >= maxRounds) {
          setGameOver(true)
          const finalPlayerScore = playerScore + playerRoundScore
          const finalAIScore = aiScore + score
          setWinner(finalPlayerScore > finalAIScore ? 'player' : 'ai')
        } else {
          setRound(prev => prev + 1)
        }
      }

      setPlayerInput('')

    } catch (error) {
      console.error('Error in roast battle:', error)
      // Use fallback response and CONTINUE the game
      const fallbackResponse = getFallbackResponse(gameMode)
      setAIResponse(fallbackResponse)
      const score = Math.floor(Math.random() * 5) + 4 // 4-8
      setBurnScore(score)

      // Speak the roast
      speakText(fallbackResponse)

      // Update scores
      const playerRoundScore = Math.floor(Math.random() * 10) + 1
      setPlayerScore(prev => prev + playerRoundScore)
      setAIScore(prev => prev + score)

      // Add to history
      setHistory(prev => [...prev, {
        round,
        player: playerInput,
        playerScore: playerRoundScore,
        ai: fallbackResponse,
        aiScore: score
      }])

      // Check if game over
      if (round >= maxRounds) {
        setGameOver(true)
        const finalPlayerScore = playerScore + playerRoundScore
        const finalAIScore = aiScore + score
        setWinner(finalPlayerScore > finalAIScore ? 'player' : 'ai')
      } else {
        setRound(prev => prev + 1)
      }

      setPlayerInput('')
    } finally {
      setIsAIThinking(false)
    }
  }

  const getFallbackResponse = (mode) => {
    const roasts = [
      "You're so slow, you came in second place in solitaire!",
      "Your jokes are so corny, farmers are using them as fertilizer!",
      "You're so quiet, librarians tell YOU to speak up!",
      "Your room is so messy, archaeologists want to dig through it!"
    ]

    const dadJokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "What do you call fake spaghetti? An impasta!"
    ]

    const jokes = mode === 'roast' ? roasts : dadJokes
    return jokes[Math.floor(Math.random() * jokes.length)]
  }

  const parseAIResponse = (text) => {
    // Look for BURN METER or GROAN METER score
    const burnMatch = text.match(/BURN METER:\s*(\d+)/i)
    const groanMatch = text.match(/GROAN METER:\s*(\d+)/i)
    const scoreMatch = burnMatch || groanMatch
    const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 5) + 4

    // Remove the meter line from the response
    const roast = text.replace(/(BURN|GROAN) METER:.*$/im, '').trim()

    return { roast, score }
  }

  const resetGame = () => {
    setGameStarted(false)
    setRound(1)
    setPlayerScore(0)
    setAIScore(0)
    setGameOver(false)
    setWinner(null)
    setHistory([])
    setPlayerInput('')
    setAIResponse('')
    setBurnScore(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Games</span>
            </Link>
            <div className="flex items-center gap-2 text-orange-600">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm font-medium">15 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-6 shadow-lg">
            <FireIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {gameTitle}
          </h1>
          <p className="text-xl text-gray-600">
            Trade jokes with AI - stay cheeky, not mean!
          </p>
        </div>

        {!gameStarted ? (
          /* Setup Screen */
          <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <SparklesIcon className="w-7 h-7 text-orange-500" />
              Choose Your Mode
            </h2>

            {/* Mode Selection */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setGameMode('roast')}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  gameMode === 'roast'
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-5xl">🔥</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {roastModeLabel}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {grandmaMode ? 'Friendly jokes - silly and fun!' : 'Playful insults - cheeky but harmless'}
                    </p>
                    <p className="text-xs text-orange-600 font-semibold">
                      Ages 9-14 recommended
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setGameMode('dad-jokes')}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  gameMode === 'dad-jokes'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-5xl">😄</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Dad Joke Duel
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Wholesome puns and groan-worthy jokes
                    </p>
                    <p className="text-xs text-blue-600 font-semibold">
                      All ages welcome
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && startGame()}
              />
            </div>

            {/* AI Voice Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose AI Voice
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAIVoice('male')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    aiVoice === 'male'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">🧔</span>
                    <p className="font-bold text-gray-900">Male Voice</p>
                    <p className="text-xs text-gray-600 mt-1">Deep & confident</p>
                  </div>
                </button>
                <button
                  onClick={() => setAIVoice('female')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    aiVoice === 'female'
                      ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-pink-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">👧</span>
                    <p className="font-bold text-gray-900">Female Voice</p>
                    <p className="text-xs text-gray-600 mt-1">Young & upbeat</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Safety Info */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    Safety First!
                  </p>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>✓ All content is G-rated</li>
                    <li>✓ No mean or hurtful jokes allowed</li>
                    <li>✓ AI is monitored for safety</li>
                    {isGrandmaModeEnabled() && (
                      <li className="font-bold">✓ Extra Safe Mode is ON</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <p className="text-yellow-800 text-sm">⚠️ {error}</p>
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <FireIcon className="w-6 h-6" />
                Start {gameMode === 'roast' ? roastModeLabel : 'Dad Joke Duel'}
              </span>
            </button>
          </div>
        ) : gameOver ? (
          /* Game Over Screen */
          <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {winner === 'player' ? '🏆 You Win!' : '🤖 AI Wins!'}
            </h2>
            <div className="text-6xl mb-6">
              {winner === 'player' ? '🎉' : '😅'}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                <p className="text-4xl font-bold text-blue-600">{playerScore}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-1">AI Score</p>
                <p className="text-4xl font-bold text-red-600">{aiScore}</p>
              </div>
            </div>

            {/* History */}
            <div className="text-left mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Battle History:</h3>
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Round {h.round}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-600">You:</span>
                        <p className="text-gray-700 flex-1">{h.player}</p>
                        <span className="text-blue-600 font-bold">{h.playerScore}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-red-600">AI:</span>
                        <p className="text-gray-700 flex-1">{h.ai}</p>
                        <span className="text-red-600 font-bold">{h.aiScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all"
            >
              Play Again
            </button>
          </div>
        ) : (
          /* Battle Screen */
          <div className="space-y-6">
            {/* Round & Score */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Round {round} of {maxRounds}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-blue-600">
                    You: {playerScore}
                  </span>
                  <span className="font-semibold text-red-600">
                    AI: {aiScore}
                  </span>
                </div>
              </div>

              {/* AI Response */}
              {aiResponse && (
                <div className={`border-2 rounded-xl p-6 mb-4 ${
                  gameMode === 'dad-jokes'
                    ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                    : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-full ${
                      gameMode === 'dad-jokes' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      <SpeakerWaveIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold mb-2 ${
                        gameMode === 'dad-jokes' ? 'text-blue-600' : 'text-red-600'
                      }`}>AI Says:</p>
                      <p className="text-gray-900 text-lg">{aiResponse}</p>
                    </div>
                  </div>
                  {burnScore !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {gameMode === 'dad-jokes' ? 'GROAN METER:' : 'BURN METER:'}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            gameMode === 'dad-jokes'
                              ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                              : 'bg-gradient-to-r from-orange-400 to-red-500'
                          }`}
                          style={{ width: `${burnScore * 10}%` }}
                        />
                      </div>
                      <span className={`text-lg font-bold ${
                        gameMode === 'dad-jokes' ? 'text-blue-600' : 'text-red-600'
                      }`}>{burnScore}/10</span>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Indicator */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8">
                <div className="text-center">
                  {isListening ? (
                    <>
                      <div className="mb-4">
                        <MicrophoneIcon className="w-20 h-20 text-red-500 mx-auto animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        🎤 Listening...
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Take your time! I'll wait 2 seconds after you stop talking.
                      </p>
                      {playerInput && (
                        <div className="mt-4 p-4 bg-white rounded-xl border-2 border-blue-300 shadow-sm">
                          <p className="text-sm font-semibold text-blue-600 mb-1">You're saying:</p>
                          <p className="text-gray-900 text-lg">{playerInput}</p>
                          <p className="text-xs text-gray-500 mt-2">Keep talking or wait 2 seconds to finish...</p>
                        </div>
                      )}
                    </>
                  ) : isAIThinking ? (
                    <>
                      <div className="mb-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center animate-spin">
                          <SparklesIcon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        🤔 AI is thinking...
                      </h3>
                      <p className="text-gray-600">
                        Preparing a comeback!
                      </p>
                    </>
                  ) : isAISpeaking ? (
                    <>
                      <div className="mb-4">
                        <SpeakerWaveIcon className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        🔊 AI is speaking...
                      </h3>
                      <p className="text-gray-600">
                        Listen to the comeback!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <MicrophoneIcon className="w-20 h-20 text-gray-400 mx-auto" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Ready to roast!
                      </h3>
                      <p className="text-gray-600">
                        Tap the mic to start
                      </p>
                      <button
                        onClick={startListening}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg transition-all"
                      >
                        <MicrophoneIcon className="w-5 h-5 inline mr-2" />
                        Start Talking
                      </button>
                    </>
                  )}

                  {playerInput && (
                    <div className="mt-6 p-4 bg-white rounded-xl border-2 border-blue-200">
                      <p className="text-sm font-semibold text-gray-600 mb-1">You said:</p>
                      <p className="text-gray-900">{playerInput}</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
                  <p className="text-yellow-800 text-sm">⚠️ {error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
