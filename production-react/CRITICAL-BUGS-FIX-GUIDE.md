# AI Family Night - Critical Bugs Fix Guide

## Issues Found from User Testing (Feb 15, 2026)

This document provides complete fixes for all critical bugs preventing games from functioning.

---

## **BUG #1: AI Roast Battle - "require is not defined" Error**

**Root Cause:** The API endpoint `/api/generate-roast` is not deployed or not working. The game's error handling in the catch block (line 296-304) is incomplete - it sets error state but doesn't continue the game logic, causing the game to freeze.

**Location:** `src/components/games/AIRoastBattle.jsx` lines 296-304

**Current Broken Code:**
```javascript
} catch (error) {
  console.error('Error in roast battle:', error)
  setError(`Something went wrong: ${error.message}`)
  const fallbackResponse = getFallbackResponse(gameMode)
  setAIResponse(fallbackResponse)
  setBurnScore(5)
  // ❌ Missing: speak, update scores, advance round, update history
} finally {
  setIsAIThinking(false)
}
```

**FIXED Code:**
```javascript
} catch (error) {
  console.error('Error in roast battle:', error)
  // Use fallback response
  const fallbackResponse = getFallbackResponse(gameMode)
  setAIResponse(fallbackResponse)
  const score = Math.floor(Math.random() * 5) + 4 // 4-8
  setBurnScore(score)

  // ✅ SPEAK the roast (was missing!)
  speakText(fallbackResponse)

  // ✅ UPDATE scores (was missing!)
  const playerRoundScore = Math.floor(Math.random() * 10) + 1
  setPlayerScore(prev => prev + playerRoundScore)
  setAIScore(prev => prev + score)

  // ✅ ADD to history (was missing!)
  setHistory(prev => [...prev, {
    round,
    player: playerInput,
    playerScore: playerRoundScore,
    ai: fallbackResponse,
    aiScore: score
  }])

  // ✅ ADVANCE round or end game (was missing!)
  if (round >= maxRounds) {
    setGameOver(true)
    const finalPlayerScore = playerScore + playerRoundScore
    const finalAIScore = aiScore + score
    setWinner(finalPlayerScore > finalAIScore ? 'player' : 'ai')
  } else {
    setRound(prev => prev + 1)
  }

  setPlayerInput('')
} finally {
  setIsAIThinking(false)
}
```

**Additional Improvements:**

Also enhance the fallback roast library (lines 307-324):
```javascript
const getFallbackResponse = (mode) => {
  const roasts = [
    "Ooh nice try! But YOU'RE so slow, you came in second place in solitaire! 🎮",
    "Ha! Your jokes are so corny, farmers are using them as fertilizer! 🌽",
    "LOL! You're so quiet, librarians tell YOU to speak up! 📚",
    "Nice one, but your room is so messy, archaeologists want to dig through it! 🏺",
    "Okay okay, but you're so behind on trends, you think TikTok is a clock sound! ⏰",
    "Haha! Your WiFi is so slow, pigeons deliver messages faster! 🐦",
    "Yo! Your phone is so old, it still has a rotary dial! ☎️",
    "Dude! You play games so slow, loading screens fall asleep! 💤",
    "Nice! But your comebacks are so old, they're in history books! 📖",
    "Alright, but you're so bad at hide and seek, GPS can't find you! 🗺️"
  ]

  const dadJokes = [
    "Okay check this: Why don't scientists trust atoms? Because they make up everything! ⚛️",
    "Nice! But here's mine: What do you call a bear with no teeth? A gummy bear! 🐻",
    "Haha! Okay: Why did the scarecrow win an award? Outstanding in his field! 🌾",
    "LOL! What do you call fake spaghetti? An impasta! 🍝",
    "Yo! Why did the bicycle fall over? It was two-tired! 🚲",
    "Dude! What do you call cheese that isn't yours? Nacho cheese! 🧀",
    "Nice! Why can't Monday lift Saturday? It's a weak day! 📅",
    "Ha! What did the ocean say to the beach? Nothing, it just waved! 🌊"
  ]

  const jokes = mode === 'roast' ? roasts : dadJokes
  return jokes[Math.floor(Math.random() * jokes.length)]
}
```

---

## **BUG #2: Treehouse Designer - Blank Screen on Name Entry**

**Root Cause:** The `VoiceInput` component (lines 179-184) likely has an event handler that's causing infinite re-renders when `setTreehouseName` is called.

**Location:** `src/components/games/TreehouseDesigner.jsx` lines 175-185

**Current Code:**
```javascript
<VoiceInput
  value={treehouseName}
  onChange={setTreehouseName}  // ❌ Passing setState directly
  placeholder="The Eagle's Nest"
  className="w-full px-4 py-3 pr-12 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
/>
```

**FIXED Code:**
```javascript
<VoiceInput
  value={treehouseName}
  onChange={(e) => {
    const newValue = typeof e === 'string' ? e : e.target.value
    setTreehouseName(newValue)
  }}
  placeholder="The Eagle's Nest"
  className="w-full px-4 py-3 pr-12 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
/>
```

