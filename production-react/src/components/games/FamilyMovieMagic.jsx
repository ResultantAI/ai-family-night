import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FilmIcon,
  ClockIcon,
  PrinterIcon,
  ArrowLeftIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useAutoSave, loadSavedState, saveToGallery, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'
import ShareButton from '../ShareButton'
import { generateWithRateLimit } from '../../services/claudeService'
import VoiceInput from '../VoiceInput'
import AgeButton from '../AgeButton'
import Soundboard from '../Soundboard'
import { isGrandmaModeEnabled } from '../../utils/moderation'

export default function FamilyMovieMagic() {
  // Load saved state
  const savedState = loadSavedState('movie-magic-game', {})

  // Check if Extra Safe Mode is enabled and set game title dynamically
  const [gameTitle, setGameTitle] = useState('Family Movie Magic')

  useEffect(() => {
    const grandmaMode = isGrandmaModeEnabled()
    setGameTitle(grandmaMode ? 'Family Movie Night' : 'Family Movie Magic')
  }, [])

  const [cast, setCast] = useState(savedState.cast || [
    { name: '', role: 'Hero' },
    { name: '', role: 'Villain' },
    { name: '', role: 'Sidekick' },
    { name: '', role: 'Wildcard' }
  ])
  const [genre, setGenre] = useState(savedState.genre || 'sci-fi')
  const [setting, setSetting] = useState(savedState.setting || '')
  const [scriptGenerated, setScriptGenerated] = useState(false)
  const [generatedScript, setGeneratedScript] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Auto-save game state
  const gameState = { cast, genre, setting }
  useAutoSave('movie-magic-game', gameState, 1000)

  const roleOptions = ['Hero', 'Villain', 'Sidekick', 'Comic Relief', 'The Oracle', 'The Pet', 'Wildcard']

  const genreOptions = [
    { id: 'sci-fi', name: 'Sci-Fi Adventure', icon: '🚀', description: 'Space battles and futuristic tech' },
    { id: 'western', name: 'Spaghetti Western', icon: '🤠', description: 'Showdowns at high noon' },
    { id: 'sitcom', name: '90s Sitcom', icon: '📺', description: 'Laugh track included' },
    { id: 'zombie', name: 'Zombie Apocalypse', icon: '🧟', description: 'Survival mode activated' },
    { id: 'noir', name: 'Noir Detective', icon: '🕵️', description: 'Dark alleys and mysteries' },
    { id: 'superhero', name: 'Superhero Origin', icon: '🦸', description: 'Powers activate!' }
  ]

  const updateCast = (index, field, value) => {
    const newCast = [...cast]
    newCast[index][field] = value
    setCast(newCast)
  }

  const addCastMember = () => {
    if (cast.length < 6) {
      setCast([...cast, { name: '', role: 'Wildcard' }])
    }
  }

  const removeCastMember = (index) => {
    if (cast.length > 2) {
      const newCast = cast.filter((_, i) => i !== index)
      setCast(newCast)
    }
  }

  const randomizeRoles = () => {
    const shuffledRoles = [...roleOptions].sort(() => Math.random() - 0.5)
    const newCast = cast.map((member, index) => ({
      ...member,
      role: shuffledRoles[index % shuffledRoles.length]
    }))
    setCast(newCast)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const selectedGenre = genreOptions.find(g => g.id === genre)
      const castWithNames = cast.filter(c => c.name.trim())

      if (castWithNames.length < 2) {
        setError('Please add at least 2 family members with names')
        setIsGenerating(false)
        return
      }

      // Prepare cast information for Claude
      const castInfo = castWithNames.map(c => `${c.name} (${c.role})`).join(', ')

      // Call Claude API with security measures
      console.log('🎬 Generating movie script with Claude...')

      const result = await generateWithRateLimit({
        userInput: `Create a fun family movie script`,
        gameContext: 'family-movie',
        additionalData: {
          cast: castWithNames,
          genre: selectedGenre.id,
          setting: setting || `a ${selectedGenre.name.toLowerCase()} setting`
        },
        maxTokens: 2048,
        temperature: 0.8
      })

      if (!result.success) {
        console.warn('Claude API failed, using fallback:', result.error)
        // Fall back to template-based generation
        const script = generateScript(cast, selectedGenre, setting)
        setGeneratedScript(script)
        setScriptGenerated(true)
        setError(`AI generation unavailable. Using template. (${result.error})`)
      } else {
        // Parse Claude's response into script format
        const script = parseClaudeScriptResponse(result.content, castWithNames, selectedGenre)
        setGeneratedScript(script)
        setScriptGenerated(true)
        setError(null)

        // Save to gallery
        saveToGallery({
          gameName: gameTitle,
          data: { script, cast, genre, setting },
          preview: `${script.title} - ${selectedGenre.name}`
        })
      }

      window.scrollTo({ top: 600, behavior: 'smooth' })

    } catch (error) {
      console.error('Error generating script:', error)
      setError(`Generation failed: ${error.message}`)

      // Fall back to template-based generation
      const selectedGenre = genreOptions.find(g => g.id === genre)
      const script = generateScript(cast, selectedGenre, setting)
      setGeneratedScript(script)
      setScriptGenerated(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const parseClaudeScriptResponse = (claudeText, castList, genreData) => {
    // Extract title (look for all caps title at the beginning)
    const titleMatch = claudeText.match(/^([A-Z\s:]+)\n/m)
    const title = titleMatch ? titleMatch[1].trim() : `${genreData.name} Adventure`

    // Extract scenes by looking for scene headings (INT./EXT. format)
    const scenePattern = /((?:INT\.|EXT\.)[^\n]+)\n([^]*?)(?=(?:INT\.|EXT\.)|FADE TO BLACK|$)/gi
    const sceneMatches = [...claudeText.matchAll(scenePattern)]

    const scenes = sceneMatches.map(match => {
      const heading = match[1].trim()
      const content = match[2].trim()

      // Extract action lines and dialogue
      const dialoguePattern = /([A-Z\s]+)\n(?:\(([^)]+)\)\n)?(?:[""]([^""]+)[""]|([^\n]+))/g
      const actionPattern = /^(?![A-Z\s]+\n)[^\n]+/gm

      const dialogue = []
      let dialogueMatch

      while ((dialogueMatch = dialoguePattern.exec(content)) !== null) {
        dialogue.push({
          character: dialogueMatch[1].trim(),
          line: dialogueMatch[3] || dialogueMatch[4] || '',
          direction: dialogueMatch[2] || ''
        })
      }

      // Get action (everything before first character name)
      const firstCharIndex = content.search(/[A-Z\s]+\n/)
      const action = firstCharIndex > 0 ? content.slice(0, firstCharIndex).trim() : 'The scene unfolds.'

      return {
        heading,
        action,
        dialogue: dialogue.length > 0 ? dialogue : [{
          character: castList[0]?.name || 'HERO',
          line: 'This is going to be amazing!',
          direction: ''
        }]
      }
    })

    return {
      title,
      genre: genreData.name,
      sceneHeading: scenes[0]?.heading || 'INT. LOCATION - DAY',
      scenes: scenes.length > 0 ? scenes : generateSceneDialogue(castList, genreData.id, 'INT. LOCATION - DAY'),
      castList
    }
  }

  const generateScript = (castList, genreData, customSetting) => {
    const castWithNames = castList.filter(c => c.name.trim())

    // Generate title
    const hero = castWithNames.find(c => c.role === 'Hero')?.name || 'The Family'
    const genreTitles = {
      'sci-fi': [`${hero} and the Lost Galaxy`, `Star Wars Episode ${Math.floor(Math.random() * 10)}: ${hero} Strikes Back`],
      'western': [`The Good, The Bad, and ${hero}`, `${hero}'s Last Stand`],
      'sitcom': [`Full House of ${hero}`, `${hero} Knows Best`],
      'zombie': [`World War ${hero[0]}`, `${hero} vs. The Undead`],
      'noir': [`The ${hero} Files`, `${hero}: Private Eye`],
      'superhero': [`The Amazing ${hero}`, `${hero}: Origin Story`]
    }

    const titleOptions = genreTitles[genreData.id] || [`The ${hero} Story`]
    const title = titleOptions[Math.floor(Math.random() * titleOptions.length)]

    // Generate scene setting
    const defaultSettings = {
      'sci-fi': 'INT. SPACESHIP BRIDGE - NIGHT',
      'western': 'EXT. DUSTY TOWN SQUARE - HIGH NOON',
      'sitcom': 'INT. LIVING ROOM - DAY',
      'zombie': 'INT. ABANDONED WAREHOUSE - DUSK',
      'noir': 'INT. DIMLY LIT OFFICE - NIGHT',
      'superhero': 'EXT. CITY ROOFTOP - SUNSET'
    }

    const sceneHeading = customSetting || defaultSettings[genreData.id]

    // Generate dialogue based on genre
    const scenes = generateSceneDialogue(castWithNames, genreData.id, sceneHeading)

    return {
      title,
      genre: genreData.name,
      sceneHeading,
      scenes,
      castList: castWithNames
    }
  }

  const generateSceneDialogue = (castList, genreId, sceneHeading) => {
    // Simplified script generation - in production, this would call an LLM API
    const hero = castList.find(c => c.role === 'Hero')
    const villain = castList.find(c => c.role === 'Villain')
    const sidekick = castList.find(c => c.role === 'Sidekick')

    const scenes = []

    // Opening scene
    scenes.push({
      heading: sceneHeading,
      action: `${hero?.name || 'Our hero'} enters, looking determined.`,
      dialogue: [
        {
          character: hero?.name || 'HERO',
          line: getHeroOpening(genreId),
          direction: 'confidently'
        }
      ]
    })

    // Villain entrance
    if (villain) {
      scenes.push({
        heading: sceneHeading,
        action: `Suddenly, ${villain.name} appears!`,
        dialogue: [
          {
            character: villain.name,
            line: getVillainLine(genreId),
            direction: 'menacingly'
          }
        ]
      })
    }

    // Sidekick helps
    if (sidekick) {
      scenes.push({
        heading: sceneHeading,
        action: `${sidekick.name} jumps into action.`,
        dialogue: [
          {
            character: sidekick.name,
            line: getSidekickLine(genreId),
            direction: 'heroically'
          }
        ]
      })
    }

    // Climax
    scenes.push({
      heading: sceneHeading,
      action: 'The final showdown begins!',
      dialogue: [
        {
          character: hero?.name || 'HERO',
          line: getHeroClimaxLine(genreId),
          direction: 'dramatically'
        }
      ]
    })

    // Resolution
    scenes.push({
      heading: sceneHeading,
      action: 'The family comes together. FREEZE FRAME.',
      dialogue: [
        {
          character: 'ALL',
          line: '"We did it... together!"',
          direction: 'in unison'
        }
      ]
    })

    return scenes
  }

  const getHeroOpening = (genre) => {
    const openings = {
      'sci-fi': '"Computer, scan for life signs. We need to find them before it\'s too late!"',
      'western': '"This town ain\'t big enough for the both of us."',
      'sitcom': '"Did I do thaaaat? No seriously, who left the kitchen like this?"',
      'zombie': '"Alright team, grab your supplies. We survive together or not at all."',
      'noir': '"The city\'s got secrets. And I\'m about to shine a light on every last one."',
      'superhero': '"With great power comes... wait, what was I supposed to say?"'
    }
    return openings[genre] || '"Let\'s do this!"'
  }

  const getVillainLine = (genre) => {
    const lines = {
      'sci-fi': '"Your puny planet is no match for my technology!"',
      'western': '"I\'ve been waiting for you, partner. Draw!"',
      'sitcom': '"You\'ll never get away with this... *laugh track*"',
      'zombie': '"Braaaains... I mean, your supplies! Hand them over!"',
      'noir': '"You\'re digging where you shouldn\'t, detective. It\'s gonna get you hurt."',
      'superhero': '"You think you can stop me? I\'ve already won!"'
    }
    return lines[genre] || '"Muahahaha!"'
  }

  const getSidekickLine = (genre) => {
    const lines = {
      'sci-fi': '"Captain, I\'ve rerouted power to the shields!"',
      'western': '"I got your back, partner!"',
      'sitcom': '"Did someone say... pizza?"',
      'zombie': '"I found a baseball bat! Let\'s go!"',
      'noir': '"Boss, I think I found the clue we\'ve been looking for."',
      'superhero': '"Your powers are cool, but have you tried... teamwork?"'
    }
    return lines[genre] || '"I\'m here to help!"'
  }

  const getHeroClimaxLine = (genre) => {
    const lines = {
      'sci-fi': '"Engaging hyperdrive... in 3... 2... 1!"',
      'western': '"It\'s high noon, friend."',
      'sitcom': '"What would we do without family? *wink at camera*"',
      'zombie': '"This ends NOW! *swings weapon*"',
      'noir': '"Case closed. Justice served."',
      'superhero': '"Time to save the day!"'
    }
    return lines[genre] || '"This is for the family!"'
  }

  const canGenerate = cast.filter(c => c.name.trim()).length >= 2

  if (scriptGenerated && generatedScript) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Back to Games</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Script Display */}
          <div id="movie-script" className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-12 mb-8">
            {/* Title Page */}
            <div className="text-center mb-12 pb-12 border-b-2 border-gray-200">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 font-mono">
                {generatedScript.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                A {generatedScript.genre} Production
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Starring:</p>
                {generatedScript.castList.map((member, i) => (
                  <p key={i} className="font-semibold">
                    {member.name} as {member.role}
                  </p>
                ))}
              </div>
            </div>

            {/* Script Content */}
            <div className="space-y-8 font-mono">
              {generatedScript.scenes.map((scene, sceneIndex) => (
                <div key={sceneIndex} className="space-y-4">
                  {/* Scene Heading */}
                  <div className="font-bold text-center uppercase">
                    {scene.heading}
                  </div>

                  {/* Action */}
                  {scene.action && (
                    <p className="text-gray-700">{scene.action}</p>
                  )}

                  {/* Dialogue */}
                  {scene.dialogue.map((line, lineIndex) => (
                    <div key={lineIndex} className="ml-16">
                      <div className="font-bold text-center mb-1">{line.character}</div>
                      {line.direction && (
                        <div className="text-sm italic text-gray-600 text-center mb-1">
                          ({line.direction})
                        </div>
                      )}
                      <div className="text-center">{line.line}</div>
                    </div>
                  ))}
                </div>
              ))}

              {/* The End */}
              <div className="text-center pt-8 text-2xl font-bold">
                FADE TO BLACK.
              </div>
              <div className="text-center text-3xl font-bold">
                THE END
              </div>
            </div>
          </div>

          {/* Soundboard */}
          <div className="mt-8">
            <Soundboard />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <AgeButton
              onClick={() => window.print()}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <PrinterIcon className="w-5 h-5" />
              Print Script
            </AgeButton>

            <ShareButton
              elementId="movie-script"
              filename={`${generatedScript.title.replace(/\s+/g, '-')}.png`}
              title={generatedScript.title}
              text={`Check out our family movie script: ${generatedScript.title}!`}
            />

            <AgeButton
              onClick={() => {
                setScriptGenerated(false)
                setGeneratedScript(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Create Another
            </AgeButton>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">🎬 Director's Tips:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Assign parts and do a "table read" together</li>
              <li>• Add funny voices or accents for each character</li>
              <li>• Film yourselves reading the script (perfect for TikTok!)</li>
              <li>• Use props from around the house for extra laughs</li>
              <li>• Keep the script and perform it again at family reunions</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <FilmIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {gameTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create a custom movie script for your family to perform together!
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 mb-8">
          {/* Cast */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-7 h-7 text-purple-500" />
                Cast Your Family
              </h2>
              <button
                onClick={randomizeRoles}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 rounded-lg font-semibold transition-all"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Randomize Roles
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {cast.map((member, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Name 🎤
                      </label>
                      <VoiceInput
                        value={member.name}
                        onChange={(e) => updateCast(index, 'name', e.target.value)}
                        placeholder="Family member"
                        className="w-full px-3 py-2 pr-10 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={member.role}
                        onChange={(e) => updateCast(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {roleOptions.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {cast.length > 2 && (
                    <button
                      onClick={() => removeCastMember(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {cast.length < 6 && (
              <button
                onClick={addCastMember}
                className="text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center gap-2"
              >
                + Add Another Family Member
              </button>
            )}
          </div>

          {/* Genre */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FilmIcon className="w-7 h-7 text-purple-500" />
              Pick Your Genre
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {genreOptions.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    genre === g.id
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{g.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{g.name}</div>
                  <div className="text-sm text-gray-600">{g.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Setting (Optional) */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Setting (Optional) 🎤 <span className="text-xs text-gray-500">(Click mic to speak)</span>
            </label>
            <VoiceInput
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="e.g., 'Our Kitchen' or 'The Backyard'"
              className="w-full px-4 py-3 pr-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all ${
              canGenerate && !isGenerating
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-6 h-6 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Generate Movie Script
                </>
              )}
            </span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-yellow-800 text-sm">
                ⚠️ {error}
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">How it works:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">1.</span>
              Enter family member names and assign roles
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">2.</span>
              Pick a movie genre that sounds fun
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">3.</span>
              Get a custom 3-minute script to perform together
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">4.</span>
              Read it aloud as a family (or film it for social media!)
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
