import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HomeIcon,
  ClockIcon,
  PrinterIcon,
  ArrowLeftIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import VoiceInput from '../VoiceInput'
import AgeButton from '../AgeButton'
import { useAutoSave, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'
import ShareButton from '../ShareButton'

export default function TreehouseDesigner() {
  const [treehouseName, setTreehouseName] = useState('')
  const [selectedOptions, setSelectedOptions] = useState({
    size: 'medium',
    style: 'classic',
    features: [],
    access: 'ladder',
    roof: 'peaked',
    windows: 'multiple'
  })
  const [blueprintGenerated, setBlueprintGenerated] = useState(false)

  // Auto-save game state
  const gameState = { treehouseName, selectedOptions, blueprintGenerated }
  const { saveStatus, lastSaved } = useAutoSave(
    'treehouse-designer',
    gameState,
    { useSupabase: false, gameId: 'treehouse-designer' }
  )

  const sizeOptions = [
    { id: 'small', name: 'Cozy Nest', size: '6x8 feet', capacity: '2-3 kids' },
    { id: 'medium', name: 'Hangout Hub', size: '8x10 feet', capacity: '4-5 kids' },
    { id: 'large', name: 'Adventure Palace', size: '10x12 feet', capacity: '6-8 kids' }
  ]

  const styleOptions = [
    { id: 'classic', name: 'Classic Cabin', description: 'Traditional wooden retreat' },
    { id: 'modern', name: 'Modern Pod', description: 'Sleek contemporary design' },
    { id: 'castle', name: 'Castle Tower', description: 'Medieval fortress style' },
    { id: 'spaceship', name: 'Space Station', description: 'Futuristic spacecraft' }
  ]

  const featureOptions = [
    { id: 'slide', name: 'Slide', icon: '🛝', description: 'Fast exit ramp' },
    { id: 'swing', name: 'Rope Swing', icon: '🪢', description: 'Swinging fun' },
    { id: 'telescope', name: 'Telescope', icon: '🔭', description: 'Stargazing deck' },
    { id: 'lights', name: 'String Lights', icon: '💡', description: 'Evening ambiance' },
    { id: 'pulley', name: 'Pulley System', icon: '⚙️', description: 'Hoist supplies' },
    { id: 'hammock', name: 'Hammock', icon: '🛏️', description: 'Relaxation zone' },
    { id: 'zipline', name: 'Zipline', icon: '🚡', description: 'Thrilling descent' },
    { id: 'fireman', name: 'Fireman Pole', icon: '🚒', description: 'Emergency exit' }
  ]

  const accessOptions = [
    { id: 'ladder', name: 'Rope Ladder', difficulty: 'Easy' },
    { id: 'stairs', name: 'Wooden Stairs', difficulty: 'Easy' },
    { id: 'climbing', name: 'Climbing Wall', difficulty: 'Medium' },
    { id: 'net', name: 'Cargo Net', difficulty: 'Hard' }
  ]

  const roofOptions = [
    { id: 'peaked', name: 'Peaked Roof', style: 'Classic' },
    { id: 'flat', name: 'Flat Deck', style: 'Modern' },
    { id: 'dome', name: 'Dome', style: 'Unique' },
    { id: 'tent', name: 'Canvas Tent', style: 'Adventure' }
  ]

  const toggleFeature = (featureId) => {
    const features = selectedOptions.features.includes(featureId)
      ? selectedOptions.features.filter(f => f !== featureId)
      : [...selectedOptions.features, featureId]

    setSelectedOptions({ ...selectedOptions, features })
  }

  const handleGenerate = () => {
    setBlueprintGenerated(true)
    window.scrollTo({ top: 700, behavior: 'smooth' })
  }

  const estimateCost = () => {
    const baseCosts = { small: 800, medium: 1500, large: 2500 }
    const featureCosts = {
      slide: 200,
      swing: 100,
      telescope: 150,
      lights: 75,
      pulley: 50,
      hammock: 80,
      zipline: 400,
      fireman: 250
    }

    let total = baseCosts[selectedOptions.size]
    selectedOptions.features.forEach(f => {
      total += featureCosts[f] || 0
    })

    return total
  }

  const generateMaterialsList = () => {
    const size = sizeOptions.find(s => s.id === selectedOptions.size)
    const materials = [
      { item: '2x4 lumber', quantity: '20-30 pieces', purpose: 'Frame and supports' },
      { item: 'Plywood sheets', quantity: '6-8 sheets', purpose: 'Floor and walls' },
      { item: 'Galvanized screws', quantity: '5 lbs', purpose: 'Assembly' },
      { item: 'Wood stain/paint', quantity: '2-3 gallons', purpose: 'Weatherproofing' },
      { item: 'Roofing material', quantity: `${size?.size} coverage`, purpose: 'Roof protection' }
    ]

    if (selectedOptions.features.includes('slide')) {
      materials.push({ item: 'Plastic slide', quantity: '1 unit (8-10 ft)', purpose: 'Exit feature' })
    }
    if (selectedOptions.features.includes('lights')) {
      materials.push({ item: 'Solar string lights', quantity: '25-50 ft', purpose: 'Illumination' })
    }
    if (selectedOptions.features.includes('pulley')) {
      materials.push({ item: 'Pulley system kit', quantity: '1 set', purpose: 'Lift mechanism' })
    }

    return materials
  }

  const canGenerate = treehouseName.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Games</span>
            </Link>
            <div className="flex items-center gap-2 text-green-600">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm font-medium">30 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl mb-6 shadow-lg">
            <HomeIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dream Treehouse Designer
          </h1>
          <p className="text-xl text-gray-600">
            Design your ultimate backyard treehouse with custom features and blueprints
          </p>
        </div>

        {/* Designer Form */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-green-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-green-500" />
            Design Your Treehouse
          </h2>

          <div className="space-y-8">
            {/* Treehouse Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name Your Treehouse 🎤
              </label>
              <VoiceInput
                value={treehouseName}
                onChange={(newValue) => {
                  const value = typeof newValue === 'string' ? newValue : newValue?.target?.value || ''
                  setTreehouseName(value)
                }}
                placeholder="The Eagle's Nest"
                className="w-full px-4 py-3 pr-12 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Size & Capacity
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedOptions({ ...selectedOptions, size: size.id })}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selectedOptions.size === size.id
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900 text-lg mb-2">{size.name}</div>
                    <div className="text-sm text-gray-600 mb-1">{size.size}</div>
                    <div className="text-xs text-gray-500">{size.capacity}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Treehouse Style
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {styleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedOptions({ ...selectedOptions, style: style.id })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedOptions.style === style.id
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900 mb-1">{style.name}</div>
                    <div className="text-sm text-gray-600">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Special Features (Choose up to 4)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {featureOptions.map((feature) => {
                  const isSelected = selectedOptions.features.includes(feature.id)
                  const canSelect = selectedOptions.features.length < 4 || isSelected

                  return (
                    <button
                      key={feature.id}
                      onClick={() => canSelect && toggleFeature(feature.id)}
                      disabled={!canSelect}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                          : canSelect
                          ? 'border-gray-200 bg-white hover:border-green-300'
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{feature.name}</div>
                      <div className="text-xs text-gray-500">{feature.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Access & Roof */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Access Method
                </label>
                <div className="space-y-2">
                  {accessOptions.map((access) => (
                    <button
                      key={access.id}
                      onClick={() => setSelectedOptions({ ...selectedOptions, access: access.id })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                        selectedOptions.access === access.id
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                    >
                      <span className="font-semibold text-gray-900">{access.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        access.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        access.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {access.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Roof Style
                </label>
                <div className="space-y-2">
                  {roofOptions.map((roof) => (
                    <button
                      key={roof.id}
                      onClick={() => setSelectedOptions({ ...selectedOptions, roof: roof.id })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                        selectedOptions.roof === roof.id
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                    >
                      <span className="font-semibold text-gray-900">{roof.name}</span>
                      <span className="text-xs text-gray-500">{roof.style}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <AgeButton
              onClick={handleGenerate}
              disabled={!canGenerate}
              variant="primary"
              className="w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <WrenchScrewdriverIcon className="w-6 h-6" />
                {canGenerate ? 'Generate Blueprint' : 'Name your treehouse first'}
              </div>
            </AgeButton>

            {/* Auto-save indicator */}
            <div className="mt-4 flex justify-center">
              <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
            </div>
          </div>
        </div>

        {/* Generated Blueprint */}
        {blueprintGenerated && (
          <div className="space-y-8 animate-fadeIn">
            {/* Blueprint Header */}
            <div id="treehouse-blueprint-output" className="bg-white rounded-3xl shadow-xl border-2 border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white">
                <h2 className="text-4xl font-bold text-center mb-2">{treehouseName}</h2>
                <p className="text-center text-lg opacity-90">
                  {styleOptions.find(s => s.id === selectedOptions.style)?.name} • {sizeOptions.find(s => s.id === selectedOptions.size)?.size}
                </p>
              </div>

              <div className="p-8 space-y-6">
                {/* Specifications */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="font-semibold text-gray-900 mb-1">Size</div>
                      <div className="text-gray-700">{sizeOptions.find(s => s.id === selectedOptions.size)?.size}</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <div className="font-semibold text-gray-900 mb-1">Capacity</div>
                      <div className="text-gray-700">{sizeOptions.find(s => s.id === selectedOptions.size)?.capacity}</div>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
                      <div className="font-semibold text-gray-900 mb-1">Access</div>
                      <div className="text-gray-700">{accessOptions.find(a => a.id === selectedOptions.access)?.name}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="font-semibold text-gray-900 mb-1">Roof</div>
                      <div className="text-gray-700">{roofOptions.find(r => r.id === selectedOptions.roof)?.name}</div>
                    </div>
                  </div>
                </div>

                {/* Selected Features */}
                {selectedOptions.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Special Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedOptions.features.map(featureId => {
                        const feature = featureOptions.find(f => f.id === featureId)
                        return (
                          <div key={featureId} className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 text-center">
                            <div className="text-3xl mb-2">{feature?.icon}</div>
                            <div className="font-semibold text-gray-900 text-sm">{feature?.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Materials List */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Materials Needed</h3>
                  <div className="space-y-2">
                    {generateMaterialsList().map((material, i) => (
                      <div key={i} className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{material.item}</div>
                          <div className="text-sm text-gray-600">{material.quantity} • {material.purpose}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Estimate */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-2xl text-white">
                  <div className="text-center">
                    <div className="text-sm opacity-90 mb-2">Estimated Build Cost</div>
                    <div className="text-5xl font-bold mb-2">${estimateCost().toLocaleString()}</div>
                    <div className="text-sm opacity-90">Materials only (DIY build)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Build Tips */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-green-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Building Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">🔨</div>
                  <h4 className="font-bold text-gray-900 mb-2">Start with Safety</h4>
                  <p className="text-sm text-gray-600">
                    Use proper tree protection, install railings, and ensure sturdy construction for kid safety
                  </p>
                </div>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">🌳</div>
                  <h4 className="font-bold text-gray-900 mb-2">Choose the Right Tree</h4>
                  <p className="text-sm text-gray-600">
                    Pick a healthy tree with strong branches at least 8 inches in diameter
                  </p>
                </div>
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">📏</div>
                  <h4 className="font-bold text-gray-900 mb-2">Get Permits</h4>
                  <p className="text-sm text-gray-600">
                    Check local building codes and HOA regulations before starting construction
                  </p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
                  <h4 className="font-bold text-gray-900 mb-2">Build Together</h4>
                  <p className="text-sm text-gray-600">
                    Make it a family project! Kids can help with painting, decorating, and simple tasks
                  </p>
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
                Print Blueprint
              </AgeButton>
              <div className="flex-1">
                <ShareButton
                  elementId="treehouse-blueprint-output"
                  filename={`${treehouseName.replace(/\s+/g, '-')}-treehouse.png`}
                  title={`${treehouseName} Treehouse Blueprint`}
                  text={`Check out our treehouse blueprint design! Created with AI Family Night.`}
                />
              </div>
              <AgeButton
                onClick={() => {
                  setBlueprintGenerated(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Design Another Treehouse
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
