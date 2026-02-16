import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HeartIcon,
  ClockIcon,
  PrinterIcon,
  PhotoIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import VoiceTextarea from '../VoiceTextarea'
import AgeButton from '../AgeButton'
import { useAutoSave, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'
import ReadAloud from '../ReadAloud'
import ShareButton from '../ShareButton'

export default function LoveStoryComic() {
  const [panels, setPanels] = useState([
    { emoji: '👨', text: '' },
    { emoji: '👩', text: '' },
    { emoji: '👧', text: '' },
    { emoji: '👦', text: '' }
  ])
  const [comicGenerated, setComicGenerated] = useState(false)

  // Auto-save game state
  const gameState = { panels, comicGenerated }
  const { saveStatus, lastSaved } = useAutoSave(
    'love-story-comic',
    gameState,
    { useSupabase: false, gameId: 'love-story-comic' }
  )

  const emojiOptions = [
    { value: '👨', label: 'Dad' },
    { value: '👩', label: 'Mom' },
    { value: '👧', label: 'Daughter' },
    { value: '👦', label: 'Son' },
    { value: '👵', label: 'Grandma' },
    { value: '👴', label: 'Grandpa' },
    { value: '🐕', label: 'Dog' },
    { value: '🐈', label: 'Cat' },
    { value: '❤️', label: 'Heart' },
    { value: '🏠', label: 'Home' }
  ]

  const updatePanel = (index, field, value) => {
    const newPanels = [...panels]
    newPanels[index][field] = value
    setPanels(newPanels)
  }

  const handleGenerate = () => {
    setComicGenerated(true)
    window.scrollTo({ top: 600, behavior: 'smooth' })
  }

  const allPanelsFilled = panels.every(panel => panel.text.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Games</span>
            </Link>
            <div className="flex items-center gap-2 text-pink-600">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm font-medium">15 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl mb-6 shadow-lg">
            <HeartIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comic Strip Creator
          </h1>
          <p className="text-xl text-gray-600">
            Create a 4-panel comic strip - tell any story you want!
          </p>
        </div>

        {/* Panel Creator */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-pink-500" />
            Create Your Panels
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {panels.map((panel, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Panel {index + 1}
                    {index === 0 && ' - The Setup'}
                    {index === 1 && ' - The Action'}
                    {index === 2 && ' - The Twist'}
                    {index === 3 && ' - The Ending'}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Choose character/emoji
                    </label>
                    <select
                      value={panel.emoji}
                      onChange={(e) => updatePanel(index, 'emoji', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                    >
                      {emojiOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.value} {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What happens in this panel?
                    </label>
                    <textarea
                      value={panel.text}
                      onChange={(e) => updatePanel(index, 'text', e.target.value)}
                      placeholder={
                        index === 0 ? 'Mom makes breakfast...' :
                        index === 1 ? 'Everyone sits together...' :
                        index === 2 ? 'She added extra chocolate chips!' :
                        'We all hug and say we love each other'
                      }
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none bg-white"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AgeButton
            onClick={handleGenerate}
            disabled={!allPanelsFilled}
            variant="primary"
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <HeartIcon className="w-6 h-6" />
              {allPanelsFilled ? 'Generate Comic' : 'Fill in all panels first'}
            </div>
          </AgeButton>

          {/* Auto-save indicator */}
          <div className="mt-4 flex justify-center">
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        </div>

        {/* Generated Comic */}
        {comicGenerated && (
          <div className="space-y-8 animate-fadeIn">
            <div id="love-story-comic-output" className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-8">
              <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-600">
                Your Family Love Story
              </h2>

              {/* Read Aloud Button */}
              <div className="flex justify-center mb-8 no-print">
                <ReadAloud
                  text={`Your Family Love Story. ${panels.map((panel, i) => `Panel ${i + 1}: ${panel.text}`).join('. ')}. This is how we show love in our family!`}
                />
              </div>

              {/* Comic Strip */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {panels.map((panel, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-pink-50 to-rose-50 border-4 border-pink-300 rounded-2xl p-6 shadow-lg comic-panel"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        {index === 0 && 'The Setup'}
                        {index === 1 && 'The Action'}
                        {index === 2 && 'The Twist'}
                        {index === 3 && 'The Ending'}
                      </div>
                    </div>

                    {/* Enhanced Emoji Illustration */}
                    <div className="bg-white rounded-xl p-8 mb-4 min-h-[240px] flex items-center justify-center border-2 border-pink-200 relative overflow-hidden">
                      <div
                        className="text-9xl transform transition-transform hover:scale-110 cursor-pointer"
                        style={{
                          textShadow: '4px 4px 0px rgba(236, 72, 153, 0.3)',
                          filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04))',
                          animation: `float-${index} ${2 + index * 0.5}s ease-in-out infinite`
                        }}
                      >
                        {panel.emoji}
                      </div>
                    </div>

                    {/* Speech Bubble */}
                    <div className="bg-white rounded-2xl border-3 border-pink-300 p-4 relative">
                      <div
                        className="absolute -top-3 left-8 w-6 h-6 bg-white border-l-3 border-t-3 border-pink-300 transform rotate-45"
                        style={{ borderWidth: '3px 0 0 3px' }}
                      />
                      <div className="text-gray-900 font-medium text-center relative z-10 leading-relaxed">
                        {panel.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CSS Animations - Add to component */}
              <style jsx>{`
                @keyframes float-0 {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes float-1 {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-12px); }
                }
                @keyframes float-2 {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes float-3 {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-15px); }
                }

                @media print {
                  .no-print {
                    display: none !important;
                  }
                  .comic-panel {
                    page-break-inside: avoid;
                    page-break-after: always;
                  }
                  header {
                    display: none !important;
                  }
                  @page {
                    margin: 1cm;
                  }
                }
              `}</style>

              <div className="bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-300 rounded-2xl p-6 text-center">
                <div className="text-6xl mb-4">❤️</div>
                <div className="text-lg font-semibold text-gray-900">
                  This is how we show love in our family!
                </div>
              </div>
            </div>

            {/* Tips & Ideas */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Make It Even Better!
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
                  <div className="font-semibold text-pink-700 mb-2">🎨 Draw It!</div>
                  <div className="text-sm text-gray-600">
                    Print this comic and have your kids draw the actual scenes on paper
                  </div>
                </div>
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
                  <div className="font-semibold text-rose-700 mb-2">📸 Photo Version</div>
                  <div className="text-sm text-gray-600">
                    Take photos of your family acting out each panel!
                  </div>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="font-semibold text-red-700 mb-2">🖼️ Display It</div>
                  <div className="text-sm text-gray-600">
                    Hang your finished comic on the fridge as a family keepsake
                  </div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <div className="font-semibold text-orange-700 mb-2">🎭 Act It Out</div>
                  <div className="text-sm text-gray-600">
                    Perform your comic like a play and record a video!
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <AgeButton
                onClick={() => window.print()}
                variant="secondary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Comic
              </AgeButton>
              <div className="flex-1">
                <ShareButton
                  elementId="love-story-comic-output"
                  filename="family-love-story-comic.png"
                  title="Our Family Love Story Comic"
                  text="Check out our family love story comic! Created with AI Family Night."
                />
              </div>
              <AgeButton
                onClick={() => {
                  setPanels([
                    { emoji: '👨', text: '' },
                    { emoji: '👩', text: '' },
                    { emoji: '👧', text: '' },
                    { emoji: '👦', text: '' }
                  ])
                  setComicGenerated(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Create Another Comic
              </AgeButton>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
