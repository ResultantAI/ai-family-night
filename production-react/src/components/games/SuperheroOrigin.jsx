import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BoltIcon,
  ClockIcon,
  PrinterIcon,
  PhotoIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function SuperheroOrigin() {
  const [childName, setChildName] = useState('')
  const [age, setAge] = useState('')
  const [traits, setTraits] = useState({
    brave: false,
    creative: false,
    kind: false,
    funny: false,
    smart: false,
    athletic: false
  })
  const [favoriteColor, setFavoriteColor] = useState('blue')
  const [superpower, setSuperpower] = useState('flight')
  const [heroGenerated, setHeroGenerated] = useState(false)
  const [generatedHero, setGeneratedHero] = useState(null)

  const traitOptions = [
    { id: 'brave', label: 'Brave', icon: '🦁' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'kind', label: 'Kind', icon: '💝' },
    { id: 'funny', label: 'Funny', icon: '😄' },
    { id: 'smart', label: 'Smart', icon: '🧠' },
    { id: 'athletic', label: 'Athletic', icon: '⚡' }
  ]

  const colorThemes = {
    blue: { primary: '#3b82f6', secondary: '#60a5fa', name: 'Ocean Blue' },
    red: { primary: '#ef4444', secondary: '#f87171', name: 'Crimson Red' },
    purple: { primary: '#a855f7', secondary: '#c084fc', name: 'Royal Purple' },
    green: { primary: '#10b981', secondary: '#34d399', name: 'Emerald Green' },
    gold: { primary: '#f59e0b', secondary: '#fbbf24', name: 'Golden' },
    pink: { primary: '#ec4899', secondary: '#f472b6', name: 'Power Pink' }
  }

  const superpowers = [
    { id: 'flight', name: 'Flight', description: 'Soar through the skies' },
    { id: 'strength', name: 'Super Strength', description: 'Incredible power' },
    { id: 'speed', name: 'Super Speed', description: 'Faster than lightning' },
    { id: 'invisibility', name: 'Invisibility', description: 'Become unseen' },
    { id: 'healing', name: 'Healing', description: 'Heal others instantly' },
    { id: 'teleportation', name: 'Teleportation', description: 'Travel anywhere instantly' }
  ]

  const handleGenerate = () => {
    const selectedTraits = Object.keys(traits).filter(key => traits[key])

    // Generate hero name based on traits and power
    const heroNames = {
      brave: ['Captain', 'Guardian', 'Defender'],
      creative: ['Artisan', 'Visionary', 'Creator'],
      kind: ['Compassion', 'Heart', 'Angel'],
      funny: ['Jester', 'Spark', 'Joy'],
      smart: ['Genius', 'Mind', 'Oracle'],
      athletic: ['Swift', 'Thunder', 'Lightning']
    }

    const primaryTrait = selectedTraits[0] || 'brave'
    const heroPrefix = heroNames[primaryTrait][Math.floor(Math.random() * 3)]
    const heroSuffix = favoriteColor.charAt(0).toUpperCase() + favoriteColor.slice(1)

    const hero = {
      name: `${heroPrefix} ${heroSuffix}`,
      tagline: generateTagline(selectedTraits, superpower),
      origin: generateOrigin(childName, age, selectedTraits),
      powers: generatePowers(superpower, selectedTraits),
      weaknesses: generateWeaknesses(selectedTraits),
      costume: generateCostume(favoriteColor),
      mission: generateMission(selectedTraits)
    }

    setGeneratedHero(hero)
    setHeroGenerated(true)
    window.scrollTo({ top: 600, behavior: 'smooth' })
  }

  const generateTagline = (traits, power) => {
    const taglines = {
      flight: 'Rising above all challenges',
      strength: 'Stronger together, unbreakable apart',
      speed: 'First to help, last to give up',
      invisibility: 'Unseen guardian of the innocent',
      healing: 'Mending hearts and healing wounds',
      teleportation: 'Always there when needed most'
    }
    return taglines[power] || 'Fighting for justice and kindness'
  }

  const generateOrigin = (name, age, traits) => {
    return `${name}, just ${age} years old, discovered their powers on an ordinary day that became extraordinary. While helping a friend in need, ${name} realized they had the gift of ${superpowers.find(p => p.id === superpower)?.name.toLowerCase()}. Now, they use their ${traits.map(t => t).join(', ')} nature to protect their community and inspire others to be heroes too.`
  }

  const generatePowers = (mainPower, traits) => {
    const powers = [superpowers.find(p => p.id === mainPower)?.name]

    if (traits.includes('brave')) powers.push('Fearless courage in the face of danger')
    if (traits.includes('creative')) powers.push('Innovative problem-solving abilities')
    if (traits.includes('kind')) powers.push('Ability to inspire hope in others')
    if (traits.includes('funny')) powers.push('Power to lift spirits with humor')
    if (traits.includes('smart')) powers.push('Brilliant tactical mind')
    if (traits.includes('athletic')) powers.push('Enhanced agility and reflexes')

    return powers
  }

  const generateWeaknesses = (traits) => {
    const weaknesses = []

    if (traits.includes('kind')) weaknesses.push('Sometimes too trusting of others')
    if (traits.includes('creative')) weaknesses.push('Can get distracted by new ideas')
    if (traits.includes('funny')) weaknesses.push('May underestimate serious threats')

    if (weaknesses.length === 0) {
      weaknesses.push('Must rest to recharge powers', 'Stronger in teams than alone')
    }

    return weaknesses
  }

  const generateCostume = (color) => {
    return {
      primary: colorThemes[color].name,
      design: 'Sleek bodysuit with protective armor panels',
      symbol: 'A stylized emblem representing their greatest strength',
      accessories: 'Utility belt with essential hero gear'
    }
  }

  const generateMission = (traits) => {
    if (traits.includes('kind')) return 'Protect the vulnerable and spread kindness'
    if (traits.includes('brave')) return 'Face danger head-on to save others'
    if (traits.includes('creative')) return 'Find innovative solutions to impossible problems'
    return 'Be a beacon of hope in dark times'
  }

  const canGenerate = childName && age && Object.values(traits).some(v => v)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
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
              <span className="text-sm font-medium">25 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-6 shadow-lg">
            <BoltIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Superhero Origin Story
          </h1>
          <p className="text-xl text-gray-600">
            Create a custom superhero based on your child's unique personality
          </p>
        </div>

        {/* Hero Creator Form */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-orange-500" />
            Design Your Hero
          </h2>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Emma"
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="8"
                  min="4"
                  max="16"
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Personality Traits */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Personality Traits (Choose 2-3)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {traitOptions.map((trait) => (
                  <button
                    key={trait.id}
                    onClick={() => setTraits({ ...traits, [trait.id]: !traits[trait.id] })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      traits[trait.id]
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{trait.icon}</div>
                    <div className="font-semibold text-gray-900">{trait.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Costume Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Costume Color
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(colorThemes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setFavoriteColor(key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      favoriteColor === key
                        ? 'border-orange-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: theme.secondary }}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: theme.primary }}></div>
                    <div className="text-xs font-semibold text-gray-900">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Superpower */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Primary Superpower
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {superpowers.map((power) => (
                  <button
                    key={power.id}
                    onClick={() => setSuperpower(power.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      superpower === power.id
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900 mb-1">{power.name}</div>
                    <div className="text-sm text-gray-600">{power.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all transform ${
                canGenerate
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BoltIcon className="w-6 h-6" />
                {canGenerate ? 'Create Superhero' : 'Fill in all fields first'}
              </div>
            </button>
          </div>
        </div>

        {/* Generated Hero */}
        {heroGenerated && generatedHero && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Card */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden">
              <div
                className="p-8 text-white"
                style={{
                  background: `linear-gradient(135deg, ${colorThemes[favoriteColor].primary}, ${colorThemes[favoriteColor].secondary})`
                }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                    <ShieldCheckIcon className="w-14 h-14" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-center mb-2">{generatedHero.name}</h2>
                <p className="text-xl text-center opacity-90 italic">"{generatedHero.tagline}"</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Origin Story */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-orange-500" />
                    Origin Story
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
                    {generatedHero.origin}
                  </p>
                </div>

                {/* Powers */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Superpowers</h3>
                  <div className="space-y-2">
                    {generatedHero.powers.map((power, i) => (
                      <div key={i} className="flex items-start gap-3 bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <BoltIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{power}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Costume */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Costume Design</h3>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200 space-y-3">
                    <div>
                      <span className="font-semibold text-gray-900">Primary Color:</span>{' '}
                      <span className="text-gray-700">{generatedHero.costume.primary}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Design:</span>{' '}
                      <span className="text-gray-700">{generatedHero.costume.design}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Symbol:</span>{' '}
                      <span className="text-gray-700">{generatedHero.costume.symbol}</span>
                    </div>
                  </div>
                </div>

                {/* Weaknesses */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Weaknesses</h3>
                  <div className="space-y-2">
                    {generatedHero.weaknesses.map((weakness, i) => (
                      <div key={i} className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <span className="text-amber-600 flex-shrink-0 mt-0.5">⚠️</span>
                        <span className="text-gray-700">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mission */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-2xl text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Hero's Mission</h3>
                  <p className="text-lg italic">"{generatedHero.mission}"</p>
                </div>
              </div>
            </div>

            {/* Drawing Prompt */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Bring Your Hero to Life!
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <div className="text-3xl mb-3 text-center">✏️</div>
                  <h4 className="font-bold text-gray-900 mb-2">Draw Your Hero</h4>
                  <p className="text-sm text-gray-600">
                    Sketch {generatedHero.name} in their {generatedHero.costume.primary} costume using the powers!
                  </p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                  <div className="text-3xl mb-3 text-center">📖</div>
                  <h4 className="font-bold text-gray-900 mb-2">Write an Adventure</h4>
                  <p className="text-sm text-gray-600">
                    Create a story about {generatedHero.name}'s first mission saving the day!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-white border-2 border-orange-300 hover:border-orange-500 text-orange-600 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Hero Profile
              </button>
              <button
                onClick={() => {
                  setHeroGenerated(false)
                  setChildName('')
                  setAge('')
                  setTraits({
                    brave: false,
                    creative: false,
                    kind: false,
                    funny: false,
                    smart: false,
                    athletic: false
                  })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <SparklesIcon className="w-5 h-5" />
                Create Another Hero
              </button>
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
