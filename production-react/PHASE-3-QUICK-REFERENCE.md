# Phase 3: Quick Reference Card

## 🎯 For Developers

### **Using AgeButton**

```jsx
import AgeButton from '../AgeButton'

// Replace this:
<button onClick={handleClick} className="...">
  Click Me
</button>

// With this:
<AgeButton onClick={handleClick} variant="primary">
  Click Me
</AgeButton>
```

**Variants:**
- `primary` - Purple gradient (main actions)
- `secondary` - White with purple border (alternative actions)
- `success` - Green gradient (positive actions)
- `danger` - Red gradient (destructive actions)

**Automatic Sizing:**
- Age 5-7: 76x76px minimum
- Age 8-10: 57x57px minimum
- Age 11-12: 44x44px minimum

---

### **Using Auto-Save**

```jsx
import { useAutoSave, AutoSaveIndicator } from '../../hooks/useAutoSave'

function MyGame() {
  const [gameData, setGameData] = useState({})

  // Add auto-save
  const { saveStatus, lastSaved } = useAutoSave(
    'my-game-key',
    gameData,
    { useSupabase: false, gameId: 'my-game' }
  )

  return (
    <div>
      {/* Your game UI */}

      {/* Add save indicator */}
      <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
    </div>
  )
}
```

**Automatic Intervals:**
- Age 5-7: Every 30 seconds
- Age 8-10: Every 60 seconds
- Age 11-12: Every 120 seconds

---

### **Using Choice Limiter**

```jsx
import ChoiceLimiter from '../ChoiceLimiter'

const allOptions = [
  { id: 1, name: 'Option 1' },
  { id: 2, name: 'Option 2' },
  // ... up to 20 options
]

<ChoiceLimiter
  choices={allOptions}
  renderChoice={(choice) => (
    <div>{choice.name}</div>
  )}
  onSelect={handleSelect}
/>
```

**Automatic Limiting:**
- Age 5-7: Shows max 3 choices
- Age 8-10: Shows max 5 choices
- Age 11-12: Shows max 7 choices

---

### **Using Fun Loaders**

```jsx
import { FunLoader, FullPageLoader, InlineLoader } from '../FunLoader'

// Inline loader
<FunLoader type="dance" message="Creating your adventure..." />

// Full page loader
<FullPageLoader type="bounce" message="Loading game..." />

// Button loader
<InlineLoader size="md" />
```

**Types:**
- `dance` - Bouncing emoji with sparkles
- `bounce` - 5 stars bouncing in sequence
- `rainbow` - Animated rainbow progress bar

---

### **Using Voice Input**

```jsx
import VoiceInput from '../VoiceInput'

const [text, setText] = useState('')

<VoiceInput
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Click to speak"
  className="w-full"
/>
```

**Features:**
- Automatic browser detection
- Volume meter
- Real-time transcription
- Works best on Chrome/Safari

---

### **Using Read-Aloud** ⭐ **NEW!**

```jsx
import ReadAloud from '../ReadAloud'

const storyText = "Once upon a time..."

<ReadAloud text={storyText} />

// With custom settings
<ReadAloud
  text={storyText}
  rate={0.8}       // Manual speed override
  pitch={1.1}      // Voice pitch
  variant="primary" // Button style
/>
```

**Features:**
- Browser-native Text-to-Speech (Chrome, Safari, Edge)
- Age-appropriate reading speed (auto-calculated)
  - Ages 5-7: 0.75x speed (25% slower)
  - Ages 8-10: 0.9x speed (10% slower)
  - Ages 11-12: 1.0x normal speed
- Pause/Resume controls
- Visual feedback (animated sound waves)
- Graceful fallback for unsupported browsers

**Icon Variant:**
```jsx
import { ReadAloudIcon } from '../ReadAloud'

<ReadAloudIcon text={shortText} className="inline-block" />
```

---

## 📏 Age-Appropriate Utilities

### **Get Button Size**

```jsx
import { getButtonSize } from '../utils/age-appropriate'

const { px, description } = getButtonSize(childAge)
// Age 5: { px: 76, description: 'Extra large (76x76px minimum)' }
```

### **Get Auto-Save Interval**

```jsx
import { getSessionDuration } from '../utils/age-appropriate'

const { autoSaveInterval } = getSessionDuration(childAge)
// Age 5: 30 seconds
// Age 8: 60 seconds
// Age 12: 120 seconds
```

### **Get Max Choices**

