import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserGroupIcon,
  ClockIcon,
  PrinterIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import VoiceInput from '../VoiceInput'
import AgeButton from '../AgeButton'
import { useAutoSave, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'

export default function FamilyCharacterQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [quizStarted, setQuizStarted] = useState(false)

  // Auto-save game state
  const gameState = { currentQuestion, answers, quizComplete, playerName, quizStarted }
  const { saveStatus, lastSaved } = useAutoSave(
    'family-character-quiz',
    gameState,
    { useSupabase: false, gameId: 'family-character-quiz' }
  )

  const questions = [
    {
      question: "What's your ideal Saturday morning?",
      options: [
        { id: 'A', text: 'Reading a book in a cozy spot', traits: ['wise', 'calm'] },
        { id: 'B', text: 'Adventure outdoors', traits: ['brave', 'adventurous'] },
        { id: 'C', text: 'Creating art or music', traits: ['creative', 'dreamy'] },
        { id: 'D', text: 'Helping organize a family project', traits: ['responsible', 'caring'] }
      ]
    },
    {
      question: "Your friend needs help. What do you do?",
      options: [
        { id: 'A', text: 'Listen and offer wise advice', traits: ['wise', 'caring'] },
        { id: 'B', text: 'Jump into action immediately', traits: ['brave', 'loyal'] },
        { id: 'C', text: 'Find a creative solution', traits: ['creative', 'clever'] },
        { id: 'D', text: 'Make a plan and follow through', traits: ['responsible', 'loyal'] }
      ]
    },
    {
      question: "What's your biggest strength?",
      options: [
        { id: 'A', text: 'Understanding and empathy', traits: ['wise', 'caring'] },
        { id: 'B', text: 'Courage and determination', traits: ['brave', 'strong'] },
        { id: 'C', text: 'Imagination and creativity', traits: ['creative', 'dreamy'] },
        { id: 'D', text: 'Organization and reliability', traits: ['responsible', 'clever'] }
      ]
    },
    {
      question: "Pick a superpower:",
      options: [
        { id: 'A', text: 'Read minds and understand feelings', traits: ['wise', 'caring'] },
        { id: 'B', text: 'Super strength or bravery', traits: ['brave', 'strong'] },
        { id: 'C', text: 'Make anything from imagination', traits: ['creative', 'dreamy'] },
        { id: 'D', text: 'Perfect planning and organization', traits: ['responsible', 'clever'] }
      ]
    },
    {
      question: "How do you handle challenges?",
      options: [
        { id: 'A', text: 'Think deeply and learn from them', traits: ['wise', 'calm'] },
        { id: 'B', text: 'Face them head-on with courage', traits: ['brave', 'strong'] },
        { id: 'C', text: 'Find unique, creative solutions', traits: ['creative', 'clever'] },
        { id: 'D', text: 'Make a strategy and execute it', traits: ['responsible', 'clever'] }
      ]
    }
  ]

  const characters = {
    wise: { name: 'Moana', description: 'Wise navigator who follows their heart and leads with compassion', color: 'from-blue-400 to-teal-500' },
    brave: { name: 'Mulan', description: 'Courageous warrior who stands up for what\'s right', color: 'from-red-400 to-pink-500' },
    creative: { name: 'Rapunzel', description: 'Creative dreamer who sees beauty in everything', color: 'from-purple-400 to-pink-500' },
    responsible: { name: 'Elsa', description: 'Responsible leader who protects those they love', color: 'from-blue-300 to-cyan-400' },
    caring: { name: 'Anna', description: 'Caring heart who puts family first', color: 'from-orange-400 to-rose-500' },
    adventurous: { name: 'Merida', description: 'Adventurous spirit who blazes their own trail', color: 'from-orange-500 to-amber-600' },
    dreamy: { name: 'Belle', description: 'Dreamy intellectual who values knowledge', color: 'from-yellow-400 to-amber-500' },
    loyal: { name: 'Simba', description: 'Loyal leader who rises to challenges', color: 'from-orange-500 to-red-600' },
    clever: { name: 'Raya', description: 'Clever strategist who brings people together', color: 'from-teal-400 to-green-500' }
  }

  const handleAnswer = (option) => {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizComplete(true)
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }
  }

  const calculateResult = () => {
    const traitCounts = {}

    answers.forEach(answer => {
      answer.traits.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1
      })
    })

    const topTrait = Object.keys(traitCounts).reduce((a, b) =>
      traitCounts[a] > traitCounts[b] ? a : b
    )

    return characters[topTrait] || characters.wise
  }

  const startQuiz = () => {
    if (playerName.trim()) {
      setQuizStarted(true)
    }
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setAnswers([])
    setQuizComplete(false)
    setPlayerName('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
              <UserGroupIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Family Character Quiz
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover which character matches your personality!
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your name? 🎤
              </label>
              <VoiceInput
                value={playerName}
                onChange={setPlayerName}
                onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
                placeholder="Emma"
                className="w-full px-4 py-3 pr-12 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  Answer 5 personality questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  Discover your character match
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  Have each family member take the quiz
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">✓</span>
                  Compare results and share laughs!
                </li>
              </ul>
            </div>

            <AgeButton
              onClick={startQuiz}
              disabled={!playerName.trim()}
              variant="primary"
              className="w-full"
            >
              Start Quiz
            </AgeButton>

            {/* Auto-save indicator */}
            <div className="mt-4 flex justify-center">
              <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (quizComplete) {
    const result = calculateResult()

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Back to Games</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden animate-fadeIn">
            <div className={`bg-gradient-to-r ${result.color} p-12 text-white text-center`}>
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold mb-2">{playerName}, you are...</h2>
              <h3 className="text-5xl font-bold mb-4">{result.name}!</h3>
              <p className="text-xl opacity-90">{result.description}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-xl">What This Means:</h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    Just like {result.name}, you have a unique way of seeing the world. Your personality shines through in everything you do!
                  </p>
                  <p className="font-semibold text-purple-700">
                    Share your result with your family and have everyone take the quiz!
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Fun Activities:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>🎬</span>
                    Watch {result.name}'s movie together as a family
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🎨</span>
                    Draw yourself as {result.name}
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📖</span>
                    Read stories about {result.name}'s adventures
                  </li>
                  <li className="flex items-start gap-2">
                    <span>👗</span>
                    Dress up as your character for family photo day!
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <AgeButton
              onClick={() => window.print()}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <PrinterIcon className="w-5 h-5" />
              Print Result
            </AgeButton>
            <AgeButton
              onClick={resetQuiz}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Take Quiz Again
            </AgeButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="flex-1 max-w-md mx-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-purple-600 mb-2">Hey {playerName}!</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {questions[currentQuestion].question}
            </h2>
          </div>

          <div className="space-y-4">
            {questions[currentQuestion].options.map((option) => (
              <AgeButton
                key={option.id}
                onClick={() => handleAnswer(option)}
                variant="secondary"
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center font-bold text-purple-700 group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all">
                      {option.id}
                    </div>
                    <span className="text-lg font-medium text-gray-900">{option.text}</span>
                  </div>
                  <ArrowRightIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-all" />
                </div>
              </AgeButton>
            ))}
          </div>
        </div>
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
