import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  ClockIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import AgeButton from '../AgeButton'
import { useAutoSave, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'
import ReadAloud from '../ReadAloud'
import ShareButton from '../ShareButton'

export default function PresidentialTimeMachine() {
  const [selectedPresident, setSelectedPresident] = useState('George Washington')
  const [storyGenerated, setStoryGenerated] = useState(false)
  const [uploadedDrawing, setUploadedDrawing] = useState(null)
  const storyRef = useRef(null)

  // Auto-save game state
  const gameState = { selectedPresident, storyGenerated, uploadedDrawing }
  const { saveStatus, lastSaved } = useAutoSave(
    'presidential-time-machine',
    gameState,
    { useSupabase: false, gameId: 'presidential-time-machine' }
  )

  const presidents = [
    { name: 'George Washington', year: '1789', era: '1700s' },
    { name: 'Thomas Jefferson', year: '1801', era: '1800s' },
    { name: 'Abraham Lincoln', year: '1861', era: '1860s' },
    { name: 'Theodore Roosevelt', year: '1901', era: '1900s' },
    { name: 'Franklin D. Roosevelt', year: '1933', era: '1930s-40s' },
    { name: 'John F. Kennedy', year: '1961', era: '1960s' }
  ]

  const facts = {
    'George Washington': [
      '📱 Everyone carries a computer in their pocket that can talk to anyone in the world instantly',
      '✈️ People can fly across the ocean in less than a day',
      '🗳️ Women and people of all backgrounds can vote and run for president',
      '🚗 Horseless carriages zoom everywhere at 70 miles per hour',
      '📺 You can watch moving pictures from your home showing events happening right now'
    ],
    'Thomas Jefferson': [
      '📚 All human knowledge is accessible through a device you can hold in one hand',
      '🚀 We\'ve landed people on the moon and sent robots to Mars',
      '⚡ Entire cities are lit up at night with electricity',
      '🗽 The Louisiana Purchase you made is now filled with millions of people',
      '🌐 The Statue of Liberty stands in New York Harbor welcoming immigrants'
    ],
    'Abraham Lincoln': [
      '🗳️ The 13th Amendment you championed ended slavery, but the fight for equality continues',
      '🏙️ America is now connected by roads, rails, and wireless signals coast to coast',
      '💻 People work from home using computers instead of telegraphs',
      '💵 Your face is on the $5 bill and Mount Rushmore',
      '📱 The whole country can communicate instantly without any wires'
    ]
  }

  const handleGenerate = () => {
    setStoryGenerated(true)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const handleDrawingUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedDrawing(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAsImage = async () => {
    if (!storyRef.current) return

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(storyRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${selectedPresident.replace(/\s+/g, '-')}-time-machine-story.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Failed to save image. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Games</span>
            </Link>
            <div className="flex items-center gap-2 text-pink-600">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm font-medium">20 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl mb-6 shadow-lg">
            <ClockIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Presidential Time Machine
          </h1>
          <p className="text-xl text-gray-600">
            Bring a president to 2026 and discover what would shock them!
          </p>
        </div>

        {/* President Selection */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Choose Your President
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {presidents.map((prez) => (
              <button
                key={prez.name}
                onClick={() => setSelectedPresident(prez.name)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  selectedPresident === prez.name
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg'
                    : 'border-gray-200 hover:border-pink-300 bg-white'
                }`}
              >
                <div className="font-bold text-gray-900 text-lg mb-1">{prez.name}</div>
                <div className="text-sm text-gray-600">President {prez.year}</div>
              </button>
            ))}
          </div>

          <AgeButton
            onClick={handleGenerate}
            variant="primary"
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <ClockIcon className="w-6 h-6" />
              Start Time Machine
            </div>
          </AgeButton>

          {/* Auto-save indicator */}
          <div className="mt-4 flex justify-center">
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        </div>

        {/* Generated Story */}
        {storyGenerated && (
          <div className="space-y-8 animate-fadeIn">
            <div id="presidential-story-output" ref={storyRef} className="printable-story bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-8">
              <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                {selectedPresident} Arrives in 2026!
              </h2>

              {/* Read Aloud Button */}
              <div className="flex justify-center mb-8 no-print">
                <ReadAloud
                  text={`${selectedPresident} Arrives in 2026! WHOOSH! The time machine whirs to life and ${selectedPresident} steps out, looking around in amazement. "Where am I?" he asks. "This is America... but in the year 2026!" What Would Shock ${selectedPresident}: ${(facts[selectedPresident] || facts['George Washington']).join('. ')}. After seeing all these amazing changes, ${selectedPresident} smiled and said: "The America I helped build has grown beyond my wildest dreams. Though much has changed, I can see the spirit of freedom and innovation I believed in still burns bright!"`}
                />
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed">
                  <strong className="text-pink-600">WHOOSH!</strong> The time machine whirs to life and {selectedPresident} steps out, looking around in amazement.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  "Where am I?" he asks. "This is America... but in the year 2026!"
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border-2 border-pink-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  What Would Shock {selectedPresident}:
                </h3>

                <div className="space-y-4">
                  {(facts[selectedPresident] || facts['George Washington']).map((fact, i) => (
                    <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl text-white">
                <p className="text-lg italic leading-relaxed">
                  After seeing all these amazing changes, {selectedPresident} smiled and said:
                  <br /><br />
                  "The America I helped build has grown beyond my wildest dreams. Though much has changed, I can see the spirit of freedom and innovation I believed in still burns bright!"
                </p>
              </div>
            </div>

            {/* Drawing Upload Section */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Draw Your Story!
                </h3>
                <p className="text-gray-600">
                  Create a comic or drawing showing {selectedPresident}'s reaction to modern America
                </p>
              </div>

              {!uploadedDrawing ? (
                <label className="block border-4 border-dashed border-pink-300 rounded-2xl p-12 text-center hover:border-pink-500 hover:bg-pink-50 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDrawingUpload}
                    className="hidden"
                  />
                  <CloudArrowUpIcon className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                  <div className="font-semibold text-gray-900 mb-2">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-sm text-gray-500">
                    JPG, PNG or HEIC - Max 10MB
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <img
                    src={uploadedDrawing}
                    alt="Your drawing"
                    className="w-full rounded-2xl shadow-lg"
                  />
                  <div className="flex gap-4">
                    <AgeButton variant="primary" className="flex-1">
                      Submit to Gallery
                    </AgeButton>
                    <AgeButton
                      onClick={() => setUploadedDrawing(null)}
                      variant="secondary"
                      className="flex-1"
                    >
                      Change Photo
                    </AgeButton>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 no-print">
              <AgeButton
                onClick={() => window.print()}
                variant="secondary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Story
              </AgeButton>
              <div className="flex-1">
                <ShareButton
                  elementId="presidential-story-output"
                  filename={`${selectedPresident.replace(/\s+/g, '-')}-time-machine.png`}
                  title={`${selectedPresident} Arrives in 2026!`}
                  text={`Check out my time machine story about ${selectedPresident}! Created with AI Family Night.`}
                />
              </div>
              <Link
                to="/dashboard"
                className="flex-1"
              >
                <AgeButton
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Back to Games
                </AgeButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
