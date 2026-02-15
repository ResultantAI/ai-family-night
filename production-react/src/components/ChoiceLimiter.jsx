import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getMaxChoices, getGridGapClasses } from '../utils/age-appropriate'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

/**
 * Choice Limiter Component
 * Research: Working memory limits vary by age
 * - Ages 5-7: Max 3 primary choices (prevents overwhelm)
 * - Ages 8-10: Max 5 choices
 * - Ages 11-12: Max 7 choices
 *
 * Usage:
 * <ChoiceLimiter
 *   choices={allChoices}
 *   renderChoice={(choice) => <ChoiceCard {...choice} />}
 *   onSelect={handleSelect}
 * />
 */
export default function ChoiceLimiter({
  choices,
  renderChoice,
  onSelect,
  multiSelect = false,
  selected = null,
  className = '',
  showMoreLabel = "Show More Options",
  showLessLabel = "Show Fewer Options"
}) {
  const [childAge, setChildAge] = useState(8) // Default to middle age range
  const [showAll, setShowAll] = useState(false)
  const [maxChoices, setMaxChoices] = useState(5)

  useEffect(() => {
    const loadChildAge = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.child_age) {
        const age = parseInt(user.user_metadata.child_age)
        setChildAge(age)
        setMaxChoices(getMaxChoices(age))
      }
    }
    loadChildAge()
  }, [])

  // Determine which choices to show
  const visibleChoices = showAll ? choices : choices.slice(0, maxChoices)
  const hasHiddenChoices = choices.length > maxChoices

  // Get age-appropriate grid spacing
  const gridGapClasses = getGridGapClasses(childAge)

  return (
    <div className={className}>
      {/* Choice Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gridGapClasses}`}>
        {visibleChoices.map((choice, index) => (
          <div
            key={choice.id || index}
            onClick={() => onSelect(choice)}
            className="cursor-pointer"
          >
            {renderChoice(choice, {
              isSelected: multiSelect
                ? selected?.includes(choice.id)
                : selected === choice.id
            })}
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasHiddenChoices && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            {showAll ? (
              <>
                <span>↑</span>
                <span>{showLessLabel}</span>
              </>
            ) : (
              <>
                <span>↓</span>
                <span>{showMoreLabel}</span>
                <span className="text-sm text-gray-500">({choices.length - maxChoices} more)</span>
              </>
            )}
          </button>

          {/* Age-appropriate hint */}
          {!showAll && childAge >= 5 && childAge <= 7 && (
            <div className="mt-4 inline-flex items-start gap-2 p-3 bg-blue-50 rounded-lg max-w-md">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                We're showing {maxChoices} choices to make it easier to decide. Click "Show More" if you want to see all {choices.length} options!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Simple Choice Limiter for Lists
 * Use when you just need to limit items without rendering custom components
 */
export function SimpleChoiceLimiter({
  items,
  renderItem,
  className = ''
}) {
  const [childAge, setChildAge] = useState(8)
  const [showAll, setShowAll] = useState(false)
  const [maxItems, setMaxItems] = useState(5)

  useEffect(() => {
    const loadChildAge = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.child_age) {
        const age = parseInt(user.user_metadata.child_age)
        setChildAge(age)
        setMaxItems(getMaxChoices(age))
      }
    }
    loadChildAge()
  }, [])

  const visibleItems = showAll ? items : items.slice(0, maxItems)
  const hasHidden = items.length > maxItems

  return (
    <div className={className}>
      <div className="space-y-3">
        {visibleItems.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {hasHidden && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          {showAll ? (
            <>↑ Show Less</>
          ) : (
            <>↓ Show {items.length - maxItems} More</>
          )}
        </button>
      )}
    </div>
  )
}

/**
 * Hook for manual choice limiting
 * Use when you need more control over the rendering
 */
export function useChoiceLimiter(choices) {
  const [childAge, setChildAge] = useState(8)
  const [showAll, setShowAll] = useState(false)
  const [maxChoices, setMaxChoices] = useState(5)

  useEffect(() => {
    const loadChildAge = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.child_age) {
        const age = parseInt(user.user_metadata.child_age)
        setChildAge(age)
        setMaxChoices(getMaxChoices(age))
      }
    }
    loadChildAge()
  }, [])

  const visibleChoices = showAll ? choices : choices.slice(0, maxChoices)
  const hasHiddenChoices = choices.length > maxChoices
  const hiddenCount = choices.length - maxChoices

  const toggleShowAll = () => setShowAll(!showAll)

  return {
    childAge,
    maxChoices,
    visibleChoices,
    hasHiddenChoices,
    hiddenCount,
    showAll,
    toggleShowAll
  }
}