```jsx
import { getMaxChoices } from '../utils/age-appropriate'

const maxChoices = getMaxChoices(childAge)
// Age 5: 3
// Age 8: 5
// Age 12: 7
```

### **Get Grid Spacing**

```jsx
import { getGridGapClasses } from '../utils/age-appropriate'

const gapClasses = getGridGapClasses(childAge)
// Age 5: 'gap-10' (40px)
// Age 8: 'gap-6' (24px)
// Age 12: 'gap-4' (16px)
```

---

## 🎨 Styling Patterns

### **Age-Appropriate Fonts**

```jsx
import { getFontSizeClasses } from '../utils/age-appropriate'

const headingClass = getFontSizeClasses(childAge, 'heading')
// Age 5: 'text-4xl md:text-5xl'
// Age 8: 'text-3xl md:text-4xl'
// Age 12: 'text-2xl md:text-3xl'
```

---

## 🔧 Configuration

### **Where Child Age is Stored**

```javascript
// Supabase user_metadata
{
  "child_age": 8,  // Integer (5-12)
  "child_name": "Emma",
  "onboarding_completed": true
}
```

### **How to Access Child Age**

```jsx
import { supabase } from '../lib/supabase'

const { data: { user } } = await supabase.auth.getUser()
const childAge = parseInt(user.user_metadata.child_age)
```

---

## 🚨 Common Pitfalls

### ❌ **Don't:**
```jsx
// Hard-code button sizes
<button className="w-16 h-16">Click</button>

// Forget auto-save
// (Kids will lose progress!)

// Show too many choices at once
{allOptions.map(opt => <Option />)}
```

### ✅ **Do:**
```jsx
// Use AgeButton
<AgeButton variant="primary">Click</AgeButton>

// Add auto-save
const { saveStatus, lastSaved } = useAutoSave('key', state)

// Limit choices
<ChoiceLimiter choices={allOptions} />
```

---

## 📊 Testing Shortcuts

### **Change Age in Browser Console**

```javascript
// Manually set age for testing
const { data, error } = await supabase.auth.updateUser({
  data: { child_age: 5 }
})
```

### **Force Auto-Save**

```javascript
const { forceSave } = useAutoSave('key', state)
await forceSave() // Saves immediately
```

### **Check Button Sizes**

```javascript
// In browser DevTools
document.querySelector('[role="button"]').getBoundingClientRect()
// Should show width/height: 76, 57, or 44
```

---

## 🎯 Implementation Checklist

When adding Phase 3 to a new game:

- [ ] Replace all `<button>` with `<AgeButton>`
- [ ] Add `useAutoSave` hook
- [ ] Display `<AutoSaveIndicator>`
- [ ] Use `<ChoiceLimiter>` if showing multiple options
- [ ] Use `<FunLoader>` instead of spinners
- [ ] Add `<VoiceInput>` for text fields (ages 5-8)
- [ ] Add `<ReadAloud>` to story/text output pages ⭐ **NEW!**
- [ ] Test with ages 5, 8, and 12
- [ ] Verify auto-save intervals
- [ ] Check button sizes in DevTools

---

## 🔗 Related Files

- `src/utils/age-appropriate.js` - All utility functions
- `src/components/AgeButton.jsx` - Smart button component
- `src/components/FunLoader.jsx` - Loading animations
- `src/components/VoiceInput.jsx` - Voice-to-text input
- `src/components/ReadAloud.jsx` - Text-to-Speech output ⭐ **NEW!**
- `src/components/ChoiceLimiter.jsx` - Choice management
- `src/hooks/useAutoSave.js` - Auto-save hook
- `PHASE-3-IMPLEMENTATION.md` - Full documentation
- `PHASE-3-TESTING.md` - Testing guide
- `FOCUS-GROUP-PHASE-3-MAPPING.md` - Focus group feedback tracking

---

## 💡 Pro Tips

1. **Always test with different ages** - A button perfect for age 12 might be too small for age 5
2. **Auto-save is critical** - Kids have shorter attention spans and less patience
6. **Read-Aloud helps emerging readers** - Ages 5-8 can enjoy content independently ⭐ **NEW!**
3. **Voice input removes barriers** - Ages 5-8 are still developing typing skills
4. **Choice limiting reduces overwhelm** - Research shows working memory capacity varies by age
5. **Fun loaders keep engagement** - Kids perceive spinners as "broken"

---

**Remember:** The goal is to make the app feel effortless and frustration-free for kids of all ages!
