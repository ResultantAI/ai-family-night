import { useState, useEffect, useRef } from 'react'
import { MicrophoneIcon, StopIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function VoiceInput({ value, onChange, placeholder, className }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [showBrowserWarning, setShowBrowserWarning] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const recognitionRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    // Detect Firefox browser
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
    const dismissed = localStorage.getItem('voice-browser-warning-dismissed')

    if (isFirefox && !dismissed) {
      setShowBrowserWarning(true)
    }

    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setIsProcessing(false)
        const newValue = (value || '') + ' ' + transcript
        onChange(newValue.trim())
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsProcessing(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        // If we haven't received a result yet, show processing state
        if (recognitionRef.current?.transcript === undefined) {
          setIsProcessing(true)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const dismissBrowserWarning = () => {
    localStorage.setItem('voice-browser-warning-dismissed', 'true')
    setShowBrowserWarning(false)
  }

  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateVolume = () => {
        if (!analyserRef.current || !isListening) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        setVolumeLevel(Math.min(100, (average / 128) * 100))

        animationFrameRef.current = requestAnimationFrame(updateVolume)
      }

      updateVolume()
    } catch (error) {
      console.error('Failed to access microphone for volume monitoring:', error)
    }
  }

  const stopVolumeMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setVolumeLevel(0)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setIsProcessing(true)  // Show processing after stopping
      stopVolumeMonitoring()
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setIsProcessing(false)
        startVolumeMonitoring()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        setIsProcessing(false)
      }
    }
  }

  return (
    <>
      {showBrowserWarning && (
        <div className="mb-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 relative">
          <button
            onClick={dismissBrowserWarning}
            className="absolute top-2 right-2 text-amber-600 hover:text-amber-800"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 mb-1">🎙️ Magic Voice works best on Chrome or Safari!</h4>
              <p className="text-sm text-amber-800">
                We detected you're using Firefox. Voice features may not work properly.
                For the best experience, please switch to <strong>Chrome</strong> or <strong>Safari</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isListening ? 'Stop listening' : 'Click to speak'}
          >
            {isListening ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Volume Meter - Shows when mic is listening */}
      {isListening && (
        <div className="mt-2 bg-gray-100 rounded-full overflow-hidden h-3">
          <div className="flex items-center h-full gap-0.5 px-1">
            {[...Array(20)].map((_, i) => {
              const barThreshold = (i / 20) * 100
              const isActive = volumeLevel > barThreshold
              return (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-colors duration-75 ${
                    isActive
                      ? volumeLevel > 70 ? 'bg-red-500'
                        : volumeLevel > 40 ? 'bg-yellow-500'
                        : 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              )
            })}
          </div>
          <p className="text-xs text-gray-600 text-center mt-1">
            {volumeLevel > 30 ? '🎤 I can hear you!' : '🤫 Speak louder...'}
          </p>
        </div>
      )}

      {/* Processing Indicator - Shows after speaking while transcribing */}
      {isProcessing && (
        <div className="mt-2 flex items-center justify-center gap-2 text-purple-600">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-medium">Thinking...</span>
        </div>
      )}
    </>
  )
}

// Hook version for textarea
export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
    }
  }, [])

  const startListening = (callback) => {
    if (!recognitionRef.current) return

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      callback(transcript)
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (error) {
      console.error('Failed to start recognition:', error)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  return { isListening, isSupported, startListening, stopListening }
}
