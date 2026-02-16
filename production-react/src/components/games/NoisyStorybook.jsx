import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  SpeakerWaveIcon,
  MicrophoneIcon,
  PlayIcon,
  StopIcon,
  ArrowLeftIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { generateWithRateLimit } from '../../services/claudeService'
import { useAutoSave, loadSavedState, saveToGallery, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'
import AgeButton from '../AgeButton'
import ShareButton from '../ShareButton'

/**
 * Noisy Storybook - Voice-First Interactive Story Game
 *
 * Focus Group Feedback:
 * - Bella (6): "I can do it by myself? I don't need Mommy?"
 * - Jessica: "She can talk while I cook dinner. Makes it accessible instantly."
 * - David: "Using voice as the CONTENT, not just input. MP3 is something we'd send to Grandma."
 *
 * NEW: Full integration with ElevenLabs voice + user sound recordings
 */
export default function NoisyStorybook() {
  const savedState = loadSavedState('noisy-storybook-game', {})

  const [theme, setTheme] = useState(savedState.theme || 'jungle')
  const [storyGenerated, setStoryGenerated] = useState(false)
  const [generatedStory, setGeneratedStory] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Recording state
  const [currentCue, setCurrentCue] = useState(0)
  const [recordings, setRecordings] = useState({})
  const [isRecording, setIsRecording] = useState(false)
  const [recordingComplete, setRecordingComplete] = useState(false)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(-1)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const playbackAudioRef = useRef(null)

  // Auto-save game state
  const gameState = { theme }
  useAutoSave('noisy-storybook-game', gameState, 1000)

  // Request microphone permission on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Permission granted, stop the stream
        stream.getTracks().forEach(track => track.stop())
        console.log('✅ Microphone permission granted for Noisy Storybook')
      } catch (err) {
        console.error('❌ Microphone permission denied:', err)
        setError('Microphone permission is required for this game. Please allow access in your browser settings.')
      }
    }

    requestMicPermission()
  }, [])

  const themeOptions = [
    {
      id: 'jungle',
      name: 'Jungle Adventure',
      icon: '🌴',
      description: 'Explore the wild jungle with exotic animals',
      sounds: ['Roar like a lion!', 'Screech like a monkey!', 'Trumpet like an elephant!', 'Hiss like a snake!']
    },
    {
      id: 'space',
      name: 'Space Exploration',
      icon: '🚀',
      description: 'Journey through the cosmos',
      sounds: ['Whoosh like a rocket!', 'Beep like a robot!', 'Zap like a laser!', 'Boom like an asteroid!']
    },
    {
      id: 'ocean',
      name: 'Ocean Discovery',
      icon: '🌊',
      description: 'Dive deep into underwater mysteries',
      sounds: ['Splash into the water!', 'Blow like a whale!', 'Bubble like a fish!', 'Crash like a wave!']
    },
    {
      id: 'weather',
      name: 'Weather Journey',
      icon: '⛈️',
      description: 'Experience different weather patterns',
      sounds: ['Crack like thunder!', 'Whoosh like wind!', 'Pitter-patter like rain!', 'Whistle like a tornado!']
    },
    {
      id: 'farm',
      name: 'Farm Friends',
      icon: '🐄',
      description: 'Meet animals on a busy farm',
      sounds: ['Moo like a cow!', 'Oink like a pig!', 'Cluck like a chicken!', 'Neigh like a horse!']
    },
    {
      id: 'spooky',
      name: 'Spooky (Not Scary)',
      icon: '👻',
      description: 'Silly ghosts and friendly monsters',
      sounds: ['Boo like a ghost!', 'Howl like a wolf!', 'Creak like a door!', 'Cackle like a witch!']
    },
    {
      id: 'bedtime',
      name: 'Bedtime Story',
      icon: '🌙',
      description: 'Calm, gentle sounds for winding down',
      sounds: ['Pitter-patter like soft rain...', 'Chirp like crickets at night...', 'Rustle like leaves in the breeze...', 'Breathe deeply and slowly...']
    }
  ]

  const handleGenerateStory = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const selectedTheme = themeOptions.find(t => t.id === theme)

      // Call Claude to generate story with sound cues
      const result = await generateWithRateLimit({
        userInput: `Create an interactive story for kids`,
        gameContext: 'noisy-storybook',
        additionalData: {
          theme: selectedTheme.id,
          sounds: selectedTheme.sounds
        },
        maxTokens: 1024,
        temperature: 0.8
      })

      if (!result.success) {
        // Fallback to template-based story
        console.warn('Claude API failed, using template')
        const story = generateTemplateStory(selectedTheme)
        setGeneratedStory(story)
        setStoryGenerated(true)
        setError(`AI unavailable. Using template. (${result.error})`)
      } else {
        // Parse Claude's response
        const story = parseStoryResponse(result.content, selectedTheme)
        setGeneratedStory(story)
        setStoryGenerated(true)
        setError(null)

        // Save to gallery
        saveToGallery({
          gameName: 'Noisy Storybook',
          data: { story, theme },
          preview: `${story.title} - ${selectedTheme.name}`
        })
      }
    } catch (error) {
      console.error('Error generating story:', error)
      setError(`Generation failed: ${error.message}`)

      // Always provide template fallback
      const selectedTheme = themeOptions.find(t => t.id === theme)
      const story = generateTemplateStory(selectedTheme)
      setGeneratedStory(story)
      setStoryGenerated(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateTemplateStory = (themeData) => {
    const templates = {
      jungle: {
        title: "The Jungle Explorer",
        segments: [
          "Once upon a time, there was a brave explorer walking through the thick jungle. The trees were tall and the air was hot.",
          "Suddenly, a mighty lion appeared on the path! It looked at the explorer and went...",
          "From the trees above, a cheeky monkey swung down! It made a loud noise...",
          "Then, an enormous elephant walked by, shaking the ground. It lifted its trunk and went...",
          "Finally, a sneaky snake slithered across the path, hissing..."
        ],
        ending: "And the explorer had the most amazing jungle adventure ever! The end."
      },
      space: {
        title: "Mission to Mars",
        segments: [
          "In a shiny spaceship, an astronaut prepared for liftoff. The countdown began: 3... 2... 1...",
          "The rocket blasted off into space, going...",
          "On Mars, a friendly robot rolled up to greet the astronaut. The robot said...",
          "Suddenly, an asteroid zoomed past the ship! It went...",
          "The astronaut fired the ship's laser to change course. The laser went..."
        ],
        ending: "And the astronaut safely returned home with amazing space stories! The end."
      },
      ocean: {
        title: "Deep Sea Adventure",
        segments: [
          "A brave diver jumped into the deep blue ocean! They went...",
          "Swimming through colorful coral, they saw a giant whale. The whale sang...",
          "Schools of fish swam by, making tiny bubble sounds...",
          "A huge wave formed above the surface. It went...",
          "The diver spotted a treasure chest and swam up to the surface!"
        ],
        ending: "And the diver discovered the ocean's greatest treasures! The end."
      },
      weather: {
        title: "The Weather Adventure",
        segments: [
          "Dark clouds gathered in the sky. A storm was coming! Lightning flashed and thunder went...",
          "The wind began to blow stronger and stronger. It went...",
          "Rain started falling, first slowly, then faster. It went...",
          "A tornado appeared in the distance, spinning and...",
          "Finally, the sun came out and a rainbow appeared in the sky!"
        ],
        ending: "And after the storm, everything was bright and beautiful! The end."
      },
      farm: {
        title: "A Day on the Farm",
        segments: [
          "Early in the morning, the rooster woke everyone up. But wait, let's hear the cow first! The cow went...",
          "In the mud, a happy pig was rolling around. The pig went...",
          "The chickens were busy in the coop, going...",
          "A beautiful horse galloped across the field, going...",
          "And all the farm animals had a wonderful day together!"
        ],
        ending: "The farm was filled with happy animal sounds! The end."
      },
      spooky: {
        title: "The Friendly Ghost House",
        segments: [
          "In a silly old house, a friendly ghost floated around. The ghost went...",
          "Outside, a goofy wolf howled at the moon. It went...",
          "The creaky door opened slowly, going...",
          "A giggling witch flew by on her broom, cackling...",
          "All the silly spooky friends had a party together!"
        ],
        ending: "And they all laughed and played until bedtime! The end."
      },
      bedtime: {
        title: "The Sleepy Forest",
        segments: [
          "As the moon rose over the quiet forest, soft rain began to fall on the leaves. It sounded like...",
          "In the tall grass, tiny crickets started their gentle night song, chirping...",
          "The breeze blew gently through the trees, making the leaves rustle...",
          "A little owl took a deep breath before settling into its cozy nest, breathing...",
          "And slowly, peacefully, the whole forest drifted off to sleep."
        ],
        ending: "Goodnight, sleep tight. Sweet dreams. The end."
      }
    }

    const template = templates[themeData.id] || templates.jungle

    return {
      title: template.title,
      theme: themeData.name,
      segments: template.segments,
      soundCues: themeData.sounds,
      ending: template.ending
    }
  }

  const parseStoryResponse = (claudeText, themeData) => {
    // Parse Claude's story response
    // Look for title
    const titleMatch = claudeText.match(/^([^\n]+)/m)
    const title = titleMatch ? titleMatch[1].trim() : themeData.name + " Story"

    // Split into segments by looking for [SOUND: ...] markers
    const segments = []
    const lines = claudeText.split('\n').filter(l => l.trim())

    for (const line of lines) {
      if (!line.startsWith('[SOUND') && line.length > 20) {
        segments.push(line.trim())
        if (segments.length >= 5) break
      }
    }

    // Fallback if parsing fails
    if (segments.length < 3) {
      return generateTemplateStory(themeData)
    }

    return {
      title,
      theme: themeData.name,
      segments: segments.slice(0, 5),
      soundCues: themeData.sounds,
      ending: "And they all lived happily ever after! The end."
    }
  }

  const startRecording = async (cueIndex) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)

        setRecordings(prev => {
          const newRecordings = {
            ...prev,
            [cueIndex]: { blob: audioBlob, url: audioUrl }
          }

          // Check if all recordings are complete
          const totalCues = generatedStory.soundCues.length
          const currentCount = Object.keys(newRecordings).length
          if (currentCount >= totalCues) {
            setRecordingComplete(true)
          }

          return newRecordings
        })

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setCurrentCue(cueIndex)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Microphone access denied. Please allow microphone permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // NEW: Full interactive playback with ElevenLabs voice + user sounds
  const playInteractiveStory = async () => {
    if (isPlaying) {
      // Stop playback
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause()
        playbackAudioRef.current = null
      }
      setIsPlaying(false)
      setCurrentSegment(-1)
      return
    }

    setIsPlaying(true)
    setCurrentSegment(0)

    try {
      // Play each segment with its sound
      for (let i = 0; i < generatedStory.segments.length; i++) {
        setCurrentSegment(i)

        // Generate TTS for this segment
        const segmentText = generatedStory.segments[i]

        try {
          const response = await fetch('/api/elevenlabs-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: segmentText })
          })

          if (response.ok) {
            // Play AI narration
            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            playbackAudioRef.current = audio

            await new Promise((resolve, reject) => {
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl)
                resolve()
              }
              audio.onerror = reject
              audio.play()
            })
          } else {
            // Fallback: use browser TTS
            await playWithBrowserTTS(segmentText)
          }
        } catch (err) {
          console.warn('TTS failed for segment, using browser voice:', err)
          await playWithBrowserTTS(segmentText)
        }

        // Play user's recorded sound (if exists)
        if (recordings[i]) {
          const userAudio = new Audio(recordings[i].url)
          playbackAudioRef.current = userAudio

          await new Promise(resolve => {
            userAudio.onended = resolve
            userAudio.play()
          })
        } else {
          // Wait a moment for missing sound
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Small pause between segments
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Play ending
      setCurrentSegment(generatedStory.segments.length)
      try {
        const response = await fetch('/api/elevenlabs-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: generatedStory.ending })
        })

        if (response.ok) {
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          playbackAudioRef.current = audio

          await new Promise((resolve) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl)
              resolve()
            }
            audio.play()
          })
        } else {
          await playWithBrowserTTS(generatedStory.ending)
        }
      } catch (err) {
        await playWithBrowserTTS(generatedStory.ending)
      }

    } catch (error) {
      console.error('Playback error:', error)
    } finally {
      setIsPlaying(false)
      setCurrentSegment(-1)
      playbackAudioRef.current = null
    }
  }

  // Fallback browser TTS
  const playWithBrowserTTS = (text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.onend = resolve
      window.speechSynthesis.speak(utterance)
    })
  }

  const downloadStory = () => {
    // Download all sound effects as individual files
    const themeName = themeOptions.find(t => t.id === theme)?.name.replace(/\s+/g, '-').toLowerCase()
    const timestamp = new Date().toISOString().slice(0, 10)

    Object.keys(recordings).forEach((cueIndex) => {
      const recording = recordings[cueIndex]
      if (recording && recording.blob) {
        // Create download link
        const url = URL.createObjectURL(recording.blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `noisy-storybook-${themeName}-sound-${parseInt(cueIndex) + 1}-${timestamp}.webm`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Games</span>
            </Link>
            <div className="flex items-center gap-2 text-purple-600">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm font-medium">15 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl mb-6 shadow-lg">
            <SpeakerWaveIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The Noisy Storybook
          </h1>
          <p className="text-xl text-gray-600">
            AI tells a story, YOU make the sound effects!
          </p>
        </div>

        {!storyGenerated ? (
          /* Theme Selection */
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <SparklesIcon className="w-7 h-7 text-purple-500" />
              Choose Your Adventure
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    theme === option.id
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-5xl">{option.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {option.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <p className="text-yellow-800 text-sm">⚠️ {error}</p>
              </div>
            )}

            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all ${
                isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                    Creating Your Story...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    Generate Story
                  </>
                )}
              </span>
            </button>
          </div>
        ) : (
          /* Story Recording Interface */
          <div className="space-y-6">
            {/* Story Title */}
            <div id="noisy-storybook-output" className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {generatedStory.title}
              </h2>
              <p className="text-gray-600">{generatedStory.theme}</p>
            </div>

            {/* Recording Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">How to play:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">1.</span>
                  Record YOUR voice for each sound effect below
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">2.</span>
                  Press the microphone button and make the sound!
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">3.</span>
                  When all sounds are recorded, click "Play Interactive Story"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">4.</span>
                  The AI will read the story and play YOUR sounds at the perfect moments!
                </li>
              </ul>
            </div>

            {/* Story Segments with Recording */}
            {generatedStory.segments.map((segment, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all ${
                  currentSegment === index
                    ? 'border-green-400 ring-4 ring-green-200'
                    : 'border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
                    currentSegment === index
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse'
                      : 'bg-gradient-to-br from-purple-400 to-indigo-500'
                  }`}>
                    {currentSegment === index ? '▶' : index + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Part {index + 1}
                  </h3>
                </div>

                <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                  {segment}
                </p>

                {/* Sound Cue */}
                {generatedStory.soundCues[index] && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 mb-1">
                          🔊 RECORD SOUND:
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {generatedStory.soundCues[index]}
                        </p>
                      </div>

                      {!recordings[index] ? (
                        <button
                          onClick={() => startRecording(index)}
                          disabled={isRecording && currentCue !== index}
                          className={`p-4 rounded-full transition-all ${
                            isRecording && currentCue === index
                              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                        >
                          {isRecording && currentCue === index ? (
                            <StopIcon className="w-8 h-8" onClick={stopRecording} />
                          ) : (
                            <MicrophoneIcon className="w-8 h-8" />
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold">✓ Recorded!</span>
                          <button
                            onClick={() => startRecording(index)}
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                            title="Re-record"
                          >
                            <ArrowPathIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Ending */}
            <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 text-center ${
              currentSegment === generatedStory.segments.length
                ? 'border-green-400 ring-4 ring-green-200'
                : 'border-purple-200'
            }`}>
              <p className="text-xl font-bold text-gray-900">
                {generatedStory.ending}
              </p>
            </div>

            {/* Playback & Actions */}
            {recordingComplete && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-center">
                  🎉 All sounds recorded! Listen to your interactive story:
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={playInteractiveStory}
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <StopIcon className="w-5 h-5" />
                        Stop Story
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-5 h-5" />
                        Play Interactive Story
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadStory}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Save Audio Files
                  </button>
                  <div className="flex-1">
                    <ShareButton
                      elementId="noisy-storybook-output"
                      filename={`${generatedStory.title.replace(/\s+/g, '-')}-story.png`}
                      title={generatedStory.title}
                      text={`Check out our interactive sound story! Created with AI Family Night.`}
                    />
                  </div>
                </div>
                {isPlaying && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Now playing: <span className="font-bold">
                        {currentSegment < generatedStory.segments.length
                          ? `Part ${currentSegment + 1}`
                          : 'The End'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Create Another */}
            <button
              onClick={() => {
                setStoryGenerated(false)
                setRecordings({})
                setRecordingComplete(false)
                setCurrentCue(0)
                setCurrentSegment(-1)
                if (playbackAudioRef.current) {
                  playbackAudioRef.current.pause()
                  playbackAudioRef.current = null
                }
              }}
              className="w-full bg-white border-2 border-purple-300 hover:border-purple-500 text-purple-600 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <SparklesIcon className="w-5 h-5" />
              Create Another Story
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
