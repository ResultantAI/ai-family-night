import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MusicalNoteIcon,
  MicrophoneIcon,
  PlayIcon,
  StopIcon,
  ArrowLeftIcon,
  ClockIcon,
  SparklesIcon,
  TrophyIcon,
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { generateWithRateLimit } from '../../services/claudeService'
import { useAutoSave, loadSavedState, saveToGallery, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'
import AgeButton from '../AgeButton'
import ShareButton from '../ShareButton'

/**
 * Musical Maestro - Sing Your Heart Out!
 *
 * Kids can choose from Disney, K-pop, or custom songs and record themselves singing.
 * AI generates fun, encouraging performance reviews with star ratings.
 */
export default function MusicalMaestro() {
  const savedState = loadSavedState('musical-maestro-game', {})

  const [singerName, setSingerName] = useState(savedState.singerName || '')
  const [songCategory, setSongCategory] = useState(savedState.songCategory || 'disney')
  const [selectedSong, setSelectedSong] = useState(savedState.selectedSong || '')
  const [customSongTitle, setCustomSongTitle] = useState(savedState.customSongTitle || '')
  const [customArtist, setCustomArtist] = useState(savedState.customArtist || '')
  const [customLyrics, setCustomLyrics] = useState(savedState.customLyrics || '')

  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState(null)
  const [recordingUrl, setRecordingUrl] = useState(null)

  const [reviewGenerated, setReviewGenerated] = useState(false)
  const [generatedReview, setGeneratedReview] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingStartTimeRef = useRef(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const timerIntervalRef = useRef(null)

  // Auto-save game state
  const gameState = { singerName, songCategory, selectedSong, customSongTitle, customArtist, customLyrics }
  useAutoSave('musical-maestro-game', gameState, 1000)

  const songLibrary = {
    disney: [
      {
        id: 'let-it-go',
        title: 'Let It Go',
        movie: 'Frozen',
        lyrics: `Let it go, let it go\nCan't hold it back anymore\nLet it go, let it go\nTurn away and slam the door\n\nI don't care what they're going to say\nLet the storm rage on\nThe cold never bothered me anyway`
      },
      {
        id: 'how-far-ill-go',
        title: 'How Far I\'ll Go',
        movie: 'Moana',
        lyrics: `See the line where the sky meets the sea?\nIt calls me\nAnd no one knows\nHow far it goes\n\nIf the wind in my sail on the sea stays behind me\nOne day I'll know\nHow far I'll go`
      },
      {
        id: 'into-the-unknown',
        title: 'Into the Unknown',
        movie: 'Frozen 2',
        lyrics: `Into the unknown\nInto the unknown\nInto the unknown\n\nAre you out there?\nDo you know me?\nCan you feel me?\nCan you show me?`
      },
      {
        id: 'we-dont-talk-bruno',
        title: 'We Don\'t Talk About Bruno',
        movie: 'Encanto',
        lyrics: `We don't talk about Bruno, no, no, no\nWe don't talk about Bruno\n\nBut it was my wedding day\nIt was our wedding day\nWe were getting ready\nAnd there wasn't a cloud in the sky`
      },
      {
        id: 'a-whole-new-world',
        title: 'A Whole New World',
        movie: 'Aladdin',
        lyrics: `I can show you the world\nShining, shimmering, splendid\nTell me, princess\nNow when did you last let your heart decide?\n\nA whole new world\nA new fantastic point of view`
      },
      {
        id: 'under-the-sea',
        title: 'Under the Sea',
        movie: 'The Little Mermaid',
        lyrics: `Under the sea\nUnder the sea\nDarling it's better\nDown where it's wetter\nTake it from me\n\nUp on the shore they work all day\nOut in the sun they slave away`
      },
      {
        id: 'circle-of-life',
        title: 'Circle of Life',
        movie: 'The Lion King',
        lyrics: `From the day we arrive on the planet\nAnd blinking, step into the sun\nThere's more to see than can ever be seen\nMore to do than can ever be done\n\nIt's the circle of life\nAnd it moves us all`
      },
      {
        id: 'part-of-your-world',
        title: 'Part of Your World',
        movie: 'The Little Mermaid',
        lyrics: `Look at this stuff, isn't it neat?\nWouldn't you think my collection's complete?\nWouldn't you think I'm the girl\nThe girl who has everything?\n\nI wanna be where the people are`
      }
    ],
    kpop: [
      {
        id: 'dynamite',
        title: 'Dynamite',
        artist: 'BTS',
        lyrics: `'Cause I, I, I'm in the stars tonight\nSo watch me bring the fire and set the night alight\n\nShoes on, get up in the morn'\nCup of milk, let's rock and roll\nKing Kong, kick the drum\nRolling on like a Rolling Stone`
      },
      {
        id: 'butter',
        title: 'Butter',
        artist: 'BTS',
        lyrics: `Smooth like butter\nLike a criminal undercover\nGon' pop like trouble\nBreaking into your heart like that\n\nCool shade, stunner\nYeah, I owe it all to my mother`
      },
      {
        id: 'how-you-like-that',
        title: 'How You Like That',
        artist: 'BLACKPINK',
        lyrics: `How you like that?\nHow you like that?\n\nNow look at you, now look at me\nLook at you, now look at me\nLook at you, now look at me\nHow you like that?`
      },
      {
        id: 'pink-venom',
        title: 'Pink Venom',
        artist: 'BLACKPINK',
        lyrics: `Kick in the door, waving the coco\nPapillon, find it, I go\nThis that pink venom, this that pink venom\n\nOne by one, then two by two\nNow everyone everywhere is on my radar`
      },
      {
        id: 'step-back',
        title: 'Step Back',
        artist: 'GOT the beat',
        lyrics: `Step back, step back\nGotta go, gotta go\nStep back, step back\nNow you know, now you know\n\nI'm getting stronger, bolder\nCan't hold me back anymore`
      },
      {
        id: 'signal',
        title: 'Signal',
        artist: 'TWICE',
        lyrics: `Signal, signal\nI'm sending you a signal\nSignal, signal\nCan you feel my signal?\n\nI'm trying hard to let you know\nBut you don't seem to notice`
      },
      {
        id: 'dalla-dalla',
        title: 'DALLA DALLA',
        artist: 'ITZY',
        lyrics: `I'm different, you're different\nI'm different, you're different\nI'm different, dalla dalla\nI'm different, dalla dalla\n\nI wanna be me, me, me`
      },
      {
        id: 'next-level',
        title: 'Next Level',
        artist: 'aespa',
        lyrics: `I'm on the next level\nNext level\nNever gonna stop this\nNever gonna give up\n\nCome on, let's go\nTo the next level`
      }
    ],
    other: [
      { id: 'custom', title: 'My Own Song!', artist: 'Custom', lyrics: '' }
    ]
  }

  const categoryOptions = [
    { id: 'disney', name: 'Disney Classics', icon: '🏰', description: 'Sing your favorite Disney songs!' },
    { id: 'kpop', name: 'K-Pop Hits', icon: '💜', description: 'Dance and sing K-pop favorites!' },
    { id: 'other', name: 'My Own Song', icon: '🎤', description: 'Sing any song you want!' }
  ]

  // Request microphone permission on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        console.log('✅ Microphone permission granted for Musical Maestro')
      } catch (err) {
        console.error('❌ Microphone permission denied:', err)
        setError('Microphone permission is required for this game. Please allow access in your browser settings.')
      }
    }

    requestMicPermission()
  }, [])

  const startRecording = async () => {
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

        setRecordingBlob(audioBlob)
        setRecordingUrl(audioUrl)
        setHasRecording(true)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())

        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      recordingStartTimeRef.current = Date.now()

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        setRecordingDuration(elapsed)
      }, 1000)

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

  const handleGenerateReview = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const songInfo = songCategory === 'other'
        ? `"${customSongTitle}" by ${customArtist}`
        : songLibrary[songCategory].find(s => s.id === selectedSong)?.title || 'a song'

      // Call Claude to generate a fun performance review
      const result = await generateWithRateLimit({
        userInput: `Create a fun, encouraging performance review for ${singerName}`,
        gameContext: 'musical-maestro',
        additionalData: {
          singerName,
          song: songInfo,
          category: songCategory,
          duration: recordingDuration
        },
        maxTokens: 1024,
        temperature: 0.9
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate review')
      }

      // Parse the review
      const review = parseReviewResponse(result.content)
      setGeneratedReview(review)
      setReviewGenerated(true)

      // Save to gallery
      saveToGallery({
        gameName: 'Musical Maestro',
        data: { review, singerName, songInfo },
        preview: `${singerName}'s performance of ${songInfo}`
      })

      window.scrollTo({ top: 600, behavior: 'smooth' })

    } catch (err) {
      console.error('Error generating review:', err)
      setError('AI review unavailable. Using backup review system.')

      // Fallback review
      const review = generateFallbackReview()
      setGeneratedReview(review)
      setReviewGenerated(true)

      window.scrollTo({ top: 600, behavior: 'smooth' })
    } finally {
      setIsGenerating(false)
    }
  }

  const parseReviewResponse = (content) => {
    // Try to parse structured review from Claude
    const starMatch = content.match(/(\d+)[\s\/]*(?:out of )?5 stars/i)
    const stars = starMatch ? parseInt(starMatch[1]) : 5

    // Extract sections
    const highlightMatch = content.match(/(?:highlight|best part|amazing)[:\s]*([^\n]+)/i)
    const improvementMatch = content.match(/(?:improvement|practice|next time)[:\s]*([^\n]+)/i)

    return {
      stars,
      title: `${singerName}, You Were Amazing!`,
      highlight: highlightMatch?.[1]?.trim() || "Your passion and energy were incredible! You really felt the music!",
      encouragement: "Keep singing! Every performance makes you better!",
      improvement: improvementMatch?.[1]?.trim() || "Keep practicing and you'll be even more amazing!",
      badges: generateBadges(stars),
      fullReview: content
    }
  }

  const generateFallbackReview = () => {
    const stars = 4 + Math.round(Math.random()) // 4 or 5 stars

    const highlights = [
      "Your energy was infectious! You really connected with the song!",
      "Wow! Your passion for music really shines through!",
      "You have such a unique voice! Keep sharing it with the world!",
      "Amazing! You put your whole heart into that performance!",
      "Incredible! You made that song your own!"
    ]

    const encouragements = [
      "You're a natural performer! Keep singing every day!",
      "Your confidence is growing with every song!",
      "Music is clearly one of your superpowers!",
      "You have what it takes to be a star!",
      "Keep practicing and you'll achieve anything!"
    ]

    const improvements = [
      "Try recording yourself and listening back - you'll be amazed!",
      "Keep practicing your favorite parts until they feel perfect!",
      "Remember to breathe and project your voice!",
      "Try singing along with the original to learn the rhythm!"
    ]

    return {
      stars,
      title: `${singerName}, You Were Amazing!`,
      highlight: highlights[Math.floor(Math.random() * highlights.length)],
      encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
      improvement: improvements[Math.floor(Math.random() * improvements.length)],
      badges: generateBadges(stars)
    }
  }

  const generateBadges = (stars) => {
    const allBadges = [
      { emoji: '🎤', text: 'Microphone Master' },
      { emoji: '🌟', text: 'Rising Star' },
      { emoji: '💖', text: 'Heart & Soul' },
      { emoji: '🎵', text: 'Melody Maker' },
      { emoji: '🔥', text: 'Show Stopper' },
      { emoji: '👑', text: 'Karaoke Queen' },
      { emoji: '🎭', text: 'Natural Performer' },
      { emoji: '✨', text: 'Stage Presence' }
    ]

    // Award badges based on stars
    const badgeCount = Math.min(stars, 3)
    const shuffled = [...allBadges].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, badgeCount)
  }

  const downloadRecording = () => {
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob)
      const link = document.createElement('a')
      link.href = url
      const songName = songCategory === 'other' ? customSongTitle : songLibrary[songCategory].find(s => s.id === selectedSong)?.title
      link.download = `${singerName}-${songName}-${new Date().toISOString().slice(0, 10)}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const canRecord = singerName && (
    (songCategory === 'other' && customSongTitle && customArtist) ||
    (songCategory !== 'other' && selectedSong)
  )

  const getCurrentSongInfo = () => {
    if (songCategory === 'other') {
      return {
        title: customSongTitle,
        artist: customArtist,
        lyrics: customLyrics
      }
    }
    return songLibrary[songCategory]?.find(s => s.id === selectedSong)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
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
              <span className="text-sm font-medium">20 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <MusicalNoteIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Musical Maestro
          </h1>
          <p className="text-xl text-gray-600">
            Sing your heart out and get a star-studded review!
          </p>
        </div>

        {!reviewGenerated ? (
          /* Song Selection & Recording */
          <div className="space-y-8">
            {/* Singer Info */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <SparklesIcon className="w-7 h-7 text-purple-500" />
                About You
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Singer's Name
                </label>
                <input
                  type="text"
                  value={singerName}
                  onChange={(e) => setSingerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MusicalNoteIcon className="w-7 h-7 text-purple-500" />
                Choose Your Style
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSongCategory(cat.id)
                      setSelectedSong('')
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      songCategory === cat.id
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <div className="font-bold text-gray-900 mb-1">{cat.name}</div>
                    <div className="text-sm text-gray-600">{cat.description}</div>
                  </button>
                ))}
              </div>

              {/* Song Selection */}
              {songCategory === 'other' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Song Title
                    </label>
                    <input
                      type="text"
                      value={customSongTitle}
                      onChange={(e) => setCustomSongTitle(e.target.value)}
                      placeholder="Enter song title"
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Artist
                    </label>
                    <input
                      type="text"
                      value={customArtist}
                      onChange={(e) => setCustomArtist(e.target.value)}
                      placeholder="Enter artist name"
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lyrics (Optional)
                    </label>
                    <textarea
                      value={customLyrics}
                      onChange={(e) => setCustomLyrics(e.target.value)}
                      placeholder="Paste the lyrics here to see them while you sing..."
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Paste the lyrics so you can read them karaoke-style while recording!
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pick Your Song
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {songLibrary[songCategory]?.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => setSelectedSong(song.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedSong === song.id
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="font-bold text-gray-900">{song.title}</div>
                        <div className="text-sm text-gray-600">
                          {song.movie || song.artist}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Karaoke Lyrics Display */}
            {canRecord && (() => {
              const currentSong = songCategory === 'other'
                ? { lyrics: customLyrics }
                : songLibrary[songCategory]?.find(s => s.id === selectedSong)

              const lyrics = currentSong?.lyrics || ''

              if (!lyrics) return null

              return (
                <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MusicalNoteIcon className="w-7 h-7 text-purple-500" />
                    Lyrics
                  </h2>
                  <div className={`bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-8 ${
                    isRecording ? 'ring-4 ring-purple-400 animate-pulse' : ''
                  }`}>
                    <div className="text-center space-y-3">
                      {lyrics.split('\n').map((line, i) => (
                        <div
                          key={i}
                          className={`text-lg font-medium transition-all ${
                            isRecording
                              ? 'text-purple-900'
                              : 'text-gray-700'
                          }`}
                          style={{
                            fontSize: isRecording ? '1.25rem' : '1.125rem',
                            lineHeight: '1.75'
                          }}
                        >
                          {line || '\u00A0'}
                        </div>
                      ))}
                    </div>
                  </div>
                  {isRecording && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-purple-600 font-semibold animate-bounce">
                        🎤 Sing along!
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Recording Section */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MicrophoneIcon className="w-7 h-7 text-purple-500" />
                Record Your Performance
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-yellow-800 text-sm">⚠️ {error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Recording Timer */}
                {isRecording && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 text-center">
                    <div className="text-6xl font-bold text-red-600 animate-pulse mb-2">
                      {formatTime(recordingDuration)}
                    </div>
                    <div className="text-sm text-gray-600">Recording in progress...</div>
                  </div>
                )}

                {/* Playback */}
                {hasRecording && recordingUrl && !isRecording && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-gray-900">Your Recording:</div>
                      <div className="text-sm text-gray-600">{formatTime(recordingDuration)}</div>
                    </div>
                    <audio
                      src={recordingUrl}
                      controls
                      className="w-full mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={downloadRecording}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Save Recording
                      </button>
                      <button
                        onClick={() => {
                          setHasRecording(false)
                          setRecordingUrl(null)
                          setRecordingBlob(null)
                          setRecordingDuration(0)
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        Record Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Record Button */}
                {!hasRecording && (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!canRecord}
                    className={`w-full py-6 px-8 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                      canRecord
                        ? isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isRecording ? (
                        <>
                          <StopIcon className="w-8 h-8" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <MicrophoneIcon className="w-8 h-8" />
                          {canRecord ? 'Start Recording' : 'Fill in all fields first'}
                        </>
                      )}
                    </div>
                  </button>
                )}

                {/* Get Review Button */}
                {hasRecording && (
                  <button
                    onClick={handleGenerateReview}
                    disabled={isGenerating}
                    className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all ${
                      isGenerating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Generating Your Review...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-6 h-6" />
                          Get My Review!
                        </>
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Performance Review */
          <div className="space-y-8">
            <div id="musical-maestro-review" className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden">
              {/* Header with Stars */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white text-center">
                <TrophyIcon className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">{generatedReview.title}</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-8 h-8 ${
                        i < generatedReview.stars
                          ? 'fill-yellow-300 text-yellow-300'
                          : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xl font-semibold">
                  {generatedReview.stars} out of 5 Stars!
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Badges */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                    You Earned These Badges!
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {generatedReview.badges.map((badge, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl px-4 py-3 flex items-center gap-2"
                      >
                        <span className="text-2xl">{badge.emoji}</span>
                        <span className="font-semibold text-gray-900">{badge.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlight */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                  <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    Performance Highlight
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {generatedReview.highlight}
                  </p>
                </div>

                {/* Encouragement */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">💙</span>
                    Keep Going!
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {generatedReview.encouragement}
                  </p>
                </div>

                {/* Improvement Tip */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                  <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Pro Tip
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {generatedReview.improvement}
                  </p>
                </div>

                {/* Playback */}
                {recordingUrl && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Listen to Your Performance:</h3>
                    <audio
                      src={recordingUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadRecording}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Save Recording
              </button>
              <div className="flex-1">
                <ShareButton
                  elementId="musical-maestro-review"
                  filename={`${singerName}-performance-review.png`}
                  title={`${singerName}'s Musical Performance`}
                  text={`I got ${generatedReview.stars} stars for my singing! Created with AI Family Night.`}
                />
              </div>
              <button
                onClick={() => {
                  setReviewGenerated(false)
                  setHasRecording(false)
                  setRecordingUrl(null)
                  setRecordingBlob(null)
                  setRecordingDuration(0)
                  setSelectedSong('')
                  setCustomLyrics('')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <SparklesIcon className="w-5 h-5" />
                Sing Another Song
              </button>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Keep the Music Going!
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="font-semibold text-purple-700 mb-2">🎬 Record a Music Video</div>
                  <div className="text-sm text-gray-600">
                    Have a parent film you performing and make your own music video!
                  </div>
                </div>
                <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
                  <div className="font-semibold text-pink-700 mb-2">🎤 Family Karaoke Night</div>
                  <div className="text-sm text-gray-600">
                    Get the whole family together for a karaoke competition!
                  </div>
                </div>
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
                  <div className="font-semibold text-rose-700 mb-2">📝 Write Your Own Song</div>
                  <div className="text-sm text-gray-600">
                    Try creating your own lyrics and record an original song!
                  </div>
                </div>
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                  <div className="font-semibold text-indigo-700 mb-2">🎵 Practice Makes Perfect</div>
                  <div className="text-sm text-gray-600">
                    Record yourself every week and hear how much you improve!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
