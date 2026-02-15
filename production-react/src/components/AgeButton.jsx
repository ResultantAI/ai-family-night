import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getButtonClasses } from '../utils/age-appropriate'

/**
 * Age-Appropriate Button Component
 * Automatically sizes based on child's age from user metadata
 *
 * Usage:
 * <AgeButton onClick={handleClick} variant="primary">
 *   Start Game
 * </AgeButton>
 */
export default function AgeButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const [childAge, setChildAge] = useState(8) // Default to middle age range

  useEffect(() => {
    const loadChildAge = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.child_age) {
        setChildAge(parseInt(user.user_metadata.child_age))
      }
    }
    loadChildAge()
  }, [])

  const ageClasses = getButtonClasses(childAge, variant)
  const combinedClasses = `${ageClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Age-Appropriate Icon Button
 * For buttons with just an icon
 */
export function AgeIconButton({
  icon: Icon,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  ariaLabel,
  ...props
}) {
  const [childAge, setChildAge] = useState(8)

  useEffect(() => {
    const loadChildAge = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.child_age) {
        setChildAge(parseInt(user.user_metadata.child_age))
      }
    }
    loadChildAge()
  }, [])

  // Icon buttons need to be square
  let iconSize = 'w-6 h-6'
  let buttonSize = 'w-[76px] h-[76px]'

  if (childAge >= 5 && childAge <= 7) {
    iconSize = 'w-10 h-10'
    buttonSize = 'w-[76px] h-[76px]'
  } else if (childAge >= 8 && childAge <= 10) {
    iconSize = 'w-8 h-8'
    buttonSize = 'w-[57px] h-[57px]'
  } else {
    iconSize = 'w-6 h-6'
    buttonSize = 'w-[44px] h-[44px]'
  }

  const ageClasses = getButtonClasses(childAge, variant)
  const combinedClasses = `${ageClasses} ${buttonSize} flex items-center justify-center ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon className={iconSize} />
    </button>
  )
}