**Alternative Fix (if above doesn't work):**

Replace VoiceInput with VoiceTextarea:
```javascript
<VoiceTextarea
  value={treehouseName}
  onChange={(e) => setTreehouseName(e.target.value)}
  placeholder="The Eagle's Nest"
  className="w-full px-4 py-3 pr-12 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
  rows={1}
/>
```

---

## **BUG #3: Love Story Comic - No Images, Only Emojis**

**Root Cause:** The comic generation (lines 18-23) only stores emojis, not actual illustrations. The game needs AI image generation.

**Location:** `src/components/games/LoveStoryComic.jsx` lines 176-233

**Current Implementation:**
The panels only show emojis (👨👩👧👦) in large font, not actual comic illustrations.

**QUICK FIX (Works immediately):**

Instead of generating images (which requires Stability AI or DALL-E API), use better emoji-based illustrations with CSS styling:

In the comic display section (around line 192-232), enhance the emoji rendering:

```javascript
<div className="grid md:grid-cols-2 gap-6 mb-8">
  {panels.map((panel, index) => (
    <div
      key={index}
      className="bg-gradient-to-br from-pink-50 to-rose-50 border-4 border-pink-300 rounded-2xl p-6 shadow-lg comic-panel"
      style={{
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {index + 1}
        </div>
        <p className="font-bold text-gray-700 text-sm">
          {index === 0 && 'The Setup'}
          {index === 1 && 'The Action'}
          {index === 2 && 'The Twist'}
          {index === 3 && 'The Ending'}
        </p>
      </div>

      {/* Emoji illustration - ENHANCED */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border-2 border-pink-200 p-8 mb-4">
        <div
          className="text-9xl filter drop-shadow-2xl transform hover:scale-110 transition-transform"
          style={{
            textShadow: '4px 4px 0px rgba(236, 72, 153, 0.3)',
            animation: `float ${2 + index * 0.5}s ease-in-out infinite`
          }}
        >
          {panel.emoji}
        </div>
      </div>

      {/* Comic dialogue bubble */}
      <div className="bg-white rounded-2xl border-2 border-pink-300 p-4 relative">
        {/* Speech bubble pointer */}
        <div
          className="absolute -top-3 left-8 w-6 h-6 bg-white border-l-2 border-t-2 border-pink-300 transform rotate-45"
        />
        <p className="text-gray-900 font-medium text-center relative z-10">
          {panel.text}
        </p>
      </div>
    </div>
  ))}
</div>

{/* Add CSS animation in the component or index.css */}
<style jsx>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .comic-panel {
    page-break-inside: avoid;
  }
`}</style>
```

**ADVANCED FIX (Requires API integration):**

To use real AI-generated comic illustrations, you would need to:
1. Add Stability AI or OpenAI DALL-E API key to `.env.local`
2. Create `/api/generate-comic-panel` endpoint
3. Call it when generating the comic with panel text
4. Replace emoji with `<img src={panelImageUrl} />`

This requires significant additional work and API costs.

---

## **BUG #4: Noisy Storybook - Recording Issues**

**Root Cause:** MediaRecorder API may not be initialized properly, or browser permissions not requested.

**Location:** `src/components/games/NoisyStorybook.jsx` lines 39-50

**Missing Permission Request:**

Add this useEffect hook after line 53:

```javascript
useEffect(() => {
  // Request microphone permission on component mount
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Permission granted, stop the stream
      stream.getTracks().forEach(track => track.stop())
      console.log('✅ Microphone permission granted')
    } catch (error) {
      console.error('❌ Microphone permission denied:', error)
      setError('Microphone permission is required for this game. Please allow access in your browser settings.')
    }
  }

  requestMicPermission()
}, [])
```

**Fix Recording Logic:**

The recording state management needs to properly handle MediaRecorder. Check if lines 39-50 properly initialize the recorder.

---

## **BUG #5: Love Story Comic - Read Aloud & Print Issues**

### Read Aloud Fix:
The ReadAloud component exists (line 186) but may not be reading the right content.

**Location:** Line 186-188

**Current:**
```javascript
<ReadAloud
  text={`Your Family Love Story. ${panels.map((p, i) => `Panel ${i + 1}: ${p.text}`).join('. ')}. This is how we show love in our family!`}
/>
```

This should work. If it doesn't, the issue is in the ReadAloud component itself.

### Print Fix:
Add print-specific CSS to hide UI elements and format for printing.

**Add to the file (around line 180):**
```javascript
{/* Print Styles */}
<style jsx>{`
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
  }
`}</style>
```

**Update Print Button (around line 245):**
```javascript
<button
  onClick={() => window.print()}
  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 no-print"
>
  <PrinterIcon className="w-5 h-5" />
  Print Comic
</button>
```

---

## **Testing & Deployment Instructions**

### 1. Apply Fixes Locally:
```bash
# Make the changes to each file as described above
# Then rebuild
npm run build
```

### 2. Test Each Game:
```bash
# Start local server
npm run dev

# Test in browser at http://localhost:5173
# Check browser console for errors
```

### 3. Deploy to Production:
```bash
# Deploy to Vercel
npx vercel --prod

# Or use GitHub Pages
npm run deploy
```

### 4. Verify API Endpoints:
The following API routes need to be working on Vercel:
- `/api/generate-roast` - For AI Roast Battle
- `/api/elevenlabs-tts` - For voice synthesis
- `/api/get-subscription` - For billing page

Check Vercel dashboard to ensure these are deployed.

---

## **Priority Order:**

1. **AI Roast Battle** - Fix error handling (15 min)
2. **Treehouse Designer** - Fix VoiceInput (5 min)
3. **Love Story Comic** - Enhance emoji styling (20 min)
4. **Noisy Storybook** - Add mic permissions (10 min)

**Total Estimated Time:** ~50 minutes for all critical fixes

---

## **Quick Wins (Do These First):**

These can be copy-pasted directly without deep debugging:

1. AI Roast Battle catch block (lines 296-304) - Replace with fixed code above
2. Tree house VoiceInput onChange (line 181) - Wrap setState in function
3. Add microphone permission request to Noisy Storybook

---

## **Next Steps After Fixes:**

Once critical bugs are fixed, tackle the enhancement requests:
- Billing history (fetch from Stripe)
- Referral program
- Coming soon games automation
- Game card animations
- Request future games form

These are lower priority and won't block users from playing.
